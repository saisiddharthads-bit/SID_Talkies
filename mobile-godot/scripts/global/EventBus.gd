extends Node

# Global signals connecting character, UI, and networking

signal character_touched(interaction_type: String) # "tap", "pet", "tickle", "feed"
signal character_state_changed(new_state: String)
signal expression_changed(expression: String)
signal animation_triggered(animation_name: String)

signal chat_message_received(text: String, expression: String, animation: String, speech_style: String)
signal action_requested(action_type: String, payload: Dictionary)
signal mode_changed(new_mode: String)

signal voice_playback_started()
signal voice_playback_finished()
