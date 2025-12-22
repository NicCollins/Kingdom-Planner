extends TileMapLayer

# Map Settings
@export var map_width: int = 40
@export var map_height: int = 40
@export var noise_seed: int = 12345

# Define our terrain indices (matching the Terrains tab we just set up)
enum Terrain { WATER = 0, GRASS = 1, FOREST = 2, MINE = 3, FOG = 4 }

var noise = FastNoiseLite.new()
var map_data = {} # Dictionary to store tile data: {Vector2i(q, r): TileType}

@onready var fog_layer = $"../FogLayer" # Path to your FogLayer node
@onready var town_marker = $TownMarker # Path to your TownMarker node

func _ready():
	print("MapLayer ready")
	generate_map()
	fill_fog_layer()
	update_visual_fog()
	place_town_marker(GameState.landing_site)
	center_camera_on_landing()

func generate_map():
	print("Generating map...")
	noise.seed = noise_seed
	noise.frequency = 0.05
	
	# Use dictionaries to group coordinates by their terrain type
	var terrain_map = {
		Terrain.WATER: [],
		Terrain.GRASS: [],
		Terrain.FOREST: [],
		Terrain.MINE: []
	}
	
	for q in range(map_width):
		for r in range(map_height):
			var coords = Vector2i(q, r)
			var val = noise.get_noise_2d(q, r)
			
			var type = Terrain.GRASS
			if val < -0.2: type = Terrain.WATER
			elif val > 0.3: type = Terrain.FOREST
			
			if type != Terrain.WATER and randf() > 0.98:
				type = Terrain.MINE
				
			terrain_map[type].append(coords)
			map_data[coords] = type

	# Paint the terrains
	# 0 is the Terrain Set index, then we pass the array of coordinates
	for type in terrain_map.keys():
		set_cells_terrain_connect(terrain_map[type], 0, type)

	# Run your landing validation logic after painting...
	validate_landing_site()

	print("Map generated successfully")
	calculate_map_potential()

func validate_landing_site():
	print("Validating landing site...")
	var start_pos = Vector2i(20, 20)
	if map_data[start_pos] == Terrain.WATER:
		# Find the nearest non-water tile
		for radius in range(1, 10):
			var found = false
			# Check a simple square expansion for a dry tile
			for dx in range(-radius, radius + 1):
				for dy in range(-radius, radius + 1):
					var test_pos = start_pos + Vector2i(dx, dy)
					if map_data.has(test_pos) and map_data[test_pos] != Terrain.WATER:
						start_pos = test_pos
						found = true
						break
				if found: break
			if found: break
	
	# Update GameState with the confirmed landing site
	print("Setting landing site to ", start_pos)
	GameState.revealed_cells = [start_pos]
	GameState.landing_site = start_pos

# 1. Fill everything with black once at start
func fill_fog_layer():
	print("Filling fog layer with black tiles...")
	for q in range(map_width):
		for r in range(map_height):
			# 0 is your black tile ID
			fog_layer.set_cell(Vector2i(q, r), 1, Vector2i(4, 0))

# 2. This only updates the visual tiles based on current state
func update_visual_fog():
	print("Updating visual fog layer...")
	for center in GameState.revealed_cells:
		apply_reveal_to_fog_layer(center, 2)

# 3. This ONLY touches the FogLayer tiles, it does NOT edit GameState
func apply_reveal_to_fog_layer(center: Vector2i, radius: int):
	print("Applying reveal to fog layer at ", center, " with radius ", radius)
	for q in range(-radius, radius + 1):
		for r in range(max(-radius, -q - radius), min(radius, -q + radius) + 1):
			var target = center + Vector2i(q, r)
			print("Clearing fog at ", target)
			# -1 removes the black tile from the FogLayer
			fog_layer.set_cell(target, -1)

# Call this function when an expedition finishes!
func discover_new_area(new_center: Vector2i):
	print("Discovering new area at ", new_center)
	if not GameState.revealed_cells.has(new_center):
		GameState.revealed_cells.append(new_center)
		apply_reveal_to_fog_layer(new_center, 2)

func calculate_map_potential():
	print("Calculating map potential...")
	# This connects the map to your industry logic
	var wood_potential = 0
	var food_potential = 0
	
	for type in map_data.values():
		match type:
			Terrain.FOREST: wood_potential += 1
			Terrain.GRASS: food_potential += 1
			
	# Send these values to your Global GameState
	GameState.max_wood_efficiency = wood_potential
	GameState.max_food_efficiency = food_potential

func center_camera_on_landing():
	print("Centering camera on landing site...")
	var start_pos = GameState.revealed_cells[0]
	
	# map_to_local converts tile coordinates (q, r) to pixel coordinates (x, y)
	var pixel_pos = map_to_local(start_pos)
	print("Map Landing Logic - Tile: ", start_pos, " Pixel: ", pixel_pos)
	
	# Find the camera in the scene and move it
	var camera = get_viewport().get_camera_2d()
	if camera:
		camera.position = pixel_pos
		print("Camera moved to: ", camera.global_position)

func place_town_marker(coords: Vector2i):
	# map_to_local converts (q, r) to pixels
	var pixel_pos = map_to_local(coords)
	town_marker.global_position = pixel_pos
	
	# Optional: Give it a high Z-Index so it's always visible above the grass
	town_marker.z_index = 2
