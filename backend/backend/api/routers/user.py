from fastapi import APIRouter, HTTPException, Depends
from core.auth import hash_password, verify_password
from core.middleware import get_current_user
from models.user import User
from core.database import db
router = APIRouter()

@router.get("")
async def create_context(
    user: User = Depends(get_current_user)
):
    total_contexts = await db.get_collection("contexts").count_documents({"user_id": user["_id"]})
    r = {
        "name": user["name"],
        "email": user["email"],
        "isAdmin": user["is_admin"],
        "createdAt": user["created_at"],
        "totalContexts": total_contexts,
        "position": user["position"]
    }
    return r
@router.post("/update")
async def update_user(
    email: str,
    curretnPassword: str,
    newPassword: str,
    user: User = Depends(get_current_user)
):
    # Match the email sent with the user email
    if email != user["email"]:
        raise HTTPException(status_code=400, detail="Invalid email")
    # Check if the current password is correct
    if not verify_password(curretnPassword, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")
    # Update the password
    users_collection = db.get_collection("users")
    new_password = hash_password(newPassword)
    await users_collection.update_one({"email": email}, {"$set": {"password": new_password}})
    return {"msg": "Password updated successfully"}