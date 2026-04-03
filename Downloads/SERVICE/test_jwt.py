import sys
import os
import time

# Add both backends to path
sys.path.append(r"c:\Users\Lenovo\Downloads\SERVICE\admin\adminback")
sys.path.append(r"c:\Users\Lenovo\Downloads\SERVICE\main\backend")

from admin.adminback.auth import create_access_token as admin_create
from main.backend.auth import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

def test_token():
    # 1. Create token from adminback logic
    print("SECRET_KEY main:", SECRET_KEY)
    
    token = admin_create(data={"sub": "test@example.com", "role": "CUSTOMER"})
    print("Token created:", token)
    
    # 2. Decode using main logic
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decode successful:", payload)
    except JWTError as e:
        print("Decode failed:", e)

if __name__ == "__main__":
    test_token()
