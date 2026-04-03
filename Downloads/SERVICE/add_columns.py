import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load main backend env
load_dotenv(os.path.join("main", "backend", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment.")
    exit(1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Connecting to database...")
    
    # Check if columns exist
    try:
        conn.execute(text("SELECT operational_days FROM users LIMIT 1"))
        print("Column 'operational_days' already exists.")
    except Exception as e:
        print("Adding 'operational_days' and 'operational_timings' columns...")
        # We need another connection because the previous one's transaction is aborted by the error
        pass

with engine.connect() as conn:
    # Begin transaction
    trans = conn.begin()
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS operational_days VARCHAR(50) DEFAULT 'Mon-Sun'"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS operational_timings VARCHAR(50) DEFAULT '24/7'"))
        
        # Backfill existing providers
        conn.execute(text("UPDATE users SET operational_days = 'Mon-Sun', operational_timings = '24/7' WHERE role = 'PROVIDER' AND operational_days IS NULL"))
        trans.commit()
        print("Migration successful! Added new columns to users table.")
    except Exception as e:
        trans.rollback()
        print(f"Migration failed: {e}")
