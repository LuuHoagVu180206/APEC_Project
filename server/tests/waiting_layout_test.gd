extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var gs = root.get_node("GlobalScript")
	gs.current_set_title = "Hoá Học Kỳ Thú & Thế Giới Nguyên Tố - APEC Group ".repeat(8)
	var waiting = load("res://WaitingScene/waiting_scene.tscn").instantiate()
	root.add_child(waiting)
	waiting._process(0.5)
	var label = waiting.get_node("Panel/SelectedSetTitle")
	var sprite = waiting.get_node("Panel/CharHolder/RunningCharAnimation/RunningCharAnimation")
	if label.get_global_rect().end.y > sprite.to_global(-sprite.sprite_frames.get_frame_texture(sprite.animation, sprite.frame).get_size() / 2.0).y:
		push_error("Long set title overlaps the waiting animation")
		quit(1)
		return
	if label.max_lines_visible != 2 or label.tooltip_text != gs.current_set_title:
		push_error("Long title must be bounded and preserve its full tooltip")
		quit(1)
		return
	var button = Button.new()
	preload("res://GeneralArt/Themes/cozy_action_button.gd").apply(button, true)
	if not button.get_theme_stylebox("hover") is StyleBoxTexture:
		push_error("Action button does not use Cozyland textures")
		quit(1)
		return
	button.free()
	print("PASS: long waiting titles cannot overlap animation; Cozyland action styles load")
	quit(0)
