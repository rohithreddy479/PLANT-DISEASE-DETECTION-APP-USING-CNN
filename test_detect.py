# test_detect.py
import os
import numpy as np
from PIL import Image
import tensorflow as tf

# Paths
MODEL_PATH = r"C:\Users\avroh\Music\plant_disease_app\plant_disease_cnn.h5"
TRAIN_DIR = r"C:\Users\avroh\Music\plant_disease_app\plant_data\data_distribution_for_SVM\train"
TEST_IMAGE = r"C:\Users\avroh\Music\plant_disease_app\plant_data\data_distribution_for_SVM\test\0\example.jpg"  # pick any test image

# Load model
model = tf.keras.models.load_model(MODEL_PATH)

# Auto-generate class map
classes = sorted(os.listdir(TRAIN_DIR))
class_map = {i: name for i, name in enumerate(classes)}

# Load image
image = Image.open(TEST_IMAGE)
image = image.resize((128, 128))
image_array = np.array(image) / 255.0
image_array = np.expand_dims(image_array, 0)

# Predict
preds = model.predict(image_array)
disease_class = np.argmax(preds, axis=1)[0]
disease_name = class_map[disease_class]

print("Predicted class:", disease_name)
print("Confidence:", float(np.max(preds)))
