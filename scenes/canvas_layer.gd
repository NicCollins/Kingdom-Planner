extends CanvasLayer

@onready var food_label = $PanelContainer/HBoxContainer/FoodLabel

func _process(_delta):
	# Update the UI every frame with data from the Autoload
	food_label.text = "Food: " + str(floori(int(GameState.food_total)))