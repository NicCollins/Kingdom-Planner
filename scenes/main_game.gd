extends Node2D

@onready var tabs = $CanvasLayer/TabContainer

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func _on_game_tick_timer_timeout():
	# Simply tell the GameState to run its math
	GameState.process_tick()

func _input(event):
	# If the current tab is NOT the map (index 0), ignore map movement
	if tabs.current_tab != 0:
		return