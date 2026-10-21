extends Control
class_name MainUI

@onready var speech_bubble: PanelContainer = $SpeechBubble
@onready var speech_label: Label = $SpeechBubble/MarginContainer/SpeechText
@onready var view_stack: TabContainer = $ViewStack

var bubble_hide_timer: SceneTreeTimer

func _ready() -> void:
	EventBus.chat_message_received.connect(_on_chat_message)
	speech_bubble.visible = false

	# Setup quick interaction buttons
	$QuickActions/FeedBtn.pressed.connect(func():
		EventBus.character_touched.emit("feed")
		NetworkManager.send_chat_message("Here is a tasty snack for you!", "feed")
	)
	$QuickActions/DanceBtn.pressed.connect(func():
		EventBus.animation_triggered.emit("dance")
		NetworkManager.send_chat_message("Let's dance together!", "")
	)

	# Bottom navigation buttons
	$BottomNav/RoomBtn.pressed.connect(func(): view_stack.current_tab = 0)
	$BottomNav/ChatBtn.pressed.connect(func(): view_stack.current_tab = 1)
	$BottomNav/MemoryBtn.pressed.connect(func():
		view_stack.current_tab = 2
		NetworkManager.fetch_memories()
	)
	$BottomNav/ResearchBtn.pressed.connect(func(): view_stack.current_tab = 3)
	$BottomNav/GameBtn.pressed.connect(func(): view_stack.current_tab = 4)
	$BottomNav/SettingsBtn.pressed.connect(func(): view_stack.current_tab = 5)

func _on_chat_message(text: String, _expression: String, _animation: String, _speech_style: String) -> void:
	speech_label.text = text
	speech_bubble.visible = true
	
	# Auto-hide speech bubble after read time
	var display_time = max(3.5, float(text.length()) * 0.06)
	if bubble_hide_timer:
		bubble_hide_timer.disconnect("timeout", _hide_bubble)
	bubble_hide_timer = get_tree().create_timer(display_time)
	bubble_hide_timer.timeout.connect(_hide_bubble)

func _hide_bubble() -> void:
	speech_bubble.visible = false
