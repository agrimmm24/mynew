import sqlite3
import os

db_path = r'c:\Users\Lenovo\Downloads\SERVICE\main\backend\servsync.db'
if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute('SELECT id, email, full_name, role FROM users WHERE role="ADMIN"')
    admins = cursor.fetchall()
    print("Admin Users in Database:")
    for a in admins:
        print(f"ID: {a[0]}, Email: {a[1]}, Name: {a[2]}, Role: {a[3]}")
    
    if not admins:
        print("No Admin Users found!")
except Exception as e:
    print(f"Error: {e}")

conn.close()
