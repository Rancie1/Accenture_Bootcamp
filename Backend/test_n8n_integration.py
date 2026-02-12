"""
Quick test script to verify n8n webhook integration.

Run this to test if the n8n webhook is working correctly.
"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_n8n_webhook():
    """Test the n8n webhook with a sample request."""
    
    webhook_url = os.getenv(
        "N8N_MAIN_WEBHOOK_URL",
        "https://louisjean.app.n8n.cloud/webhook-test/26b8906b-6df5-4228-9d8b-859118b52338"
    )
    
    print(f"Testing n8n webhook: {webhook_url}")
    print("-" * 60)
    
    # Test payload matching your n8n workflow format
    payload = {
        "sessionId": "test-session-123",
        "userMessage": "I need to buy milk, bread, and eggs. My address is 123 Test St, Sydney NSW 2000. Please find the best prices."
    }
    
    print(f"Sending payload:")
    print(f"  sessionId: {payload['sessionId']}")
    print(f"  userMessage: {payload['userMessage']}")
    print("-" * 60)
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print("-" * 60)
            
            if response.status_code == 200:
                print("✅ SUCCESS! n8n webhook is working")
                print(f"Response Body:")
                try:
                    response_json = response.json()
                    import json
                    print(json.dumps(response_json, indent=2))
                    
                    # Validate response format
                    print("\n" + "=" * 60)
                    print("Response Format Validation:")
                    print("=" * 60)
                    
                    if isinstance(response_json, list) and len(response_json) > 0:
                        print("✅ Response is a list")
                        first_item = response_json[0]
                        
                        if "user_message" in first_item:
                            print("✅ Contains 'user_message'")
                        else:
                            print("⚠️  Missing 'user_message'")
                        
                        if "agent_answers" in first_item:
                            print("✅ Contains 'agent_answers'")
                            agents = first_item["agent_answers"]
                            print(f"   Found {len(agents)} agent responses:")
                            for agent in agents:
                                route = agent.get("route", "unknown")
                                print(f"   - {route}")
                        else:
                            print("⚠️  Missing 'agent_answers'")
                    else:
                        print("⚠️  Response is not in expected format (should be a list)")
                        
                except Exception as e:
                    print(f"⚠️  Could not parse as JSON: {e}")
                    print(response.text)
            else:
                print(f"❌ ERROR: Received status code {response.status_code}")
                print(f"Response: {response.text}")
                
    except httpx.TimeoutException:
        print("❌ ERROR: Request timed out after 30 seconds")
    except httpx.ConnectError as e:
        print(f"❌ ERROR: Failed to connect to n8n webhook")
        print(f"Details: {str(e)}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("n8n Webhook Integration Test")
    print("=" * 60)
    asyncio.run(test_n8n_webhook())
