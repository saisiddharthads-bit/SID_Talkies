extends Area2D
class_name TouchHandler

var touch_start_pos: Vector2 = Vector2.ZERO
var touch_start_time: float = 0.0
var is_touching: bool = false
var drag_distance: float = 0.0
var tap_count: int = 0
var last_tap_time: float = 0.0

const TAP_THRESHOLD: float = 25.0
const PET_DISTANCE_THRESHOLD: float = 80.0
const TICKLE_TIME_WINDOW: float = 0.8

func _input_event(_viewport: Viewport, event: InputEvent, _shape_idx: int) -> void:
	if event is InputEventMouseButton or event is InputEventScreenTouch:
		if event.is_pressed():
			_on_touch_down(event.position)
		else:
			_on_touch_up(event.position)
	elif (event is InputEventMouseMotion or event is InputEventScreenDrag) and is_touching:
		_on_touch_drag(event.position)

func _on_touch_down(pos: Vector2) -> void:
	is_touching = true
	touch_start_pos = pos
	touch_start_time = Time.get_ticks_msec() / 1000.0
	drag_distance = 0.0

func _on_touch_drag(pos: Vector2) -> void:
	drag_distance += pos.distance_to(touch_start_pos)
	touch_start_pos = pos

	# Petting motion detected
	if drag_distance > PET_DISTANCE_THRESHOLD:
		drag_distance = 0.0
		EventBus.character_touched.emit("pet")
		# Also send to backend chat for live reactive comment
		NetworkManager.send_chat_message("I'm petting you gently.", "pet")

func _on_touch_up(_pos: Vector2) -> void:
	if not is_touching:
		return
	is_touching = false

	var current_time = Time.get_ticks_msec() / 1000.0
	var elapsed = current_time - touch_start_time

	if elapsed < 0.35 and drag_distance < TAP_THRESHOLD:
		if current_time - last_tap_time < TICKLE_TIME_WINDOW:
			tap_count += 1
		else:
			tap_count = 1
		last_tap_time = current_time

		if tap_count >= 3:
			tap_count = 0
			EventBus.character_touched.emit("tickle")
			NetworkManager.send_chat_message("Hehe, tickle tickle!", "tickle")
		else:
			EventBus.character_touched.emit("tap")
			NetworkManager.send_chat_message("Tap!", "tap")
