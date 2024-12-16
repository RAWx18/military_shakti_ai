import sys
import importlib.util
from transformers import AutoTokenizer
import torch
import os

# Add the project's top-level directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from config_model import BASE_DIR
from cpu_config import COMPUTE_TYPE

# Set the device based on configuration
DEVICE = torch.device("cuda" if (COMPUTE_TYPE == "gpu" and torch.cuda.is_available()) else "cpu")

print(f"Using device: {DEVICE}")
if COMPUTE_TYPE == "gpu":
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA version: {torch.version.cuda}")

# Function to load the model and tokenizer
def load_model(model_dir):
    sys.path.append(model_dir)
    
    # Load configuration and model modules dynamically
    config_module_path = f"{model_dir}/configuration_shakti.py"
    model_module_path = f"{model_dir}/modeling_shakti.py"

    # Load dynamically the configuration module
    spec_config = importlib.util.spec_from_file_location("shaktiConfig", config_module_path)
    config_module = importlib.util.module_from_spec(spec_config)
    sys.modules["shaktiConfig"] = config_module
    spec_config.loader.exec_module(config_module)

    # Load dynamically the model module
    spec_model = importlib.util.spec_from_file_location("shaktiModel", model_module_path)
    model_module = importlib.util.module_from_spec(spec_model)
    sys.modules["shaktiModel"] = model_module
    spec_model.loader.exec_module(model_module)

    from shaktiConfig import shaktiConfig
    from shaktiModel import shaktiModel

    # Load the model and tokenizer
    config = shaktiConfig.from_pretrained(model_dir)
    model = shaktiModel.from_pretrained(
        model_dir, 
        config=config, 
        attn_implementation='sdpa', 
        torch_dtype=torch.half if DEVICE.type == "cuda" else torch.float
    )
    model.eval().to(DEVICE)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    processor = model.init_processor(tokenizer)

    return model, tokenizer, processor

# Load the model at the beginning
model_dir = os.path.join(BASE_DIR, "shakti-2B-041224")
model, tokenizer, processor = load_model(model_dir)

print("Model and tokenizer loaded successfully.")