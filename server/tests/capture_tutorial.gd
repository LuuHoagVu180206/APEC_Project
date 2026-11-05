extends SceneTree

const OUT = "D:/DEMO_MAZE_FOLDER/DEMOMAZE/LobbyScene/OptionMenu/TutorUI/Art/Gameplay/"
func _initialize() -> void:
	_run.call_deferred()

func snap(name: String) -> void:
	await create_timer(0.7).timeout
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(OUT + name + ".png")

func answer(bank: Control) -> void:
	bank.receive_answer(bank.current_correct_answer)
	bank._on_submit_pressed()

func _run() -> void:
	DirAccess.make_dir_recursive_absolute(OUT)
	root.size = Vector2i(1152, 648)
	var gs = root.get_node("GlobalScript")
	gs.reset_room_context()
	gs.current_set_title = "Bộ câu hỏi minh hoạ"
	gs.loaded_questions = []
	for level in ["easy", "medium", "hard"]:
		gs.loaded_questions.append({"questionText": "Loài động vật nào thường được nuôi để lấy sữa?", "options": ["Bò sữa", "Gà mái", "Heo", "Vịt"], "correctAnswer": "Bò sữa", "difficulty": level})
	var game = load("res://FarmLandGame/farm_land_game.tscn").instantiate()
	root.add_child(game)
	current_scene = game
	game.get_node("DevCheat").hide()
	await snap("01_targets")
	var core = game.capture_core
	var bank = game.question_scene
	for animal in range(4):
		core.select_target(animal)
		if animal == 0:
			await snap("02_gate")
		answer(bank)
		bank._skip_and_continue()
		if animal == 0:
			await snap("03_walking")
		game.player.speed = 600
		while core.state == core.State.MOVING_TO_TARGET:
			await physics_frame
		if core.state != core.State.CHOOSING_CAPTURE_DIFFICULTY:
			push_error("Tutorial capture: failed to arrive")
			quit(1)
			return
		if animal == 0:
			await snap("04_difficulty")
		while core.state == core.State.CHOOSING_CAPTURE_DIFFICULTY:
			core.choose_capture_difficulty("hard")
			if animal == 0 and core.progress[0] == 0:
				await snap("05_capture")
			answer(bank)
			if animal == 0 and core.progress[0] == 4:
				await snap("06_reward")
			bank._skip_and_continue()
		if animal < 3:
			await create_timer(0.8).timeout
	await snap("07_victory")
	paused = false
	game.queue_free()
	await process_frame
	var results = load("res://GamePlayedStatisticUI/game_play_stats_ui.tscn").instantiate()
	root.add_child(results)
	current_scene = results
	await snap("08_results")
	results.queue_free()
	await process_frame
	var join = load("res://JoinRoomScene/join_room_scene.tscn").instantiate()
	root.add_child(join)
	current_scene = join
	await snap("09_join")
	join.queue_free()
	await process_frame
	print("PASS: tutorial screenshots captured from running gameplay")
	quit()
