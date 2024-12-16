from io import BytesIO
import os
from fastapi import APIRouter, HTTPException, Depends, Request, Form
from bson import ObjectId
from datetime import datetime, timezone
from typing import List
from models.chat import Chat, Message
from models.context import Context
from models.user import User
from core.database import db
from redisDB.database import redis_cache as cache   
from core.middleware import get_current_user
import base64
from PIL import Image
from core.model import analyze
import json
from fastapi.responses import JSONResponse
from fastapi import File, UploadFile
import sys
from typing import Optional
from pathlib import Path
# Add the project's top-level directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from config_model import BASE_DIR, MODE

# from core.model import model
router = APIRouter()
mode = MODE

# GET /context - Get all context titles and IDs for the authenticated user
@router.delete("/context/{context_id}")
async def delete_context(context_id: str, user: User = Depends(get_current_user)):
    context_collection = db.contexts_collection
    context = await context_collection.find_one({"_id": ObjectId(context_id), "user_id": user["_id"]})
    if not context:
        raise HTTPException(status_code=404, detail="Context not found for this user")
    
    # Delete the context and associated chats
    await context_collection.delete_one({"_id": ObjectId(context_id), "user_id": user["_id"]})
    await db.chats_collection.delete_many({"context_id": ObjectId(context_id), "user_id": user["_id"]})
    await cache.delete(context_id, user["_id"])
    remContext = context_collection.find({"user_id": ObjectId(user["_id"])})
    contexts = await remContext.to_list(length=100)
    #Array with only the context titles and id
    filtered_contexts = [{"title": context["title"], "id": str(context["_id"])} for context in contexts]
    return filtered_contexts


# GET /context - Get all context titles and IDs for the authenticated user
@router.get("/context")
async def get_all_contexts(user: User = Depends(get_current_user)):
    context_collection = db.contexts_collection
    contexts_cursor = context_collection.find({"user_id": ObjectId(user["_id"])})
    contexts = await contexts_cursor.to_list(length=100)  # Limit to 100 contexts for now
    #Array with only the context titles and id
    filtered_contexts = [{"title": context["title"], "id": str(context["_id"])} for context in contexts]
    return filtered_contexts


# # POST /context - Create a new context and return all context IDs and titles for the user

