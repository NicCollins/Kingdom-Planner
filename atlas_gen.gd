@tool
extends Node

func _ready():
	generate_atlas()

func generate_atlas():
	var image = Image.create(256 + 64, 64, false, Image.FORMAT_RGBA8)
	var colors = [Color.BLUE, Color.GREEN, Color.DARK_GREEN, Color.SLATE_GRAY, Color.BLACK]
	
	for i in range(5):
		var rect = Rect2i(i * 64, 0, 64, 64)
		image.fill_rect(rect, colors[i])
		# Add a small white border so you can see the hex edges
		image.fill_rect(Rect2i(i * 64, 0, 64, 1), Color.WHITE)
		image.fill_rect(Rect2i(i * 64, 0, 1, 64), Color.WHITE)
		
	image.save_png("res://placeholder_atlas.png")
	print("Atlas generated at res://placeholder_atlas.png - Drag this into your TileSet!")