extends SceneTree
func _initialize() -> void:
	_run.call_deferred()
func _run() -> void:
	root.size = Vector2i(1152, 648)
	var scene = load("res://LobbyScene/OptionMenu/TutorUI/GamesTutorSet/collecting_game_ui.tscn").instantiate()
	root.add_child(scene)
	current_scene = scene
	var panel = scene.get_node("TutorPanel")
	await create_timer(0.8).timeout
	for i in range(panel.title_text.size()):
		panel.current_index = i
		panel._update_tutor_content()
		await process_frame
		assert(panel.tutor_image.texture != null)
		assert(panel.tutor_label.get_rect().end.y < panel.get_node("HBoxControls").position.y)
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("C:/Users/Admin/.codex/visualizations/2026/11/04/01a1a70e-7164-70f3-aaff-5e64eb3ad2bd/tutorial_%02d.png" % i)
	print("PASS: all 11 tutorial pages have screenshots and text clears controls")
	quit()