@router.post("/context")
async def create_context(
    chat_request : Request,  # Accept multiple image uploads
    user: User = Depends(get_current_user)
):
    req = await chat_request.json()
    message = req["message"]
    images = req["images"]
    videos = req["videos"]
    pdfs = req["pdfs"]
    context_collection = db.contexts_collection
    # Handle case where neither message nor images are provided
    if not message and not images and not videos and not pdfs:
        raise HTTPException(status_code=400, detail="Either message or images must be provided")
    
    # Create context title based on message or default
    title = (message[:10] + "...") if message else "Untitled Context"
    
    new_context = {
        "user_id": user["_id"],
        "title": title,
        "created_at": datetime.now(timezone.utc)
    }
    result = await context_collection.insert_one(new_context)
    new_context["_id"] = result.inserted_id
    context_id = result.inserted_id
    # Process images if provided
    video_filenames = []
    image_filenames = []
    pdf_filenames = []
    # Define image_paths and video_paths lists before the loops
    image_paths = []
    video_paths = []
    pdf_paths = []
    # Process images if provided
    for image in images:
        try:
            # Create images directory if it doesn't exist
            # Generate unique filename for each image
            image_data = base64.b64decode(image)
            img = Image.open(BytesIO(image_data))
            image_filename = f"{context_id}_{datetime.now().timestamp()}.png"
            image_path = Path("images") / image_filename
            # os.makedirs(os.path.dirname(image_path), exist_ok=True)
            img.save(image_path, "PNG")
            
            # Append the path to the image_paths list
            image_paths.append(image_path)  # Store the full path
            
            # Store relative path for analyze function
            image_filenames.append(image_filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

    # Process videos if provided
    for video in videos:
        try:
            # Create videos directory if it doesn't exist            
            # Generate unique filename for each video
            video_data = base64.b64decode(video)
            video_filename = f"{context_id}_{datetime.now().timestamp()}.mp4"
            video_path = os.path.join("videos", video_filename)
                
            with open(video_path, "wb") as f:
                f.write(video_data)
            video_filenames.append(video_filename)
            video_paths.append(video_path) 
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing video: {str(e)}")
    for pdf in pdfs:
        try:
            # Create videos directory if it doesn't exist
            os.makedirs("pdfs", exist_ok=True)
            
            # Generate unique filename for each video
            pdf_data = base64.b64decode(pdf)
            pdf_filename = f"{context_id}_{datetime.now().timestamp()}.pdf"
            pdf_path = Path("pdfs") / pdf_filename
                
            with open(pdf_path, "wb") as f:
                f.write(pdf_data)
            pdf_filenames.append(pdf_filename)
            
            pdf_paths.append(pdf_path)  # Store the full path
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing pdf: {str(e)}")
    # Use analyze function to get bot's response
    
    if mode == "model":
        try:
            if image_paths and video_paths and message:
                # All inputs: images, videos, and text query
                ai_response = analyze(query=message, image_files=image_filenames, video_files=video_paths)
            elif image_paths and message:
                # Images and text query only
                ai_response = analyze(query=message, image_files=image_filenames)
            elif video_paths and message:
                # Videos and text query only
                ai_response = analyze(query=message, video_files=video_filenames)
            elif image_paths and video_paths:
                # Images and videos only
                ai_response = analyze(query=None, image_files=image_filenames, video_files=video_filenames)
            elif image_paths:
                # Images only
                ai_response = analyze(query=None, image_files=image_filenames)
            elif video_paths:
                # Videos only
                ai_response = analyze(query=None, video_files=video_filenames)
            elif pdf_paths: 
                ai_response = analyze(query=None, pdf_files=pdf_filenames)
            elif message:
                # Text query only
                ai_response = analyze(query=message)
            else:
                # No valid input
                ai_response = "No input provided to generate a response."
        except Exception as e:
            ai_response = f"An error occurred while generating the response: {str(e)}"

    elif mode == "notmodel":
        ai_response = "This is the first response without a model."
    else:
        ai_response = "Invalid mode provided. Please use 'model' or 'notmodel'."


    # Create the chat context with the user's input and bot's response
    new_chat = {
        "context_id": new_context["_id"],
        "user_id": user["_id"],
        "chats": [
            {
                "sender": "user",
                "message": message,
                "images": image_filenames,
                "videos": video_filenames,
                "pdfs": pdf_filenames,
                "timestamp": datetime.now(timezone.utc)
            },
            {
                "sender": "bot",
                "message": ai_response,
                "timestamp": datetime.now(timezone.utc)
            }
        ]
    }
    db.chats_collection.insert_one(new_chat)
    
    return {
        "id": str(new_context["_id"]),
        "title": new_context["title"],
        "response": ai_response,
        "images": image_filenames,  # Return the list of image filenames to the frontend
        "videos": video_filenames,
        "pdfs": pdf_filenames
    }


@router.get("/{context_id}")
async def get_chats_by_context(context_id: str, user: User = Depends(get_current_user)):
    chat_document = await cache.get(context_id, user["_id"])
    if not chat_document:
        raise HTTPException(status_code=404, detail="Chat context not found for this user")
    
    return chat_document


# Backend endpoint modification
@router.post("/{context_id}")
async def post_chat_to_context(context_id: str, chat_request: Request, user: User = Depends(get_current_user)):
    chat_document = await chat_request.json()
    if not chat_document.get("message") and not chat_document.get("images") and not chat_document.get("videos") and not chat_document.get("pdfs"):
        raise HTTPException(status_code=400, detail="Either message or images must be provided")
    # Handle multiple images if provided
    context = await cache.get(context_id, user["_id"])
    image_paths = []
    video_paths = []
    pdf_paths = []
    if chat_document.get("images"):
        os.makedirs("images", exist_ok=True)
        for encoded_image in chat_document["images"]:
            try:
                # Decode and save each image
                image_data = base64.b64decode(encoded_image)
                image = Image.open(BytesIO(image_data))
                image_filename = f"{context_id}_{datetime.now().timestamp()}_{len(image_paths)}.png"
                image_path = Path("images") / image_filename
                image.save(image_path, "PNG")
                image_paths.append(image_path)
                print(image_path)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")
            
    if chat_document.get("videos"):
        os.makedirs("videos", exist_ok=True)
        for encoded_video in chat_document["videos"]:
            try:
                # Decode and save each video
                video_data = base64.b64decode(encoded_video)
                video_filename = f"{context_id}_{datetime.now().timestamp()}_{len(video_paths)}.mp4"
                video_path = os.path.join("videos", video_filename)
                with open(video_path, "wb") as f:
                    f.write(video_data)
                # Store full path for analyze function
                video_paths.append(video_path)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error processing video: {str(e)}")
    if chat_document.get("pdfs"):
        os.makedirs("pdfs", exist_ok=True)
        for encoded_pdf in chat_document["pdfs"]:
            try:
                # Decode and save each pdf
                pdf_data = base64.b64decode(encoded_pdf)
                pdf_filename = f"{context_id}_{datetime.now().timestamp()}_{len(pdf_paths)}.pdf"
                pdf_path = Path("pdfs") / pdf_filename
                with open(pdf_path, "wb") as f:
                    f.write(pdf_data)
                # Store full path for analyze function
                pdf_paths.append(pdf_path)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error processing pdf: {str(e)}")
    # Create a user message log with relative paths for storage
    relative_paths = [os.path.basename(path) for path in image_paths]
    relative_paths_videos = [os.path.basename(path) for path in video_paths]
    reltaive_paths_pdfs = [os.path.basename(path) for path in pdf_paths]
    new_message = [{
        "sender": "user",
        "message": chat_document["message"],
        "images": relative_paths,  # Store relative paths for DB,
        "videos": relative_paths_videos,
        "pdfs": reltaive_paths_pdfs,
        "timestamp": datetime.now(timezone.utc)
    }]

    
    # print("video path: ", relative_paths_videos)
  
    # Pass the query and full image paths to the analyze function
    # if mode == "model":
    #     try:
    #         if image_paths:
    #             ai_response = analyze(query=chat_document["message"], image_files=image_paths[0])
    #         else:
    #             ai_response = analyze(query=chat_document["message"])
            
    #     except Exception as e:
    #         ai_response = f"An error occurred while generating the response: {str(e)}"
    # elif mode == "notmodel":
    #     ai_response = "This is chat message after first response without model"
    # else:
    #     ai_response = "Invalid mode provided. Please use 'model' or 'notmodel'"

    context = context['chats']
    if mode == "model":
        try:
            if image_paths and video_paths and chat_document["message"]:
                # All inputs: images, videos, and text query
                ai_response = analyze(query=chat_document["message"], history=context, image_files=image_filename, video_files=video_filename)
            elif image_paths and chat_document["message"]:
                # Images and text query only
                ai_response = analyze(query=chat_document["message"],history=context, image_files=image_filename)
            elif video_paths and chat_document["message"]:
                # Videos and text query only
                ai_response = analyze(query=chat_document["message"],history=context, video_files=video_filename)
            elif image_paths:
                # Images only
                ai_response = analyze(query=None,history=context, image_files=image_filename)
            elif pdf_paths:
                ai_response = analyze(query=None,history=context, pdf_files=pdf_filename)
            elif video_paths:
                # Videos only
                ai_response = analyze(query=None,history=context, video_files=video_filename)
            elif chat_document["message"]:
                # Text query only
                ai_response = analyze(query=chat_document["message"], history=context)
            else:
                ai_response = "No input provided to generate a response."
        except Exception as e:
            ai_response = f"An error occurred while generating the response: {str(e)}"
    elif mode == "notmodel":
        ai_response = "This is chat message after first response without model"
    else:
        ai_response = "Invalid mode provided. Please use 'model' or 'notmodel'"

    # Append the bot's response to conversation
    new_message.append({
        "sender": "bot",
        "message": ai_response,
        "timestamp": datetime.now(timezone.utc)
    })

    # Update the chat context in Redis cache
    await cache.update(context_id, user["_id"], new_message)
    return new_message


# @router.post("/{context_id}")
# async def post_chat_to_context(context_id: str, chat_request: Request, user: User = Depends(get_current_user)):
#     chat_document = await chat_request.json()
#     if(chat_document.get("image")):
#         print("Image received")
#         #Base 64 image, build it
#         image_data = base64.b64decode(chat_document["image"])
#         image = Image.open(BytesIO(image_data))
#         image_path = f"images/{context_id}_{datetime.now().timestamp()}.png"
#         os.makedirs(os.path.dirname(image_path), exist_ok=True)
#         image.save(image_path)
#         chat_document["image"] = image_path.replace("images/", "")
#     print(chat_document)
#     new_message = [{
#         "sender": "user",
#         "message": chat_document["message"],
#         "image": chat_document.get("image") if chat_document.get("image") else None,
#         "timestamp": datetime.now(timezone.utc)
#     }]

    
#     # Prepare the message content
#     user_message = chat_document["message"]
#     image_path = chat_document.get("image")
#     # BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#     # IMAGE_DIR = os.path.join(BASE_DIR, "images")
#     image_path = os.path.join("/home/raw/Desktop/Coding/udit_new_military_int_icc/backend/images", image_path)
#     print("image path is------------------ : ", image_path)

#     # ai_response = model.getResponse(chat_request)
#     # ai_response = "This is a placeholder response from the AI model"


#     print("Chat response start hone wala h dekh lo")
#     ai_response = analyze(query=user_message , image_file=image_path)
#     print(ai_response)

#     new_message.append({
#         "sender": "bot",
#         "message": ai_response,
#         "timestamp": datetime.now(timezone.utc)
#     })
#     await cache.update(context_id, user["_id"], new_message)
#     return new_message