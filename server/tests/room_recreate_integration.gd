extends SceneTree

var _failed = false

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var gs = root.get_node("GlobalScript")
	var net = root.get_node("Network")
	var http = HTTPRequest.new()
	root.add_child(http)
	http.request("http://localhost:5000/api/sets/defaults")
	var response = await http.request_completed
	var sets = JSON.parse_string(response[3].get_string_from_utf8())
	http.queue_free()
	if not sets is Array or sets.is_empty():
		push_error("Integration test requires the local backend and a public default set")
		quit(1)
		return
	for attempt in range(300):
		if net.is_ready_to_send():
			break
		await process_frame
	for cycle in range(3):
		change_scene_to_file("res://CreateRoomScene/create_room_scene.tscn")
		await process_frame
		await process_frame
		var create = current_scene
		create._on_room_set_selected(sets[cycle % sets.size()])
		# Exercise the public casual flow without touching another account's room.
		gs.clear_user_session()
		create.player_name_input.text = "Room cycle regression"
		if cycle == 1:
			# Reproduce the stale CONNECTED flag before the addon polls a closed peer.
			net._websocket.close()
			if net.is_ready_to_send():
				push_error("Closed websocket is incorrectly reported as ready")
				quit(1)
				return
		create._on_create_room_button_pressed()
		var deadline = Time.get_ticks_msec() + 8000
		while current_scene == create and Time.get_ticks_msec() < deadline:
			await process_frame
		if current_scene == create:
			push_error("Recreate cycle %d timed out: %s" % [cycle + 1, create.status_label.text])
			quit(1)
			return
		print("PASS: create cycle ", cycle + 1)
		current_scene.back_button.pressed.emit()
		await process_frame
		await process_frame
		if not gs.current_room_pin.is_empty():
			push_error("Room context remains after leaving")
			quit(1)
			return
	print("PASS: create -> lobby -> recreate, including a stale closed websocket")
	quit(0)
