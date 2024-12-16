import asyncio
from redis.asyncio import Redis
from bson import ObjectId
from datetime import datetime, timezone
from pymongo import ReturnDocument
from pydantic import BaseModel
import json
from core.database import db  
from fastapi import HTTPException
# Redis Connection Manager
class RedisCache:
    """Redis caching and synchronization utility."""
    
    def __init__(self, redis_url: str):
        self.client = Redis.from_url(redis_url, decode_responses=True)
        print("Redis client initialized.")
    
    async def connect(self):
        """Connect to Redis and subscribe to key expiration events."""
        await self.client.config_set("notify-keyspace-events", "Ex")
        print("Connected to Redis!")
    
    async def close(self):
        """Close the Redis connection."""
        await self.client.close()
        print("Disconnected from Redis!")

    async def get(self, context_id: str, user_id: str):
        """
        Retrieve chats from Redis for the given context and user ID.
        If not found, fetch from MongoDB, populate Redis, and return the data.
        """
        print("Getting chats from Redis...")
        redis_key = f"{context_id}:user:{user_id}"
        chats_json = await self.client.get(redis_key)

        if chats_json:
            return json.loads(chats_json)
        chat_document = await db.chats_collection.find_one(
            {"context_id": ObjectId(context_id), "user_id": ObjectId(user_id)}
        )
        if not chat_document:
            return None

        # Transform MongoDB data for caching
        chat_document["_id"] = str(chat_document["_id"])
        chat_document["context_id"] = str(chat_document["context_id"])
        chat_document["user_id"] = str(chat_document["user_id"])
        try:
            for message in chat_document["chats"]:
                message["timestamp"] = message["timestamp"].isoformat()
        except Exception as e:
            pass
        await self.client.set(redis_key, json.dumps(chat_document), ex=3600)
        return chat_document

    async def update(self, context_id: str, user_id: str, new_chats: list[dict]):    
        """
        Update chats in Redis and MongoDB for the given context and user ID.
        """
        redis_key = f"{context_id}:user:{user_id}"
        chat_document = await self.get(context_id, user_id)  # Fetch current data

        if not chat_document:
            raise HTTPException(status_code=404, detail="Chat context not found for this user")

        # Update chats in memory
        for message in new_chats:
            message["timestamp"] = datetime.now(timezone.utc).isoformat()
        chat_document["chats"].extend(new_chats)

        # Update Redis
        await self.client.set(redis_key, json.dumps(chat_document), ex=3600)

        # Update MongoDB
        try:
            await db.chats_collection.find_one_and_update(
                {"context_id": ObjectId(context_id), "user_id": ObjectId(user_id)},
                {"$set": {"chats": chat_document["chats"]}},
                return_document=ReturnDocument.AFTER,
                upsert=True
            )
        except Exception as e:
            print(f"Error updating MongoDB: {e}")


        
    async def delete(self, context_id: str, user_id: str):
        """
        Delete chats from Redis and MongoDB for the given context and user ID.
        """
        redis_key = f"{context_id}:user:{user_id}"
        chat_document = await self.client.delete(redis_key)
        return chat_document


# Initialize Redis
redis_cache = RedisCache(redis_url="redis://localhost:6379")

# Example usage in your application
async def initialize_services():
    await redis_cache.connect()
    await db.connect()

async def close_services():
    await redis_cache.close()
    await db.close()
