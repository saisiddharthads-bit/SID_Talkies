extends Control
class_name ChatController

@onready var message_container: VBoxContainer = $ScrollContainer/MessageList
@onready var input_line: LineEdit = $InputBar/MessageInput
@onready var send_button: Button = $InputBar/SendButton
@onready var mode_label: Label = $Header/ModeLabel

func _ready() -> void:
	send_button.pressed.connect(_on_send_pressed)
	input_line.text_submitted.connect(func(_t): _on_send_pressed())
	EventBus.chat_message_received.connect(_on_assistant_message)
	_update_header()

func _update_header() -> void:
	mode_label.text = "Mode: " + State.current_mode.capitalize()

func _on_send_pressed() -> void:
	var text = input_line.text.strip_edges()
	if text == "":
		return
	
	input_line.text = ""
	_add_message_bubble("You", text, Color(0.2, 0.45, 0.85))
	
	# Send via NetworkManager
	NetworkManager.send_chat_message(text)

func _on_assistant_message(text: String, expression: String, _animation: String, _speech_style: String) -> void:
	var prefix = "Sparky [" + expression + "]"
	_add_message_bubble(prefix, text, Color(0.25, 0.65, 0.35))

func _add_message_bubble(sender: String, message: String, bg_color: Color) -> void:
	var panel = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = bg_color
	style.set_corner_radius_all(10)
	style.content_margin_left = 12
	style.content_margin_right = 12
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	panel.add_theme_stylebox_override("panel", style)

	var vbox = VBoxContainer.new()
	var name_lbl = Label.new()
	name_lbl.text = sender
	name_lbl.add_theme_font_size_override("font_size", 11)
	name_lbl.modulate = Color(0.9, 0.9, 0.9, 0.8)

	var text_lbl = Label.new()
	text_lbl.text = message
	text_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART

	vbox.add_child(name_lbl)
	vbox.add_child(text_lbl)
	panel.add_child(vbox)
	message_container.add_child(panel)

	# Scroll to bottom
	await get_tree().process_frame
	$ScrollContainer.scroll_vertical = int($ScrollContainer.get_v_scroll_bar().max_value)
