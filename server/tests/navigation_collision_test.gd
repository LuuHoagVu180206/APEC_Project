extends SceneTree

var errors: Array[String] = []

func _initialize() -> void:
	_run.call_deferred()

func check(value: bool, message: String) -> void:
	if not value:
		errors.append(message)
		push_error(message)

func _run() -> void:
	var gs = root.get_node("GlobalScript")
	gs.reset_room_context()
	gs.loaded_questions = [{"questionText": "1+1?", "options": ["2", "3"], "correctAnswer": "2", "difficulty": "easy"}]
	var game = load("res://FarmLandGame/farm_land_game.tscn").instantiate()
	root.add_child(game)
	current_scene = game
	await process_frame
	await physics_frame
	await process_frame
	var core = game.capture_core
	var nav = core.navigation
	check(nav._tile_collision_cells.size() > 100, "navigation omitted TileSet collision polygons")
	for cell in nav._tile_collision_cells:
		if nav.grid.is_in_boundsv(cell):
			check(nav.grid.is_point_solid(cell), "collision tile is walkable: " + str(cell))
	var source = Vector2i.ZERO
	for cell in nav.cells:
		var clear = true
		for offset in [Vector2i.ZERO, Vector2i.RIGHT, Vector2i.UP, Vector2i.UP + Vector2i.RIGHT]:
			if not nav.grid.is_in_boundsv(cell + offset) or nav.grid.is_point_solid(cell + offset):
				clear = false
		if clear:
			source = cell
			break
	var destination: Vector2i = source + Vector2i.RIGHT
	var barrier = StaticBody2D.new()
	var shape = CollisionShape2D.new()
	shape.shape = RectangleShape2D.new()
	shape.shape.size = Vector2(0.2, 8)
	barrier.add_child(shape)
	game.add_child(barrier)
	barrier.global_position = (nav.world_position(source) + nav.world_position(destination)) / 2
	await physics_frame
	await physics_frame
	nav.build(game.tile_map_scene, game.player)
	check(not nav.blocked(source) and not nav.blocked(destination), "fixture should have two clear endpoints")
	check(not nav.can_traverse(nav.world_position(source), nav.world_position(destination)), "thin edge barrier was missed")
	var detour = nav.route(nav.world_position(source), nav.world_position(destination))
	check(detour.size() > 2, "route crosses barrier between otherwise clear cells")
	check(nav.validate_path(nav.world_position(source), detour), "detour is not physically traversable")
	game.player.global_position = nav.world_position(source)
	game.player.follow_path(nav.points(detour))
	for step in range(600):
		game.player._physics_process(1.0 / 60)
		if not game.player.is_moving:
			break
	check(game.player.global_position.distance_to(nav.world_position(destination)) < 0.1, "player failed to follow safe detour at normal speed")
	barrier.queue_free()
	# Toggle stays accessible when the panel is collapsed and preserves state.
	core._hud_toggle.pressed.emit()
	check(not core._panel.visible and core._hud_toggle.visible, "HUD cannot be collapsed/reopened")
	core._hud_toggle.pressed.emit()
	check(core._panel.visible, "HUD did not reopen")
	core._set_hud_visible(false)
	check(not core._hud_toggle.visible, "HUD toggle covers question/victory screen")
	game.queue_free()
	await process_frame
	if errors.is_empty():
		print("PASS: TileSet collision cells, swept edges, safe detour at normal speed, HUD collapse/reopen")
	quit(0 if errors.is_empty() else 1)
