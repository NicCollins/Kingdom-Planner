extends Control

@onready var food_slider = $VBoxContainer/FoodRow/HSlider
@onready var wood_slider = $VBoxContainer/WoodRow/HSlider
@onready var unassigned_label = $VBoxContainer/UnassignedLabel

func _ready():
	# Set slider max to current population
	food_slider.max_value = GameState.population
	wood_slider.max_value = GameState.population
	
	# Connect signals
	food_slider.value_changed.connect(_on_labor_changed)
	wood_slider.value_changed.connect(_on_labor_changed)

func _on_labor_changed(_value):
	var total_requested = food_slider.value + wood_slider.value
	
	# Simple Constraint: If they try to assign more than they have,
	# we push back the other slider (or stop the current one)
	if total_requested > GameState.population:
		# This is a simple way to force the math to stay at 20
		var excess = total_requested - GameState.population
		if food_slider.has_focus():
			wood_slider.value -= excess
		else:
			food_slider.value -= excess
			
	# Update GameState
	GameState.labor_food = int(food_slider.value)
	GameState.labor_wood = int(wood_slider.value)
	
	# Update labels
	unassigned_label.text = "Idle Colonists: %d" % GameState.get_unassigned_population()