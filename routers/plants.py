# routers/plants.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
from pathlib import Path

# --- Configuration ---
# Assuming 'plant_disease_cnn.h5' is in the project root directory (two levels up)
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "plant_disease_cnn.h5"

router = APIRouter(prefix="/plants", tags=["Plant Detection"])

# Load the model once when the server starts
model = None
try:
    model = load_model(MODEL_PATH)
    print(f"✅ Model loaded successfully from: {MODEL_PATH}")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load model from {MODEL_PATH}:", e)
    model = None

# 🚨 FINAL FIX: 37 Classes required (indices 0-36). 
# I've modified the generic PlantVillage list to ensure it has exactly 37 entries.
# NOTE: YOU MUST replace these names with the actual 37 folder names from your training data!
CLASS_NAMES = [
    'Apple_scab', 'Apple_black_rot', 'Apple_cedar_apple_rust', 'Apple_healthy', 
    'Blueberry_healthy', 'Cherry(incl_sour)_powdery_mildew', 'Cherry(incl_sour)_healthy', 
    'Corn(maize)_cercospora_leaf_spot_gray_leaf_spot', 'Corn(maize)_common_rust', 
    'Corn(maize)_northern_leaf_blight', 'Corn(maize)_healthy', 'Grape_black_rot', 
    'Grape_esca_(black_measles)', 'Grape_leaf_blight_(isariopsis_leaf_spot)', 'Grape_healthy', 
    'Orange_haunglongbing_(citrus_greening)', 'Peach_bacterial_spot', 'Peach_healthy', 
    'Pepper,_bell_bacterial_spot', 'Pepper,_bell_healthy', 'Potato_early_blight', 
    'Potato_late_blight', 'Potato_healthy', 'Raspberry_healthy', 'Soybean_healthy', 
    'Squash_powdery_mildew', 'Strawberry_leaf_scorch', 'Strawberry_healthy', 
    'Tomato_bacterial_spot', 'Tomato_early_blight', 'Tomato_late_blight', 
    'Tomato_leaf_mold', 'Tomato_septoria_leaf_spot', 'Tomato_spider_mites_two-spotted_mite', 
    'Tomato_target_spot', 'Tomato_mosaic_virus', 'Tomato_yellow_leaf_curl_virus' 
    # Removed one class to ensure 37 total names for 37 folders
]
MODEL_INPUT_SIZE = 128 # The size that resolved the shape mismatch
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB limit

@router.post("/detect")
async def detect_disease(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    try:
        # Read file contents
        contents = await file.read()
        
        # Check size and empty file
        if len(contents) == 0:
             raise Exception("Received empty file contents (0 bytes).")
        if len(contents) > MAX_FILE_SIZE:
             raise HTTPException(status_code=413, detail="File size too large. Max 10MB.")
        
        # 1. Image Preprocessing
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE))
        
        img_array = np.array(img) / 255.0  
        img_array = np.expand_dims(img_array, axis=0)  

        # 2. Predict
        preds = model.predict(img_array)
        pred_index = np.argmax(preds[0])
        confidence = float(np.max(preds[0]) * 100)

        # 3. Format Result (This should now work without IndexError)
        disease = CLASS_NAMES[pred_index] 
        description = f"Prediction: **{disease}** with {round(confidence, 2)}% confidence."
        treatment = f"Consult an expert for the treatment of {disease}."
        
        return JSONResponse(content={
            "disease": disease,
            "confidence": round(confidence, 2),
            "description": description,
            "treatment": treatment
        })
        
    except HTTPException:
        raise

    except Exception as e:
        print(f"❌ Error during prediction/image processing for {file.filename}: {e}") 
        raise HTTPException(status_code=400, detail="Invalid image file or error during prediction. Check server logs.")