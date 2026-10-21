extends Node

# Persistent client state, offline fallbacks, and authentication management

var auth_token: String = ""
var current_user_id: String = ""
var current_user_email: String = ""
var current_mode: String = "friend" # friend, romantic, business, student, everyday
var current_character: String = "sparky_fox"
var is_offline: bool = false
var api_base_url: String = "http://127.0.0.1:8000/api/v1"

# Offline local responses for pet interactions when network is unavailable
const OFFLINE_REACTIONS = {
	"tap": {
		"text": "Hey! That surprised me!",
		"expression": "surprised",
		"animation": "tap_react"
	},
	"pet": {
		"text": "Purrr... that feels so soothing!",
		"expression": "happy",
		"animation": "pet_react"
	},
	"tickle": {
		"text": "Hahaha! No tickles, please! It tickles so much!",
		"expression": "surprised",
		"animation": "tap_react"
	},
	"feed": {
		"text": "Nom nom nom! That was delicious! Thank you!",
		"expression": "happy",
		"animation": "dance"
	}
}

func _ready() -> void:
	load_saved_session()

func save_session(token: String, user_id: String, email: String) -> void:
	auth_token = token
	current_user_id = user_id
	current_user_email = email
	var config = ConfigFile.new()
	config.set_value("auth", "token", token)
	config.set_value("auth", "user_id", user_id)
	config.set_value("auth", "email", email)
	config.set_value("settings", "mode", current_mode)
	config.save("user://session.cfg")

func load_saved_session() -> void:
	var config = ConfigFile.new()
	var err = config.load("user://session.cfg")
	if err == OK:
		auth_token = config.get_value("auth", "token", "")
		current_user_id = config.get_value("auth", "user_id", "")
		current_user_email = config.get_value("auth", "email", "")
		current_mode = config.get_value("settings", "mode", "friend")

func clear_session() -> void:
	auth_token = ""
	current_user_id = ""
	current_user_email = ""
	var dir = DirAccess.open("user://")
	if dir and dir.file_exists("session.cfg"):
		dir.remove("session.cfg")
