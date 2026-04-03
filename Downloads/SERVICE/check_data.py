import sqlite3
import os

db_path = r'c:\Users\Lenovo\Downloads\SERVICE\main\backend\servsync.db'
if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def count(table, condition=""):
    try:
        sql = f"SELECT count(*) FROM {table}"
        if condition:
            sql += f" WHERE {condition}"
        cursor.execute(sql)
        return cursor.fetchone()[0]
    except Exception as e:
        return f"Error: {e}"

print(f"Driver Locations: {count('driver_locations')}")
print(f"Accepted Bookings: {count('bookings', 'status=\"ACCEPTED\"')}")
print(f"In Progress Bookings: {count('bookings', 'status=\"IN_PROGRESS\"')}")
print(f"Completed Bookings: {count('bookings', 'status=\"COMPLETED\"')}")

conn.close()
