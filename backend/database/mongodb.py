import os
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
DATABASE_NAME = os.getenv("DATABASE_NAME", "printing_dashboard")

client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None

async def connect_to_mongo():
    global client, db
    if MONGODB_URI:
        try:
            client = AsyncIOMotorClient(MONGODB_URI)
            db = client[DATABASE_NAME]
            print(f"Connected to MongoDB Atlas: {DATABASE_NAME}")
        except Exception as e:
            print(f"MongoDB connection error: {e}. Fallback to in-memory mode.")
            client = None
            db = None
    else:
        print("MONGODB_URI not provided. Running in memory / mock DB mode.")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection.")

def get_database() -> Optional[AsyncIOMotorDatabase]:
    return db
