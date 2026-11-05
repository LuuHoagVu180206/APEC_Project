extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var gs = root.get_node("GlobalScript")
	gs.is_host = true
	gs.is_logged_in = true
	gs.current_username = "TestHost"
	gs.current_room_pin = "123456"
	gs.room_type = "casual"
	gs.room_game_state = "PLAYING"
	var screen = load("res://GamePlayedStatisticUI/game_play_stats_ui.tscn").instantiate()
	root.add_child(screen)
	if screen.return_button.visible or not screen.save_button.visible or not screen.host_live_scores_button.visible:
		push_error("Host results must allow saving and finish/view, but not leaving")
		quit(1)
		return
	screen._on_return_button_pressed()
	if gs.current_room_pin != "123456":
		push_error("Host bypassed the result screen exit guard")
		quit(1)
		return
	gs.is_host = false
	if screen._is_room_host():
		push_error("Member incorrectly receives host exit restriction")
		quit(1)
		return
	gs.is_host = true
	gs.room_type = "solo"
	if screen._is_room_host():
		push_error("Solo game incorrectly receives room restriction")
		quit(1)
		return
	print("PASS: host results action and exit guard; member and solo unaffected")
	quit(0)
