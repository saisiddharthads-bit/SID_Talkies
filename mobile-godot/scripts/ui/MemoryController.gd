extends Control
class_name MemoryController

@onready var memory_list: VBoxContainer = $ScrollContainer/MemoryList
@onready var input_text: LineEdit = $AddSection/MemoryInput
@onready var category_select: OptionButton = $AddSection/CategorySelect
@onready var add_btn: Button = $AddSection/AddButton
@onready var clear_all_btn: Button = $Header/ClearAllButton

func _ready() -> void:
	category_select.clear()
	category_select.add_item("preference")
	category_select.add_item("goal")
	category_select.add_item("fact")
	category_select.add_item("general")

	add_btn.pressed.connect(_on_add_memory)
	clear_all_btn.pressed.connect(_on_clear_all)
	NetworkManager.memories_received.connect(_on_memories_received)

func _on_memories_received(memories: Array) -> void:
	for child in memory_list.get_children():
		child.queue_free()

	if memories.is_empty():
		var empty_lbl = Label.new()
		empty_lbl.text = "No saved memories. Sparky only remembers facts you approve!"
		empty_lbl.modulate = Color(0.7, 0.7, 0.7)
		memory_list.add_child(empty_lbl)
		return

	for mem in memories:
		_render_memory_row(mem)

func _render_memory_row(mem: Dictionary) -> void:
	var h_box = HBoxContainer.new()
	var tag = "[" + mem.get("category", "general").to_upper() + "] "
	var lbl = Label.new()
	lbl.text = tag + mem.get("memory_text", "")
	lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART

	var del_btn = Button.new()
	del_btn.text = "🗑 Delete"
	var mem_id = mem.get("id", "")
	del_btn.pressed.connect(func():
		NetworkManager.delete_memory(mem_id)
	)

	h_box.add_child(lbl)
	h_box.add_child(del_btn)
	memory_list.add_child(h_box)

func _on_add_memory() -> void:
	var text = input_text.text.strip_edges()
	if text == "":
		return
	var cat = category_select.get_item_text(category_select.selected)
	input_text.text = ""
	NetworkManager.add_memory(text, cat)

func _on_clear_all() -> void:
	var url = State.api_base_url + "/memory/all/clear"
	var req = HTTPRequest.new()
	add_child(req)
	req.request_completed.connect(func(_res, _c, _h, _b):
		NetworkManager.fetch_memories()
		req.queue_free()
	)
	req.request(url, NetworkManager._get_headers(), HTTPClient.METHOD_DELETE)
