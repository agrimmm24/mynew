import requests
import sys
import os
sys.path.append(r"c:\Users\Lenovo\Downloads\SERVICE\admin\adminback")
from auth import create_access_token

def test_request():
    token = create_access_token(data={"sub": "mechanic@garage.com", "role": "PROVIDER"})
    print("Generated token:", token)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Let's test booking endpoint which requires current_user
    res = requests.get("http://localhost:8000/bookings/", headers=headers)
    print("Response Status:", res.status_code)
    try:
        print("Response Body:", res.json()[:50])
    except:
        print("Response Text:", res.text)

if __name__ == "__main__":
    test_request()
