extends SceneTree

func _initialize() -> void:
	_run.call_deferred()

func _run() -> void:
	root.size = Vector2i(1152, 720)
	root.get_node("GlobalScript").loaded_questions = [{"questionText": "Loài động vật nào sau đây thường được nuôi để lấy sữa trong các trang trại?", "options": ["Con bò sữa", "Con gà mái", "Con heo", "Con cừu"], "correctAnswer": "Con bò sữa", "difficulty": "easy"}]
	var game = load("res://FarmLandGame/farm_land_game.tscn").instantiate()
	root.add_child(game)
	current_scene = game
	await create_timer(1).timeout
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/capture_selection.png")
	game.capture_core._hud_toggle.pressed.emit()
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/capture_selection_collapsed.png")
	game.capture_core._hud_toggle.pressed.emit()
	game.capture_core.select_target(0)
	await create_timer(0.7).timeout
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/travel_question.png")
	game.question_scene._on_graded(100, "", true)
	game.question_scene._skip_and_continue()
	game.player.cancel_path()
	game.capture_core._on_arrived(true)
	await create_timer(0.7).timeout
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/capture_difficulty_picker.png")
	game.capture_core.choose_capture_difficulty("easy")
	await create_timer(1).timeout
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/capture_question.png")
	game.get_node("DevCheat")._toggle_panel()
	await create_timer(0.2).timeout
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/capture_cheats.png")
	root.size = Vector2i(640, 540)
	await create_timer(1).timeout
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/capture_question_small.png")
	quit()
