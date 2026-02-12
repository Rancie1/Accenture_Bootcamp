# n8n Integration Documentation

This directory contains all documentation for integrating the FastAPI backend with n8n workflows.

## Quick Links

### Getting Started

- **[Basic Setup](./BASIC_SETUP.md)** - Install n8n and create your first workflow
- **[Setup Checklist](./SETUP_CHECKLIST.md)** - Step-by-step checklist to connect FastAPI to n8n

### Understanding the Architecture

- **[Webhook FAQ](./WEBHOOK_FAQ.md)** - "Do I need multiple webhooks?" and other common questions
- **[Architecture](./ARCHITECTURE.md)** - Visual diagrams and data flow
- **[Your Setup Explained](./YOUR_SETUP_EXPLAINED.md)** - How your specific n8n setup works

### Advanced Setup

- **[Multi-Agent Setup](./MULTI_AGENT_SETUP.md)** - Configure multiple agents (Coles, Fuel, Maps)
- **[Workflow Template](./workflow_template.json)** - Importable n8n workflow for quick start

## Overview

The FastAPI backend delegates complex optimization tasks to n8n workflows via HTTP webhooks:

```
FastAPI Backend → n8n Webhook → Switch/Router → Multiple Agents → Response
```

### Key Concepts

1. **One Webhook Architecture**: You only need ONE webhook URL in FastAPI that points to your main n8n workflow
2. **Internal Routing**: n8n handles routing to different agents (Coles, Fuel, Maps) internally
3. **5km Radius Filtering**: Maps agent filters stores within 5km of user's home address
4. **Response Format**: n8n must return data in the format FastAPI expects

## Quick Start

### 1. Install n8n

```bash
npm install n8n -g
n8n start
```

Open http://localhost:5678

### 2. Import Workflow Template

1. In n8n, click "..." menu → "Import from File"
2. Select `workflow_template.json` from this directory
3. Activate the workflow (toggle in top-right)

### 3. Configure FastAPI

Create `Backend/.env`:

```bash
N8N_GROCERY_WEBHOOK_URL=http://localhost:5678/webhook/grocery
N8N_TRANSPORT_WEBHOOK_URL=http://localhost:5678/webhook/transport
```

### 4. Test the Connection

```bash
# Start FastAPI
cd Backend
uvicorn main:app --reload

# Create a user
curl -X POST http://localhost:8000/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "weekly_budget": 200,
    "home_address": "123 George St, Sydney NSW 2000"
  }'

# Test grocery optimization (calls n8n)
curl -X POST http://localhost:8000/optimise/groceries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "grocery_list": ["Milk (1L)", "Bread (Loaf)"]
  }'
```

## Documentation Guide

### For First-Time Users

Start here:

1. [Basic Setup](./BASIC_SETUP.md) - Get n8n running
2. [Webhook FAQ](./WEBHOOK_FAQ.md) - Understand the architecture
3. [Setup Checklist](./SETUP_CHECKLIST.md) - Connect everything

### For Multi-Agent Setup

If you have multiple agents (Coles, Fuel, Maps):

1. [Your Setup Explained](./YOUR_SETUP_EXPLAINED.md) - Understand your architecture
2. [Multi-Agent Setup](./MULTI_AGENT_SETUP.md) - Detailed configuration
3. [Architecture](./ARCHITECTURE.md) - Visual diagrams

### For Troubleshooting

Check:

1. [Setup Checklist](./SETUP_CHECKLIST.md) - Troubleshooting section
2. [Webhook FAQ](./WEBHOOK_FAQ.md) - Common issues
3. FastAPI logs for error messages

## What FastAPI Sends to n8n

### Grocery Optimization Request

```json
{
  "message": "Find grocery prices for Milk (1L), Bread (Loaf) near 123 George St, Sydney NSW 2000",
  "grocery_list": ["Milk (1L)", "Bread (Loaf)"],
  "home_address": "123 George St, Sydney NSW 2000",
  "type": "grocery_optimization"
}
```

### Transport Comparison Request

```json
{
  "destination": "456 Park Ave, Sydney NSW 2000",
  "fuel_amount_needed": 40.0,
  "home_address": "123 George St, Sydney NSW 2000",
  "type": "transport_comparison"
}
```

## What n8n Should Return

### Grocery Optimization Response

```json
{
  "optimal_cost": 15.5,
  "store_recommendations": ["Coles Bondi", "Coles Randwick"],
  "item_breakdown": [
    {
      "item_name": "Milk (1L)",
      "current_price": 1.5,
      "store_name": "Coles Bondi"
    },
    {
      "item_name": "Bread (Loaf)",
      "current_price": 3.0,
      "store_name": "Coles Randwick"
    }
  ]
}
```

### Transport Comparison Response

```json
{
  "stations": [
    {
      "station_name": "Shell Bondi",
      "address": "123 Beach Rd, Bondi NSW 2026",
      "distance_from_home": 2.5,
      "price_per_liter": 1.85,
      "cost_to_reach_station": 3.5,
      "fuel_cost_at_station": 74.0,
      "total_cost": 77.5
    }
  ]
}
```

## Common Issues

### "n8n service unavailable"

- Check n8n is running: `n8n start`
- Check workflow is activated (toggle in n8n)
- Check webhook URL in `.env` matches n8n
- Test webhook directly with curl

### Wrong response format

- Check the last node before "Respond to Webhook"
- Ensure it returns the correct JSON structure
- See response format examples above

### Agents not being called

- Check your switch/router node in n8n
- Ensure it routes based on `type` field or `message` content
- Add debug nodes to see data flow

## Architecture Patterns

### Pattern 1: Single Workflow

```
Webhook → Parse Input → Switch → Agents → Combine → Response
```

Best for: Simple setups, demos, testing

### Pattern 2: Multiple Workflows

```
Main Workflow → HTTP Request → Agent Workflow → Response
```

Best for: Complex agents, reusable components, production

### Pattern 3: Hybrid

```
Main Workflow → Switch → [Some agents inline, some via HTTP]
```

Best for: Gradual migration, mixed complexity

## Next Steps

1. ✅ Get basic n8n workflow running
2. 🚀 Connect real APIs (Coles, Google Maps, NSW Fuel)
3. 🚀 Add error handling and retries
4. 🚀 Add authentication to webhooks
5. 🚀 Deploy to n8n Cloud or self-hosted server

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Main Backend README](../../README.md)

## Support

For issues:

1. Check the troubleshooting sections in each guide
2. Review n8n execution logs
3. Check FastAPI application logs
4. Test webhooks directly with curl
