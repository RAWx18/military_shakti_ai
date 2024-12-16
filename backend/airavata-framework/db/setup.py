import subprocess
import sys

def install_requirements():
    requirements = [
        "sqlalchemy",
        "psycopg2-binary",  # For PostgreSQL support
        "scikit-learn",     # For TF-IDF vectorization
        "numpy",
        "torch",
        "python-dotenv"     # For environment variables
    ]
    
    for package in requirements:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

if __name__ == "__main__":
    install_requirements()