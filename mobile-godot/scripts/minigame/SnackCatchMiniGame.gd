extends Control
class_name SnackCatchMiniGame

var score: int = 0
var game_active: bool = false
var spawn_timer: float = 0.0
var items: Array = []
var basket_x: float = 360.0

@onready var score_lbl: Label = $ScoreLabel
@onready var start_btn: Button = $StartButton

func _ready() -> void:
	start_btn.pressed.connect(_start_game)

func _start_game() -> void:
	score = 0
	items.clear()
	game_active = true
	start_btn.visible = false
	score_lbl.text = "Score: 0"

func _process(delta: float) -> void:
	if not game_active:
		return

	spawn_timer += delta
	if spawn_timer >= 1.2:
		spawn_timer = 0.0
		# Spawn new snack item
		items.append({
			"pos": Vector2(randf_range(80, 640), 50),
			"speed": randf_range(200, 350)
		})

	# Update snacks
	var i = items.size() - 1
	while i >= 0:
		var item = items[i]
		item["pos"].y += item["speed"] * delta

		# Check collision with basket (basket at bottom y = 900)
		if item["pos"].y >= 880 and item["pos"].y <= 940:
			if abs(item["pos"].x - basket_x) < 70:
				score += 10
				score_lbl.text = "Score: " + str(score)
				items.remove_at(i)
				i -= 1
				continue

		# Remove if fallen off screen
		if item["pos"].y > 1050:
			items.remove_at(i)
		i -= 1

	queue_redraw()

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion or event is InputEventScreenDrag:
		basket_x = clamp(event.position.x, 60, 660)

func _draw() -> void:
	if not game_active:
		return

	# Draw basket
	draw_rect(Rect2(basket_x - 50, 900, 100, 25), Color(0.8, 0.45, 0.2), true)

	# Draw snacks
	for item in items:
		draw_circle(item["pos"], 16, Color(0.9, 0.2, 0.2)) # Red Apple snack
		draw_circle(item["pos"] + Vector2(2, -8), 4, Color(0.2, 0.8, 0.3)) # Leaf
