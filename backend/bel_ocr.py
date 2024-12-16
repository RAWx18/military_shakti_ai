from paddleocr import PaddleOCR

# Initialize the PaddleOCR model
ocr = PaddleOCR(
    use_angle_cls=True,  # Enables the direction classifier
    lang='en',           # Language model (English is 'en')
    det_model_dir='/home/raw/Desktop/Coding/udit_new_military_int_icc/chakravyuha_ocr/en_PP-OCRv3_det_infer',  # Detection model
    cls_model_dir='/home/raw/Desktop/Coding/udit_new_military_int_icc/chakravyuha_ocr/ch_ppocr_mobile_v2.0_cls_infer',  # Classification model
    rec_model_dir='/home/raw/Desktop/Coding/udit_new_military_int_icc/chakravyuha_ocr/en_PP-OCRv3_rec_infer'   # Recognition model
)

# Input image path
image_path = 'home/raw/Downloads/ronit.pdf'

# Perform OCR on the image
results = ocr.ocr(image_path, cls=True)

# Print the extracted text and bounding boxes
for line in results[0]:
    print(f"{line[1][0]}")
