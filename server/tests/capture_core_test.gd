extends SceneTree

const Pool = preload("res://FarmLandGame/Core/capture_question_pool.gd")
var errors: Array[String] = []

func _initialize() -> void:
	call_deferred("_run")

func check(value: bool, message: String) -> void:
	if not value:
		errors.append(message)
		push_error(message)

func questions() -> Array:
	var result: Array = []
	for level in ["easy", "medium", "hard"]:
		for i in range(3):
			result.append({"questionText": "%s %d: 1 + 1?" % [level, i], "options": ["1", "2", "3", "4"], "correctAnswer": "2", "difficulty": level})
	return result

func _run() -> void:
	check(Pool.difficulty_for_distance(0) == "easy", "adjacent threshold")
	check(Pool.difficulty_for_distance(5) == "easy", "5 steps threshold")
	check(Pool.difficulty_for_distance(6) == "medium", "6 steps threshold")
	check(Pool.difficulty_for_distance(10) == "medium", "10 steps threshold")
	check(Pool.difficulty_for_distance(11) == "hard", "11 steps threshold")
	var pool = Pool.new()
	pool.configure(questions())
	pool.take("easy")
	var seen: Array = []
	for i in range(3):
		seen.append(pool.take("medium").questionText)
	check(seen[0] != seen[1] and seen[1] != seen[2] and seen[0] != seen[2], "pool repeats before exhausted")
	pool.take("medium")
	check(pool.remaining.easy.size() == 2, "medium reset changed easy pool")
	pool.configure([])
	check(pool.take("hard").is_empty(), "empty pool is unsafe")
	pool.configure([questions()[0]])
	check(pool.take("hard").difficulty == "easy", "missing difficulty fallback uses wrong reward level")
	var gs = root.get_node("GlobalScript")
	gs.reset_room_context()
	gs.loaded_questions = questions()
	var game = load("res://FarmLandGame/farm_land_game.tscn").instantiate()
	root.add_child(game)
	current_scene = game
	var core = game.capture_core
	for i in range(30):
		await physics_frame
		if core.ready_for_selection:
			break
	check(core.animals.size() == 4, "map did not spawn four animals")
	check(not game.player.has_node("DirectionalMovement"), "old movement UI remains")
	print("NAV: ", core.navigation.grid.region, " actor ", core.navigation.world_cell(game.player.global_position))
	game.player.speed = 4000
	var nav = core.navigation
	var start = nav.world_cell(game.player.global_position)
	var near = start
	for direction in nav.DIRECTIONS:
		if nav.grid.is_in_boundsv(start + direction) and not nav.grid.is_point_solid(start + direction):
			near = start + direction
			break
	check(nav.route(nav.world_position(start), nav.world_position(near)).size() == 2, "adjacent animal must cost one step")
	nav.grid.set_point_solid(near, true)
	var approach = nav.route(nav.world_position(start), nav.world_position(near))
	check(not approach.is_empty() and approach.back() != near, "blocked animal tile needs reachable approach tile")
	for direction in nav.DIRECTIONS:
		if nav.grid.is_in_boundsv(start + direction):
			nav.grid.set_point_solid(start + direction, true)
	check(nav.route(nav.world_position(start), core.animals[0].global_position).is_empty(), "enclosed player should have no route")
	var enclosure = StaticBody2D.new()
	var enclosure_shape = CollisionShape2D.new()
	enclosure_shape.shape = RectangleShape2D.new()
	enclosure_shape.shape.size = Vector2(48, 48)
	enclosure.add_child(enclosure_shape)
	game.add_child(enclosure)
	enclosure.global_position = game.player.global_position
	await physics_frame
	await physics_frame
	core.select_target(0)
	check(core.state == core.State.SELECTING_TARGET, "no route must return to selection")
	enclosure.queue_free()
	await physics_frame
	await physics_frame
	nav.build(game.tile_map_scene, game.player)
	# A new physical obstacle after pathfinding must stop movement safely.
	var original_position: Vector2 = game.player.global_position
	core.select_target(0)
	game.question_scene._on_graded(100, "", true)
	game.question_scene._skip_and_continue()
	var route = nav.route(original_position, core.animals[0].global_position)
	if route.size() > 1:
		var obstacle = StaticBody2D.new()
		var shape = CollisionShape2D.new()
		shape.shape = RectangleShape2D.new()
		shape.shape.size = Vector2(16, 16)
		obstacle.add_child(shape)
		game.add_child(obstacle)
		obstacle.global_position = nav.world_position(route[1])
		await physics_frame
		await physics_frame
		await physics_frame
		check(core.state == core.State.SELECTING_TARGET and not game.player.is_moving, "new obstacle failed to stop auto movement")
		obstacle.queue_free()
		await physics_frame
		await physics_frame
	game.player.cancel_path()
	game.player.global_position = original_position
	core.state = core.State.SELECTING_TARGET
	nav.build(game.tile_map_scene, game.player)
	for index in range(4):
		var path = core.navigation.route(game.player.global_position, core.animals[index].global_position)
		print("PATH ", index, " steps=", path.size() - 1)
		check(not path.is_empty(), "animal is unreachable on real map: %d" % index)
		if path.is_empty():
			continue
		for cell in path:
			check(not core.navigation.blocked(cell), "route crosses a collision cell")
		check(path.size() - 1 == shortest_distance(nav, path.front(), path.back()), "AStar route was not shortest")
		core.select_target(index)
		core.select_target((index + 1) % 4)
		check(core.target == index, "target changed during movement")
		var bank = game.question_scene
		var position_before: Vector2 = game.player.global_position
		var gate_question: String = bank.current_question
		var remaining_before = core.pool.remaining.duplicate(true)
		check(core.state == core.State.ANSWERING_TRAVEL_QUESTION and not game.player.is_moving, "player moved before gate question")
		check(bank.active_capture_difficulty == Pool.difficulty_for_distance(path.size() - 1), "gate difficulty does not match route length")
		core._on_question_finished()
		check(not game.player.is_moving, "unanswered gate can be bypassed")
		bank._on_graded(0, "", false)
		core._on_retry()
		check(bank.current_question == gate_question and core.pool.remaining == remaining_before, "wrong gate answer picked another question")
		check(game.player.global_position == position_before and core.progress[index] == 0, "wrong gate answer moved or rewarded player")
		bank._on_graded(100, "", true)
		bank._skip_and_continue()
		check(core.state == core.State.MOVING_TO_TARGET and core.progress[index] == 0, "correct gate must only unlock movement")
		var deadline = Time.get_ticks_msec() + 12000
		while core.state == core.State.MOVING_TO_TARGET and Time.get_ticks_msec() < deadline:
			await physics_frame
		check(core.state == core.State.CHOOSING_CAPTURE_DIFFICULTY, "arrival must offer difficulty choice")
		if core.state != core.State.CHOOSING_CAPTURE_DIFFICULTY:
			break
		for wrong in range(3):
			core.choose_capture_difficulty(Pool.LEVELS[wrong])
			bank._on_graded(0, "", false)
			check(core.progress[index] == 0, "wrong answer awarded capture points")
			if index == 0 and wrong == 0:
				var retry_deadline = Time.get_ticks_msec() + 8000
				while core.state == core.State.CAPTURING and Time.get_ticks_msec() < retry_deadline:
					await process_frame
			else:
				core._on_retry()
			check(core.state == core.State.CHOOSING_CAPTURE_DIFFICULTY, "wrong capture answer did not return to difficulty picker")
		for correct in range(8):
			if core.state != core.State.CHOOSING_CAPTURE_DIFFICULTY:
				break
			var chosen: String = Pool.LEVELS[correct % 3]
			core.choose_capture_difficulty(chosen)
			check(bank.active_capture_difficulty == chosen, "capture ignored chosen difficulty")
			core.choose_capture_difficulty("hard")
			check(bank.active_capture_difficulty == chosen, "difficulty changed during an active question")
			var before: int = core.progress[index]
			var reward: int = Pool.REWARDS[bank.active_capture_difficulty]
			bank._on_graded(100, "", true)
			bank._on_graded(100, "", true)
			check(core.progress[index] == mini(12, before + reward), "double submit or incorrect capture reward")
			bank._skip_and_continue()
		check(core.collected[index] and core.progress[index] == 12, "animal not captured at 12 points")
		if index < 3:
			await create_timer(0.7).timeout
			core.select_target(index)
			check(core.state == core.State.SELECTING_TARGET, "collected animal selectable again")
	check(core.state == core.State.VICTORY, "4/4 did not trigger victory")
	check(game._victory_presented, "existing victory UI not activated")
	core.instant_victory()
	check(core.collected.count(true) == 4, "victory duplicated collection")
	paused = false
	game.queue_free()
	await process_frame
	# Reloading during movement/capture must not retain callbacks or pool/progress.
	for phase in ["moving", "capturing", "cheat_moving", "cheat_capturing"]:
		gs.loaded_questions = questions()
		game = load("res://FarmLandGame/farm_land_game.tscn").instantiate()
		root.add_child(game)
		current_scene = game
		core = game.capture_core
		for i in range(30):
			await physics_frame
			if core.ready_for_selection:
				break
		check(core.progress == [0, 0, 0, 0] and core.collected.count(true) == 0, "scene reload retained capture state")
		core.select_target(0)
		game.question_scene._on_graded(100, "", true)
		game.question_scene._skip_and_continue()
		if phase.contains("capturing"):
			game.player.cancel_path()
			core._on_arrived(true)
			core.choose_capture_difficulty("easy")
			# Explicitly exercise each reward and clamp independently of map spawns.
			for level in ["easy", "medium", "hard"]:
				core.progress[0] = 0
				core._on_answer(true, level)
				check(core.progress[0] == Pool.REWARDS[level], "incorrect reward for " + level)
			core.progress[0] = 11
			core._on_answer(true, "hard")
			check(core.progress[0] == 12, "reward exceeded 12")
		if phase.begins_with("cheat"):
			var cheat = game.get_node("DevCheat")
			check(cheat.has_node("DevCheatToggle"), "cheat toggle missing from debug gameplay")
			cheat._toggle_panel()
			cheat.time_input.value = 17.5
			cheat.panel.get_node("Options/SetPlayedTime").pressed.emit()
			check(is_equal_approx(game.time_elapsed, 17.5), "set time cheat did not sync game timer")
			cheat.panel.get_node("Options/InstantVictory").pressed.emit()
			check(not game.player.is_moving and not game.question_scene.visible and game._victory_presented, "instant victory left pending gameplay active")
			paused = false
		game.queue_free()
		await process_frame
	await create_timer(1.5).timeout
	if errors.is_empty():
		print("PASS: thresholds, pools, real map/collision/approach/no-route, movement, rewards, double submit, victory, cheat and scene reload")
	quit(0 if errors.is_empty() else 1)

func shortest_distance(nav: RefCounted, start: Vector2i, end: Vector2i) -> int:
	var queue: Array[Vector2i] = [start]
	var steps = {start: 0}
	var head = 0
	while head < queue.size():
		var cell = queue[head]
		head += 1
		if cell == end:
			return steps[cell]
		for direction in nav.DIRECTIONS:
			var next = cell + direction
			if not steps.has(next) and nav.grid.is_in_boundsv(next) and not nav.grid.is_point_solid(next):
				steps[next] = steps[cell] + 1
				queue.append(next)
	return -1
