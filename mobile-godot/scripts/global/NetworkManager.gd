extends Node

# High-reliability HTTP client managing API communication, JWT authentication, and graceful offline fallback

var http_client: HTTPRequest
var active_conversation_id: String = ""

signal login_completed(success: bool, error_msg: String)
signal register_completed(success: bool, error_msg: String)
signal chat_completed(success: bool, response_data: Dictionary)
signal memories_received(memories: Array)
signal research_completed(success: bool, report: Dictionary)

func _ready() -> void:
	http_client = HTTPRequest.new()
	http_client.timeout = 15.0
	add_child(http_client)

func _get_headers() -> PackedStringArray:
	var headers = PackedStringArray([
		"Content-Type: application/json",
		"Accept: application/json"
	])
	if State.auth_token != "":
		headers.append("Authorization: Bearer " + State.auth_token)
	return headers

# ----------------- AUTHENTICATION -----------------

func login(email: String, password: String) -> void:
	var body = JSON.stringify({"email": email, "password": password})
	var url = State.api_base_url + "/auth/login"
	
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(result, code, _headers, res_body):
		if code == 200:
			var json = JSON.parse_string(res_body.get_string_from_utf8())
			State.save_session(json.get("access_token", ""), json.get("user_id", ""), json.get("email", ""))
			login_completed.emit(true, "")
		else:
			var err = "Login failed."
			if res_body.size() > 0:
				var res = JSON.parse_string(res_body.get_string_from_utf8())
				if res and res.has("detail"):
					err = res["detail"]
			login_completed.emit(false, err)
		req.queue_free()
	)
	req.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func register(email: String, password: String) -> void:
	var body = JSON.stringify({"email": email, "password": password})
	var url = State.api_base_url + "/auth/register"
	
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(result, code, _headers, res_body):
		if code == 201:
			var json = JSON.parse_string(res_body.get_string_from_utf8())
			State.save_session(json.get("access_token", ""), json.get("user_id", ""), json.get("email", ""))
			register_completed.emit(true, "")
		else:
			var err = "Registration failed."
			if res_body.size() > 0:
				var res = JSON.parse_string(res_body.get_string_from_utf8())
				if res and res.has("detail"):
					err = res["detail"]
			register_completed.emit(false, err)
		req.queue_free()
	)
	req.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

# ----------------- COMPANION CHAT -----------------

func send_chat_message(message: String, touch_context: String = "") -> void:
	if State.is_offline or State.auth_token == "":
		_handle_offline_chat(message, touch_context)
		return

	var payload = {
		"message": message,
		"touch_context": touch_context
	}
	if active_conversation_id != "":
		payload["conversation_id"] = active_conversation_id

	var url = State.api_base_url + "/chat/"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(result, code, _headers, res_body):
		if code == 200:
			var json = JSON.parse_string(res_body.get_string_from_utf8())
			if json:
				active_conversation_id = json.get("conversation_id", "")
				var reply = json.get("reply", {})
				var text = reply.get("text", "")
				var expression = reply.get("expression", "idle")
				var animation = reply.get("animation", "idle")
				var speech_style = reply.get("speech_style", "friendly")

				EventBus.chat_message_received.emit(text, expression, animation, speech_style)
				chat_completed.emit(true, json)
				req.queue_free()
				return
		
		# Fallback to local offline behavior if network drops
		_handle_offline_chat(message, touch_context)
		req.queue_free()
	)
	var err = req.request(url, _get_headers(), HTTPClient.METHOD_POST, JSON.stringify(payload))
	if err != OK:
		_handle_offline_chat(message, touch_context)
		req.queue_free()

func _handle_offline_chat(message: String, touch_context: String) -> void:
	var fallback = {
		"text": "I'm currently playing in offline mode! But I still love spending time with you!",
		"expression": "happy",
		"animation": "idle",
		"speech_style": "friendly"
	}
	if touch_context in State.OFFLINE_REACTIONS:
		fallback = State.OFFLINE_REACTIONS[touch_context]

	EventBus.chat_message_received.emit(
		fallback.get("text", ""),
		fallback.get("expression", "idle"),
		fallback.get("animation", "idle"),
		fallback.get("speech_style", "friendly")
	)
	chat_completed.emit(true, {"reply": fallback})

# ----------------- MEMORY -----------------

func fetch_memories() -> void:
	var url = State.api_base_url + "/memory/"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_result, code, _headers, res_body):
		if code == 200:
			var list = JSON.parse_string(res_body.get_string_from_utf8())
			if list is Array:
				memories_received.emit(list)
		req.queue_free()
	)
	req.request(url, _get_headers(), HTTPClient.METHOD_GET)

func add_memory(memory_text: String, category: String) -> void:
	var url = State.api_base_url + "/memory/"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_res, code, _h, _b):
		if code == 201:
			fetch_memories()
		req.queue_free()
	)
	req.request(url, _get_headers(), HTTPClient.METHOD_POST, JSON.stringify({"memory_text": memory_text, "category": category}))

func delete_memory(memory_id: String) -> void:
	var url = State.api_base_url + "/memory/" + memory_id
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_res, code, _h, _b):
		if code == 204:
			fetch_memories()
		req.queue_free()
	)
	req.request(url, _get_headers(), HTTPClient.METHOD_DELETE)

# ----------------- RESEARCH -----------------

func conduct_research(query: String) -> void:
	var url = State.api_base_url + "/research/"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_res, code, _headers, res_body):
		if code == 200:
			var report = JSON.parse_string(res_body.get_string_from_utf8())
			research_completed.emit(true, report)
		else:
			research_completed.emit(false, {})
		req.queue_free()
	)
	req.request(url, _get_headers(), HTTPClient.METHOD_POST, JSON.stringify({"query": query, "max_sources": 3}))
