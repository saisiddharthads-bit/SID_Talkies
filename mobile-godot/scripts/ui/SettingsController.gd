extends Control
class_name SettingsController

@onready var mode_select: OptionButton = $ModeSection/ModeOption
@onready var memory_toggle: CheckButton = $PrivacySection/MemoryToggle
@onready var server_url_input: LineEdit = $ServerSection/ServerUrlInput
@onready var logout_btn: Button = $AccountSection/LogoutButton
@onready var delete_account_btn: Button = $AccountSection/DeleteAccountButton

const MODES = ["friend", "romantic", "business", "student", "everyday"]

func _ready() -> void:
	mode_select.clear()
	for m in MODES:
		mode_select.add_item(m.capitalize())

	# Select current mode
	var idx = MODES.find(State.current_mode)
	if idx >= 0:
		mode_select.select(idx)

	server_url_input.text = State.api_base_url
	server_url_input.text_changed.connect(func(new_url):
		State.api_base_url = new_url.strip_edges()
	)

	mode_select.item_selected.connect(_on_mode_selected)
	memory_toggle.toggled.connect(_on_memory_toggled)
	logout_btn.pressed.connect(_on_logout)
	delete_account_btn.pressed.connect(_on_delete_account)

func _on_mode_selected(idx: int) -> void:
	var selected_mode = MODES[idx]
	State.current_mode = selected_mode
	EventBus.mode_changed.emit(selected_mode)

	# Update backend settings
	var url = State.api_base_url + "/settings/"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_res, _c, _h, _b): req.queue_free())
	req.request(url, NetworkManager._get_headers(), HTTPClient.METHOD_PUT, JSON.stringify({"mode": selected_mode}))

func _on_memory_toggled(is_enabled: bool) -> void:
	var url = State.api_base_url + "/settings/"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_res, _c, _h, _b): req.queue_free())
	req.request(url, NetworkManager._get_headers(), HTTPClient.METHOD_PUT, JSON.stringify({"memory_enabled": is_enabled}))

func _on_logout() -> void:
	State.clear_session()
	get_tree().reload_current_scene()

func _on_delete_account() -> void:
	# Cascading erasure request
	var url = State.api_base_url + "/auth/me"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_res, _c, _h, _b):
		State.clear_session()
		get_tree().reload_current_scene()
		req.queue_free()
	)
	req.request(url, NetworkManager._get_headers(), HTTPClient.METHOD_DELETE)
