import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def test_conn(env_path):
    print(f"Testing connection for {env_path}...")
    load_dotenv(env_path, override=True)
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print(f"Error: DATABASE_URL not found in {env_path}")
        return
    
    # Print the host for verification
    from urllib.parse import urlparse
    parsed = urlparse(db_url)
    print(f"Connecting to host: {parsed.hostname} on port {parsed.port}")
    
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"Success: {result.fetchone()}")
    except Exception as e:
        print(f"Failure: {e}")

if __name__ == "__main__":
    test_conn("main/backend/.env")
    test_conn("admin/adminback/.env")
