extends Node

# Signals allow the UI to update only when something actually changes
signal resources_updated
signal day_passed

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
var seasons = ["Spring", "Summer", "Autumn", "Winter"]
var season_index = 0

# --- Consumption Rates ---
var food_required_per_colonist: float = 0.2 # Each person eats this much per tick

# --- Labor Allocation ---
var labor_food: int = 0
var labor_wood: int = 0

# --- Efficiency Multipliers ---
var base_food_yield: float = 0.5  # Food per worker per tick
var base_wood_yield: float = 0.3  # Wood per worker per tick

# --- Initialization ---
func _ready():
	print("Player initialized with default values.")
	# Starting location (center of map) is always revealed
	revealed_cells.append(Vector2i(20, 20))

func process_tick():
	# Calculate Production
	calculate_production()

	# Calculate Food Consumption
	var total_consumption = population * food_required_per_colonist
	food_total -= total_consumption
	
	# Check for Starvation
	if food_total < 0:
		food_total = 0
		handle_starvation()
	
	# Advance Time
	current_day += 1
	if current_day > 30: # Each season lasts 30 ticks/days
		advance_season()

	# Notify the UI
	resources_updated.emit()

func handle_starvation():
	# For now, just a warning. Later, this will lower happiness or population.
	print("Warning: The colony has no food!")

func advance_season():
	current_day = 1
	season_index = (season_index + 1) % 4
	current_season = seasons[season_index]
	day_passed.emit()
	print("Season changed to: ", current_season)

# Helper to find unassigned workers
func get_unassigned_population() -> int:
	return population - (labor_food + labor_wood)

# Updated Production Logic
func calculate_production():
	# Map efficiency: 1.0 is standard. If you have very few fields, it drops.
	# We assume 'max_food_efficiency' is the count of revealed Field tiles.
	var food_modifier = clamp(max_food_efficiency / 10.0, 0.5, 1.5)
	
	var food_produced = labor_food * base_food_yield * food_modifier
	var wood_produced = labor_wood * base_wood_yield
	
	food_total += food_produced
	wood += wood_produced