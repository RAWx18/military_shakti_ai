from model_loader import model, tokenizer, processor  # Importing from model_loader.py
import asyncio
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import torch
from transformers import AutoTokenizer
import importlib.util
import sys
import os

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific domains for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze/")
async def analyze(query: str = Form(...), image: UploadFile = None):
    try:
        # Process the image if provided
        img = None
        if image:
            img = Image.open(image.file).convert("RGB")
            print("Image loaded successfully:", img.size)

        # Prepare messages
        messages = [
            {"role": "user", "content": f"""<|image|>
{query}"""},
            {"role": "assistant", "content": ""}
        ]

        print("Query:", query)
        print("Image:", img)

        # Process inputs
        inputs = processor(messages, images=[img] if img else None, videos=None)
        inputs.to('cuda')
        inputs.update({
            'tokenizer': tokenizer,
            'max_new_tokens': 500,
            'decode_text': True,
        })

        # Generate the response
        print("Output generation is started. ")
        output = model.generate(**inputs)

        print("Output generation is ended. ")
        print(output[0])

        # Send the output
        return JSONResponse(content={"response": output[0]})
    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
