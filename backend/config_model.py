import os
from pathlib import Path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Project root folder
DATA_PATH = os.path.join(BASE_DIR, 'data')  # Example data folder
MODEL_PATH = os.path.join(BASE_DIR, 'shakti-2B-041224')  # Example models folder
COMPUTE_TYPE = "gpu" # "gpu" or "cpu"
MODE="model"  # "model" or "notmodel"