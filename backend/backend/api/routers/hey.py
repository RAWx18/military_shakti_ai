import sys
import os

# Add the project's top-level directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from config_model import BASE_DIR


path = os.path.join(BASE_DIR, "backend/images", "png")
print(path)