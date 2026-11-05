extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var gs = root.get_node("GlobalScript")
	gs.is_host = true
	gs.teacher_participates = true
	gs.room_type = "casual"
	gs.room_game_state = "PLAYING"
	var game = load("res://FarmLandGame/farm_land_game.tscn").instantiate()
	root.add_child(game)
	current_scene = game
	game.time_elapsed = 12.0
	game.questions_answered = 2
	var position_before = game.player.position
	game._on_host_pressed_end_game_in_gameplay()
	if not is_instance_valid(game._end_preview) or game.process_mode != Node.PROCESS_MODE_DISABLED:
		push_error("Preview must keep and suspend the existing gameplay")
		quit(1)
		return
	var board = game._end_preview.get_child(0)
	if not is_instance_valid(board._resume_button) or not board._resume_button.visible:
		push_error("Missing resume gameplay button")
		quit(1)
		return
	board._resume_button.pressed.emit()
	if current_scene != game or game.player.position != position_before or game.questions_answered != 2 or game.time_elapsed < 12.0:
		push_error("Returning reset gameplay progress")
		quit(1)
		return
	if gs.room_game_state != "PLAYING" or gs.host_ended_match:
		push_error("Preview must not end the match")
		quit(1)
		return
	game._on_host_pressed_end_game_in_gameplay()
	if not is_instance_valid(game._end_preview):
		push_error("Cannot reopen preview after cancelling")
		quit(1)
		return
	game._resume_gameplay_from_preview()
	print("PASS: preview, cancel, preserve gameplay progress and reopen")
	quit(0)
