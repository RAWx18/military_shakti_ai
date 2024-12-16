from paddleocr import PaddleOCR
import pdf2image
import os
import sys


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from config_model import BASE_DIR


def ocr_pdf(pdf_path, output_dir='ocr_results'):
    """
    Perform OCR on a PDF file and extract text from each page
    
    Args:
    pdf_path (str): Path to the PDF file
    output_dir (str): Directory to save extracted text and results
    
    Returns:
    dict: A dictionary with page numbers as keys and extracted text as values
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Initialize PaddleOCR
    ocr = PaddleOCR(
        use_angle_cls=True,  # Enables the direction classifier
        lang='en',  # Language model (English)
        det_model_dir=os.path.join(BASE_DIR, '/chakravyuha_ocr/en_PP-OCRv3_det_infer'),  # Detection model
        cls_model_dir=os.path.join(BASE_DIR,'/chakravyuha_ocr/ch_ppocr_mobile_v2.0_cls_infer'),  # Classification model
        rec_model_dir=os.path.join(BASE_DIR,'/chakravyuha_ocr/en_PP-OCRv3_rec_infer' ) # Recognition model
    )
    
    # Convert PDF to images
    try:
        images = pdf2image.convert_from_path(pdf_path)
    except Exception as e:
        print(f"Error converting PDF to images: {e}")
        return {}
    
    # Dictionary to store OCR results
    ocr_results = {}
    
    # Process each page
    for page_num, image in enumerate(images, 1):
        # Save the page image temporarily
        temp_image_path = os.path.join(output_dir, f'page_{page_num}.jpg')
        image.save(temp_image_path)
        
        # Perform OCR on the page
        try:
            results = ocr.ocr(temp_image_path, cls=True)
            
            # Extract text from the OCR results
            page_text = []
            for line in results[0]:
                page_text.append(line[1][0])
            
            # Store page text
            ocr_results[page_num] = '\n'.join(page_text)
            
            # Optional: Save text to a file
            with open(os.path.join(output_dir, f'page_{page_num}_text.txt'), 'w') as f:
                f.write('\n'.join(page_text))
            
        except Exception as e:
            print(f"Error processing page {page_num}: {e}")
        
        # Optional: Remove temporary image
        os.remove(temp_image_path)
    
    return ocr_results

def main():
    # PDF file path
    pdf_path = r'C:\Users\udit2\Downloads\1.pdf'
    
    # Perform OCR
    results = ocr_pdf(pdf_path)
    
    # Print results
    for page, text in results.items():
        print(f"\nPage {page} Text:")
        print(text)
        print("-" * 50)

if __name__ == "__main__":
    main()