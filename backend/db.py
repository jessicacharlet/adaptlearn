import os
from functools import lru_cache

try:
    from pymongo import MongoClient
    from pymongo.errors import PyMongoError
except ImportError:  # pragma: no cover
    MongoClient = None
    PyMongoError = Exception


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "adaptive_learning_db")


@lru_cache(maxsize=1)
def get_client():
    if MongoClient is None:
        raise RuntimeError("pymongo is not installed.")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    client.admin.command("ping")
    return client


def get_db():
    return get_client()[MONGO_DB_NAME]


def get_collection(name: str):
    return get_db()[name]


def is_mongo_available() -> bool:
    try:
        get_client()
        return True
    except PyMongoError:
        return False
    except Exception:
        return False
