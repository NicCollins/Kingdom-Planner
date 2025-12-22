extends CanvasLayer

@onready var food_label = $PanelContainer/HBoxContainer/FoodLabel
@onready var time_label = $PanelContainer/HBoxContainer/TimeLabel

func _ready():
	# Connect to the GameState signals
	GameState.resources_updated.connect(update_ui)
	update_ui() # Initial draw

func update_ui():
	# String formatting for a clean look
	food_label.text = "Food: %d" % floor(GameState.food_total)
	time_label.text = "Day: %d | %s" % [GameState.current_day, GameState.current_season]

# func _process(_delta):
# 	# Update the UI every frame with data from the Autoload
# 	food_label.text = "Food: " + str(floori(int(GameState.food_total)))