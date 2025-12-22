extends TabContainer


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func _on_tab_changed(tab: int):
	if tab == 0: # The Map Tab
		# Maybe slightly zoom out the camera to give a 'world view'
		var camera = %Camera2D
		var tween = create_tween()
		tween.tween_property(camera, "zoom", Vector2(0.8, 0.8), 0.3)
	else:
		# If they are in the Work tab, maybe pause map-based animations 
		# to save WebGL performance
		pass