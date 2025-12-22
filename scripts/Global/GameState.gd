extends Node

# --- Resources ---
var food_total: float = 200.0
var population: int = 20
var wood: float = 50.0
var tools_primitive: int = 10
var water_secured: bool = false

# --- Map Potential (Calculated by MapManager) ---
var max_food_efficiency: float = 0.0
var max_wood_efficiency: float = 0.0

# --- Fog of War & Discovery ---
# Stores coordinates of hexes the player has revealed
var revealed_cells: Array[Vector2i] = []
var landing_site: Vector2i = Vector2i(0, 0)

# --- Time/Seasons ---
var current_day: int = 1
var current_season: String = "Spring"

# --- Initialization ---
func _ready():
	print("Player initialized with default values.")
	# Starting location (center of map) is always revealed
	revealed_cells.append(Vector2i(20, 20))