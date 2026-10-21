extends Node
class_name CharacterStateMachine

enum State {
	IDLE,
	LISTENING,
	HAPPY,
	CURIOUS,
	SURPRISED,
	SLEEPY,
	THINKING
}

var current_state: State = State.IDLE
var idle_timer: float = 0.0
const SLEEP_IDLE_THRESHOLD: float = 18.0

signal state_entered(new_state: State, state_name: String)

func _ready() -> void:
	EventBus.character_touched.connect(_on_character_touched)
	EventBus.chat_message_received.connect(_on_chat_response)

func _process(delta: float) -> void:
	if current_state == State.IDLE:
		idle_timer += delta
		if idle_timer >= SLEEP_IDLE_THRESHOLD:
			transition_to(State.SLEEPY)
	else:
		idle_timer = 0.0

func transition_to(new_state: State) -> void:
	current_state = new_state
	idle_timer = 0.0
	var state_name = _get_state_name(new_state)
	EventBus.character_state_changed.emit(state_name)
	state_entered.emit(new_state, state_name)

func _get_state_name(s: State) -> String:
	match s:
		State.IDLE: return "idle"
		State.LISTENING: return "listening"
		State.HAPPY: return "happy"
		State.CURIOUS: return "curious"
		State.SURPRISED: return "surprised"
		State.SLEEPY: return "sleepy"
		State.THINKING: return "thinking"
		_: return "idle"

func _on_character_touched(type: String) -> void:
	match type:
		"tap":
			transition_to(State.SURPRISED)
			_schedule_return_to_idle(1.5)
		"pet":
			transition_to(State.HAPPY)
			_schedule_return_to_idle(2.5)
		"tickle":
			transition_to(State.SURPRISED)
			_schedule_return_to_idle(2.0)
		"feed":
			transition_to(State.HAPPY)
			_schedule_return_to_idle(3.0)

func _on_chat_response(_text: String, expression: String, animation: String, _speech_style: String) -> void:
	match expression:
		"happy": transition_to(State.HAPPY)
		"curious": transition_to(State.CURIOUS)
		"surprised": transition_to(State.SURPRISED)
		"sleepy": transition_to(State.SLEEPY)
		"listening": transition_to(State.LISTENING)
		"thinking": transition_to(State.THINKING)
		_: transition_to(State.IDLE)

	if animation != "thinking_loop" and expression != "sleepy":
		_schedule_return_to_idle(4.0)

func _schedule_return_to_idle(delay_seconds: float) -> void:
	get_tree().create_timer(delay_seconds).timeout.connect(func():
		if current_state != State.LISTENING and current_state != State.THINKING:
			transition_to(State.IDLE)
	)
