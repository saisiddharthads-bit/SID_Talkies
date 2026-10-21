extends Node2D
class_name Character

@onready var state_machine: CharacterStateMachine = $StateMachine
@onready var touch_handler: TouchHandler = $TouchArea

var current_expression: String = "idle"
var current_animation: String = "idle"

# Procedural animation parameters
var breath_time: float = 0.0
var blink_timer: float = 0.0
var is_blinking: bool = false
var bounce_offset: float = 0.0
var wobble_angle: float = 0.0
var mouth_openness: float = 0.0
var eye_scale_y: float = 1.0

# Colors
const FUR_ORANGE = Color(0.96, 0.55, 0.22, 1.0)
const FUR_CREAM = Color(0.99, 0.92, 0.82, 1.0)
const CHEEK_PINK = Color(0.98, 0.60, 0.65, 0.7)
const EYE_DARK = Color(0.15, 0.16, 0.22, 1.0)
const EYE_HIGHLIGHT = Color(1.0, 1.0, 1.0, 0.9)

func _ready() -> void:
	EventBus.chat_message_received.connect(_on_chat_response)
	state_machine.state_entered.connect(_on_state_entered)

func _process(delta: float) -> void:
	breath_time += delta * 2.0
	
	# Breathing motion
	scale.y = 1.0 + sin(breath_time) * 0.025
	scale.x = 1.0 - sin(breath_time) * 0.015

	# Eye blinking logic
	blink_timer += delta
	if blink_timer > 3.5:
		is_blinking = true
		eye_scale_y = lerp(eye_scale_y, 0.1, delta * 25.0)
		if blink_timer > 3.7:
			blink_timer = 0.0
			is_blinking = false
	else:
		eye_scale_y = lerp(eye_scale_y, 1.0, delta * 15.0)

	# Animation transitions
	match current_animation:
		"dance":
			position.x = sin(breath_time * 4.0) * 15.0
			rotation = sin(breath_time * 3.0) * 0.15
		"tap_react":
			rotation = sin(breath_time * 12.0) * 0.1
		"pet_react":
			position.y = -abs(sin(breath_time * 5.0)) * 20.0
		"thinking_loop":
			rotation = sin(breath_time * 1.5) * 0.05
		_:
			rotation = lerp(rotation, 0.0, delta * 8.0)
			position = lerp(position, Vector2.ZERO, delta * 8.0)

	queue_redraw()

func _draw() -> void:
	# 1. Ears
	var ear_left = PackedVector2Array([Vector2(-90, -110), Vector2(-150, -220), Vector2(-40, -140)])
	var ear_right = PackedVector2Array([Vector2(90, -110), Vector2(150, -220), Vector2(40, -140)])
	draw_colored_polygon(ear_left, FUR_ORANGE)
	draw_colored_polygon(ear_right, FUR_ORANGE)
	
	# Inner ears
	var inner_left = PackedVector2Array([Vector2(-85, -115), Vector2(-135, -200), Vector2(-50, -140)])
	var inner_right = PackedVector2Array([Vector2(85, -115), Vector2(135, -200), Vector2(50, -140)])
	draw_colored_polygon(inner_left, FUR_CREAM)
	draw_colored_polygon(inner_right, FUR_CREAM)

	# 2. Main Head / Face Body
	draw_circle(Vector2(0, 0), 125, FUR_ORANGE)
	# Cheeks / muzzle patch
	draw_circle(Vector2(0, 35), 75, FUR_CREAM)

	# 3. Blush Cheeks
	draw_circle(Vector2(-70, 25), 18, CHEEK_PINK)
	draw_circle(Vector2(70, 25), 18, CHEEK_PINK)

	# 4. Eyes (animated by eye_scale_y and expression)
	var left_eye_pos = Vector2(-45, -20)
	var right_eye_pos = Vector2(45, -20)
	var eye_height = 20.0 * eye_scale_y

	if current_expression == "sleepy":
		# Closed curved peaceful lines
		draw_arc(left_eye_pos, 15, PI, 2 * PI, 16, EYE_DARK, 4.0)
		draw_arc(right_eye_pos, 15, PI, 2 * PI, 16, EYE_DARK, 4.0)
	elif current_expression == "happy":
		# Happy crescent upside-down arcs
		draw_arc(left_eye_pos, 16, 0, PI, 16, EYE_DARK, 4.0)
		draw_arc(right_eye_pos, 16, 0, PI, 16, EYE_DARK, 4.0)
	elif current_expression == "surprised":
		# Big wide curious circles
		draw_circle(left_eye_pos, 22, EYE_DARK)
		draw_circle(right_eye_pos, 22, EYE_DARK)
		draw_circle(left_eye_pos + Vector2(6, -6), 7, EYE_HIGHLIGHT)
		draw_circle(right_eye_pos + Vector2(6, -6), 7, EYE_HIGHLIGHT)
	else:
		# Standard eyes
		draw_circle(left_eye_pos, 16 * eye_scale_y, EYE_DARK)
		draw_circle(right_eye_pos, 16 * eye_scale_y, EYE_DARK)
		if not is_blinking:
			draw_circle(left_eye_pos + Vector2(4, -4), 5, EYE_HIGHLIGHT)
			draw_circle(right_eye_pos + Vector2(4, -4), 5, EYE_HIGHLIGHT)

	# 5. Cute button nose
	draw_circle(Vector2(0, 15), 8, EYE_DARK)

	# 6. Mouth
	if mouth_openness > 0.1:
		draw_arc(Vector2(0, 25), 15 * mouth_openness, 0, PI, 16, EYE_DARK, 3.0)
	else:
		# Cute resting smile
		draw_arc(Vector2(-8, 30), 8, 0, PI, 12, EYE_DARK, 3.0)
		draw_arc(Vector2(8, 30), 8, 0, PI, 12, EYE_DARK, 3.0)

func _on_chat_response(_text: String, expression: String, animation: String, _speech_style: String) -> void:
	current_expression = expression
	current_animation = animation

	# Animate mouth talking briefly
	var tween = create_tween()
	tween.tween_property(self, "mouth_openness", 1.0, 0.2)
	tween.tween_property(self, "mouth_openness", 0.0, 0.2)
	tween.tween_property(self, "mouth_openness", 0.8, 0.2)
	tween.tween_property(self, "mouth_openness", 0.0, 0.2)

func _on_state_entered(_state: int, state_name: String) -> void:
	current_expression = state_name
