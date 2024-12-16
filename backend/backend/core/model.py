import os
import sys
import io
import torch
from PIL import Image
from transformers import AutoTokenizer
import importlib.util
from decord import VideoReader, cpu
import fitz  # PyMuPDF for PDF processing
from pathlib import Path
# Add the project's top-level directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from config_model import BASE_DIR, COMPUTE_TYPE, MODE

MAX_NUM_FRAMES = 16

# Set the device based on configuration
DEVICE = torch.device("cuda" if (COMPUTE_TYPE == "gpu" and torch.cuda.is_available()) else "cpu")
print(f"Using device: {DEVICE}")
if COMPUTE_TYPE == "gpu" and torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")

# Function to dynamically load the model and tokenizer
def load_model(model_dir):
    sys.path.append(model_dir)

    config_module_path = os.path.join(model_dir, "configuration_shakti.py")
    model_module_path = os.path.join(model_dir, "modeling_shakti.py")

    spec_config = importlib.util.spec_from_file_location("shaktiConfig", config_module_path)
    if spec_config is None or spec_config.loader is None:
        raise ImportError(f"Failed to load configuration module from {config_module_path}")
    config_module = importlib.util.module_from_spec(spec_config)
    sys.modules["shaktiConfig"] = config_module
    spec_config.loader.exec_module(config_module)

    spec_model = importlib.util.spec_from_file_location("shaktiModel", model_module_path)
    if spec_model is None or spec_model.loader is None:
        raise ImportError(f"Failed to load model module from {model_module_path}")
    model_module = importlib.util.module_from_spec(spec_model)
    sys.modules["shaktiModel"] = model_module
    spec_model.loader.exec_module(model_module)

    from shaktiConfig import shaktiConfig
    from shaktiModel import shaktiModel

    config = shaktiConfig.from_pretrained(model_dir)
    model = shaktiModel.from_pretrained(
        model_dir,
        config=config,
        attn_implementation='sdpa',
        torch_dtype=torch.float16 if DEVICE.type == "cuda" else torch.float32
    )
    model.eval().to(DEVICE)

    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    processor = model.init_processor(tokenizer)

    return model, tokenizer, processor

model_dir = os.path.join(BASE_DIR, "shakti-2B-041224")
if MODE == "model":
    model, tokenizer, processor = load_model(model_dir)
else:
    print("Running without model.")
print("Model and tokenizer loaded successfully.")

# Function to encode video into frames
def encode_video(video_path):
    def uniform_sample(l, n):
        gap = len(l) / n
        idxs = [int(i * gap + gap / 2) for i in range(n)]
        return [l[i] for i in idxs]

    vr = VideoReader(video_path, ctx=cpu(0))
    sample_fps = round(vr.get_avg_fps() / 1)
    frame_idx = [i for i in range(0, len(vr), sample_fps)]
    if len(frame_idx) > MAX_NUM_FRAMES:
        frame_idx = uniform_sample(frame_idx, MAX_NUM_FRAMES)
    frames = vr.get_batch(frame_idx).asnumpy()
    frames = [Image.fromarray(v.astype('uint8')) for v in frames]
    print(f"Encoded {len(frames)} frames from video: {video_path}")
    return frames

# Function to process PDFs
def process_pdf(pdf_path):
    processed_images = []
    extracted_text = ""

    with fitz.open(pdf_path) as pdf:
        for page_num in range(len(pdf)):
            page = pdf[page_num]

            # Extract text
            extracted_text += page.get_text()

            # Extract images
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = pdf.extract_image(xref)
                image_bytes = base_image["image"]
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                processed_images.append(img)

    print(f"Processed PDF: {pdf_path} with {len(processed_images)} images extracted.")
    return processed_images, extracted_text

# Helper function for processing inputs
def process_inputs_with_model(model, processor, tokenizer, query, images=None, videos=None, pdfs=None):
    print("Processing inputs...")

    # Prepare images
    processed_images = []
    if images:
        for image_file in images:
            path = os.path.join(BASE_DIR, "backend", "images", image_file)
            if not os.path.exists(path):
                raise FileNotFoundError(f"Image file {path} not found.")
            img = Image.open(path).convert("RGB")
            processed_images.append(img)

    # Prepare videos
    processed_videos = []
    if videos:
        for video_file in videos:
            path = os.path.join(BASE_DIR, "backend", "videos", video_file)
            if not os.path.exists(path):
                raise FileNotFoundError(f"Video file {path} not found.")
            frames = encode_video(path)
            processed_videos.append(frames)

    # Prepare PDFs
    processed_pdf_images = []
    pdf_text = ""
    if pdfs:
        for pdf_file in pdfs:
            path = os.path.join(BASE_DIR, "backend", "pdfs", pdf_file)
            if not os.path.exists(path):
                raise FileNotFoundError(f"PDF file {path} not found.")
            pdf_images, pdf_extracted_text = process_pdf(path)
            processed_pdf_images += pdf_images
            pdf_text += pdf_extracted_text

    # Prepare messages
    tokens = ""
    if processed_images or processed_videos or processed_pdf_images:
        image_tokens = "<|image|>" * len(processed_images + processed_pdf_images)
        video_tokens = "<|video|>" * len(processed_videos)
        tokens = image_tokens + video_tokens

    messages = [
        {"role": "user", "content": f"{tokens}{query}\n{pdf_text}"},
        {"role": "assistant", "content": ""}
    ]

    inputs = processor(
        messages,
        images=processed_images + processed_pdf_images if processed_images or processed_pdf_images else None,
        videos=processed_videos if processed_videos else None
    )
    inputs = inputs.to(DEVICE)
    inputs.update({
        'tokenizer': tokenizer,
        'max_new_tokens': 500,
        'decode_text': True,
    })

    print("Generating response...")
    with torch.no_grad():
        output = model.generate(**inputs)
    print("Response generation complete.")
    return output[0]

def analyze(query=None, history = [], image_files=None, video_files=None, pdf_files=None):
    try:
        print("Analyzing the input query, images, videos, and PDFs...")

        if isinstance(image_files, str):
            image_files = [image_files]
        if isinstance(video_files, str):
            video_files = [video_files]
        if isinstance(pdf_files, str):
            pdf_files = [pdf_files]
        history = "\n".join(f"{h['sender']}: {h['message']}" for h in history)
        query = f"{history}\n{query}" if query else history
        result = process_inputs_with_model(
            model,
            processor,
            tokenizer,
            query if query else "Analyze the provided inputs",
            images=image_files,
            videos=video_files,
            pdfs=pdf_files
        )
        return result
    except Exception as e:
        print(f"An error occurred: {e}")