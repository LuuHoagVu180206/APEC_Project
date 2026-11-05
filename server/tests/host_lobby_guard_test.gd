extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var gs = root.get_node("GlobalScript")
	gs.is_host = true
	gs.current_room_pin = "123456"
	gs.room_type = "casual"
	gs.room_game_state = "PLAYING"
	var board = load("res://CreateRoomScene/LiveResultWatchingScene/live_result_watching_scene.tscn").instantiate()
	root.add_child(board)
	if not board.back_button.disabled or board._can_return_to_lobby():
		push_error("Host can leave an active match")
		quit(1)
		return
	board.back_button.pressed.emit()
	if gs.current_room_pin != "123456":
		push_error("Leave handler bypassed the active match guard")
		quit(1)
		return
	# Local completion is insufficient until the server ends the room match.
	board.current_match_state = board.MatchState.FINISHED
	if board._can_return_to_lobby():
		push_error("Local completion unlocked the lobby too soon")
		quit(1)
		return
	gs.room_game_state = "FINISHED"
	gs.host_end_game.emit()
	if board.back_button.disabled or not board._can_return_to_lobby():
		push_error("Lobby remains locked after match end")
		quit(1)
		return
	print("PASS: active match exit blocked; server match end unlocks lobby")
	quit(0)
