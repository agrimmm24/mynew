import requests

def test_telemetry():
    base_url = "http://localhost:5000"
    login_url = f"{base_url}/admin/auth/login"
    login_data = {"email": "servsyncnevermissaserviceagain@gmail.com", "password": "admin123"}
    
    # Login to get token
    print("Logging in...")
    login_resp = requests.post(login_url, json=login_data)
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.status_code} - {login_resp.text}")
        return
    
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get all users to find a valid UUID
    print("Fetching users...")
    users_resp = requests.get(f"{base_url}/admin/users", headers=headers)
    if users_resp.status_code != 200:
        print(f"Fetch users failed: {users_resp.status_code} - {users_resp.text}")
        return
    
    users = users_resp.json()
    if not users:
        print("No users found.")
        return
    
    target_user_id = users[0]["id"]
    print(f"Testing telemetry for user ID: {target_user_id}")
    
    # Call telemetry endpoint
    telemetry_url = f"{base_url}/admin/users/{target_user_id}/telemetry"
    telemetry_resp = requests.get(telemetry_url, headers=headers)
    
    print(f"Telemetry Result: {telemetry_resp.status_code}")
    if telemetry_resp.status_code != 200:
        print(f"Error detail: {telemetry_resp.text}")
    else:
        print("Telemetry fetch successful!")

if __name__ == "__main__":
    test_telemetry()
