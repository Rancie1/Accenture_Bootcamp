from math import radians, sin, cos, sqrt, atan2

# (long, lat, cost)

start_loc = (-37.7651, 144.9229)
coles_with_cost = [
    (-37.764632, 144.921957, 50),
    (-37.775320, 144.886866, 50),
    (-37.743837, 144.910707, 50),
    (-37.782222, 144.915000, 50),
    (-37.775,    144.887, 50)      
]

woolworths_with_cost = [
    (-37.767827, 144.921414, 45), 
    (-37.776000, 144.913000, 45), 
    (-37.770000, 144.916000, 45), 
    (-37.766,    144.922, 45),    
    (-37.782,    144.887, 45)
]

servo_with_cost = [
    (-37.757668, 144.919842, 30),
    (-37.771020, 144.925570, 27),
    (-37.766000, 144.915000, 30),
    (-37.765000, 144.914000, 50),
    (-37.770000, 144.910000, 23) 
]

def haversine_distance(coord1, coord2):
    """
    Calculate the great circle distance between two points.
    Returns distance in kilometers.
    """
    
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    # Radius of earth in kilometers
    r = 6371
    return r * c

def find_balanced_route(address, coles_with_cost, woolworths_with_cost, servos_with_cost, weight=0.5):
    """
    Find the route that balances both distance and cost using weighted scoring.
    Address is in (lon, lat) format, others are in (lat, lon, cost) format.
    
    weight: balance between distance and cost (0-1)
            0.0 = prioritize distance only
            0.5 = equal balance
            1.0 = prioritize cost only
    
    Returns: best route based on weighted score
    """
    # Convert address from (lon, lat) to (lat, lon)
    address_latlon = (address[1], address[0])
    
    # Combine all grocery stores
    all_groceries = [(coord[0], coord[1], coord[2], "Coles") for coord in coles_with_cost] + \
                    [(coord[0], coord[1], coord[2], "Woolworths") for coord in woolworths_with_cost]
    
    # First pass: collect all routes to find min/max for normalization
    all_routes = []
    
    for grocery_lat, grocery_lon, grocery_cost, grocery_type in all_groceries:
        grocery_coord = (grocery_lat, grocery_lon)
        
        for servo_lat, servo_lon, servo_cost in servos_with_cost:
            servo_coord = (servo_lat, servo_lon)
            
            # Calculate total cost
            total_cost = grocery_cost + servo_cost
            
            # Route 1: Address -> Grocery -> Servo
            route1_dist = (haversine_distance(address, grocery_coord) + haversine_distance(grocery_coord, servo_coord))
            
            # Route 2: Address -> Servo -> Grocery
            route2_dist = (haversine_distance(address, servo_coord) + haversine_distance(servo_coord, grocery_coord))
            
            # Take the shorter route
            if route1_dist < route2_dist:
                total_dist = route1_dist
                route_order = "Address -> Grocery -> Servo"
            else:
                total_dist = route2_dist
                route_order = "Address -> Servo -> Grocery"
            
            all_routes.append({
                'distance': total_dist,
                'cost': total_cost,
                'grocery_type': grocery_type,
                'grocery_coords': grocery_coord,
                'grocery_cost': grocery_cost,
                'servo_coords': servo_coord,
                'servo_cost': servo_cost,
                'route_order': route_order
            })
    
    # Find min/max for normalization
    min_dist = min(r['distance'] for r in all_routes)
    max_dist = max(r['distance'] for r in all_routes)
    min_cost = min(r['cost'] for r in all_routes)
    max_cost = max(r['cost'] for r in all_routes)
    
    # Calculate weighted scores
    best_score = float('inf')
    best_route = None
    
    for route in all_routes:
        # Normalize distance and cost to 0-1 range
        norm_dist = (route['distance'] - min_dist) / (max_dist - min_dist) if max_dist > min_dist else 0
        norm_cost = (route['cost'] - min_cost) / (max_cost - min_cost) if max_cost > min_cost else 0
        
        # weight=0 means distance only, weight=1 means cost only
        score = ((1 - weight) * norm_dist) + (weight * norm_cost)
        
        if score < best_score:
            best_score = score
            best_route = {
                'total_distance_km': round(route['distance'], 2),
                'total_cost': round(route['cost'], 2),
                'weighted_score': round(score, 3),
                'grocery_type': route['grocery_type'],
                'grocery_coords': route['grocery_coords'],
                'grocery_cost': route['grocery_cost'],
                'servo_coords': route['servo_coords'],
                'servo_cost': route['servo_cost'],
                'route_order': route['route_order']
            }
    
    return best_route


# 0 weight: prioritize distance only
# 1 weight: prioritize cost only
weight_values = [0, 0.5, 1]
for w in weight_values:
    result = find_balanced_route(start_loc, coles_with_cost, woolworths_with_cost, servo_with_cost, weight=w)
    print(f"\nweight={w:.1f}:")
    print(f"  Score: {result['weighted_score']} | Distance: {result['total_distance_km']} km | Cost: ${result['total_cost']:.2f}")
    print(f"  {result['grocery_type']} + Servo at {result['servo_coords']}")
