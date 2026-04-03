import os
import asyncio
import httpx
from datetime import datetime

async def verify_health_endpoint(port=8000):
    """Checks if the health endpoint is reachable."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"http://127.0.0.1:{port}/api/health")
            print(f"Health check at port {port}: {response.status_code} - {response.json()}")
            return response.status_code == 200
        except Exception as e:
            print(f"Health check failed at port {port}: {e}")
            return False

if __name__ == "__main__":
    print("Verification script ready. To test full integration:")
    print("1. Set RENDER_EXTERNAL_URL=http://127.0.0.1:8000")
    print("2. Run 'python main.py' in the backend folder")
    print("3. Check logs for Rocketry ping confirmations.")
