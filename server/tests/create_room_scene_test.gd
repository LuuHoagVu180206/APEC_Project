extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var gs = root.get_node("GlobalScript")
	var scene = load("res://CreateRoomScene/create_room_scene.tscn").instantiate()
	root.add_child(scene)
	for role in ["guest", "user", "admin", "teacher"]:
		gs.set_user_session("Tester", "test-token", role)
		var expected_count = 2 if role == "teacher" else 1
		if scene.room_type_option.item_count != expected_count:
			push_error("Unexpected room options for role: " + role)
			quit(1)
			return
		if role == "teacher":
			scene.room_type_option.select(1)
			scene._on_room_type_selected(1)
			if not scene.class_code_input.visible:
				push_error("Teacher cannot enter class code")
				quit(1)
				return
	gs.clear_user_session()
	if scene.room_type_option.item_count != 1 or scene.class_code_input.visible:
		push_error("Classroom option remains after logout")
		quit(1)
		return
	gs.set_user_session("Tester", "", "teacher")
	if scene.room_type_option.item_count != 1:
		push_error("Teacher without session can select classroom")
		quit(1)
		return
	if not scene.create_button.disabled:
		push_error("Create must be disabled until a set is selected")
		quit(1)
		return
	scene._on_create_room_button_pressed()
	if not "chọn bộ câu hỏi" in scene.status_label.text:
		push_error("Missing required set message")
		quit(1)
		return
	scene._open_room_set_picker()
	var picker = scene.get_node("RoomSetPicker")
	if not picker.room_selection_mode:
		push_error("Picker launched solo instead of room selection")
		quit(1)
		return
	picker._select_and_launch_game({"_id": "default_fallback", "questions": []})
	if not scene.create_button.disabled:
		push_error("Fallback or empty set allowed room creation")
		quit(1)
		return
	picker._select_and_launch_game({"_id": "444444444444444444444444", "title": "Cozy quiz", "questions": ["q1"]})
	if scene.create_button.disabled or gs.current_set_title != "Cozy quiz":
		push_error("Room selection did not enable create")
		quit(1)
		return
	var live = load("res://CreateRoomScene/LiveResultWatchingScene/live_result_watching_scene.gd").new()
	if "Giáo viên" in live._player_role_label({"role": "user", "isHost": true}):
		push_error("Non-teacher host rendered as teacher")
		quit(1)
		return
	live.free()
	var net = root.get_node("Network")
	net._apply_room_snapshot({"pin": "123456", "playerId": "p1", "resumeToken": "private-key", "setId": "444444444444444444444444", "setTitle": "Cozy quiz", "gameState": "WAITING", "players": [{"playerId": "p1", "role": "user", "isHost": false}]})
	if gs.current_room_pin != "123456" or gs.room_resume_token != "private-key" or gs.player_data.size() != 1:
		push_error("Room snapshot did not restore context")
		quit(1)
		return
	gs.reset_room_context()
	print("PASS: role restrictions, required set picker, role labels and room snapshot restoration")
	quit(0)
