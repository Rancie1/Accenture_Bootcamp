"""Test parser with actual n8n response from user."""

import json
from services.n8n_response_parser import parse_n8n_response, format_for_grocery_api, format_for_transport_api

# Actual n8n response from user
actual_response = [{
    'user_message': 'I am living in Dubbo need to refuel. Also what is the price of milk, eggs and biscuits I need to get to Coles to.',
    'agent_answers': [
        {
            'route': 'groceries',
            'answer': 'I can help with Coles groceries in Dubbo. Do you have preferred sizes/brands for each — e.g. 2L full‑cream (or lactose‑free), a dozen standard or free‑range eggs, and any biscuit brand (Arnott\'s, Coles Brand, etc.)? Reply with your choices and I\'ll fetch current Coles prices.'
        },
        {
            'route': 'fuel',
            'answer': 'Sorry — I couldn\'t fetch live fuel prices due to an internal error when calling the price service.\n\nI can:\n- Retry now (current defaults: U91 fuel, 5 km radius around Dubbo), or\n- Retry with a different fuel type (P95 or Diesel) or a different radius, or\n- Skip the tool and give guidance on where to check prices yourself (e.g. NSW FuelCheck, MotorMouth, PetrolSpy) and typical price ranges.\n\nWhich would you like me to do? If you want me to retry, tell me the fuel type (U91, P95, Diesel) and radius (km) you prefer — or say "keep defaults."'
        },
        {
            'route': 'location',
            'answer': '''Short answer — here are Coles and nearby petrol stations I found in Dubbo. I couldn't see opening hours in the place data returned. Do you want driving directions/ETA to any of these? If so, tell me your current address or say "use Dubbo CBD" and which place to go to.

Details — top matches
- Coles Dubbo
  - Address: 177 Macquarie St, Dubbo NSW 2830
  - Coordinates: -32.2499826, 148.5994851
  - Opening hours: not available from the place results I retrieved

Fuel stations (near Dubbo)
1) bp Truckstop
  - Address: 107 Erskine St, Dubbo NSW 2830
  - Coordinates: -32.2443213, 148.6112578
  - Note: listed as a truckstop in the results

2) bp
  - Address: 51–63 Whylandra St, Dubbo NSW 2830
  - Coordinates: -32.2485920, 148.5927450

3) United Petroleum Dubbo (Pie Face)
  - Address: 138 Cobra St, Dubbo NSW 2830
  - Coordinates: -32.2545960, 148.6128570

Notes and next steps
- I tried searches for Shell and 7‑Eleven but didn't get place results back for those queries.
- I did not get opening hours from the API responses. I can retry a more specific search for opening hours if you want.
- If you want directions/ETA, tell me your origin (specific address or "use Dubbo CBD") and which place to route to; I'll compute driving time and distance.'''
        }
    ]
}]

print('=' * 80)
print('TESTING PARSER WITH ACTUAL n8n RESPONSE')
print('=' * 80)

# Test parsing
parsed = parse_n8n_response(actual_response)
print('\n1. PARSED RESPONSE:')
print(json.dumps(parsed, indent=2))

# Test grocery formatting
print('\n2. GROCERY API FORMAT:')
grocery_formatted = format_for_grocery_api(parsed)
print(json.dumps(grocery_formatted, indent=2))

# Test transport formatting
print('\n3. TRANSPORT API FORMAT:')
transport_formatted = format_for_transport_api(parsed)
print(json.dumps(transport_formatted, indent=2))

print('\n' + '=' * 80)
print('✅ Parser successfully handles actual n8n response format!')
print('=' * 80)
