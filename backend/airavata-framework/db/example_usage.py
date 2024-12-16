from database import ShaktiDB
from PIL import Image
import io
import os
from datetime import datetime

def test_database_operations():
    # Initialize database
    db = ShaktiDB()
    
    # Test image storage
    test_image_path = "path/to/test/image.jpg"
    if os.path.exists(test_image_path):
        # Open and convert image to bytes
        with Image.open(test_image_path) as img:
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_bytes = img_byte_arr.getvalue()

        # Store image
        image_id = db.store_image(
            image_path=test_image_path,
            image_blob=img_bytes,
            metadata={
                "filename": "test_image.jpg",
                "timestamp": datetime.now().isoformat()
            }
        )
        print(f"Stored image with ID: {image_id}")
    
    print("Database operations test complete!")

if __name__ == "__main__":
    test_database_operations()