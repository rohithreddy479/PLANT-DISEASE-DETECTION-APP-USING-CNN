import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam

# === Path setup ===
base_dir = r"C:\Users\avroh\Music\plant_disease_app\plant_data\data_distribution_for_SVM"
train_dir = os.path.join(base_dir, "train")
test_dir = os.path.join(base_dir, "test")

print("🔍 Checking dataset paths...")
print("Train path:", train_dir)
print("Test path:", test_dir)
print("Train exists:", os.path.exists(train_dir))
print("Test exists:", os.path.exists(test_dir))

# === Parameters ===
img_size = (128, 128)
batch_size = 32
epochs = 5

# === Data generators ===
print("📦 Loading training data...")
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=30,
    zoom_range=0.2,
    horizontal_flip=True,
)

test_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_gen = train_datagen.flow_from_directory(
    train_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical'
)

test_gen = test_datagen.flow_from_directory(
    test_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical'
)

print("✅ Data loaded. Starting model training...")
# === Model definition ===
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(img_size[0], img_size[1], 3)),
    MaxPooling2D((2,2)),
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D((2,2)),
    Conv2D(128, (3,3), activation='relu'),
    MaxPooling2D((2,2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(train_gen.num_classes, activation='softmax')  # output layer for number of classes
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# === Train the model ===
history = model.fit(
    train_gen,
    validation_data=test_gen,
    epochs=epochs,
    verbose=1  # <-- ensures logs appear in terminal
)

# === Save the trained model ===
model.save("plant_disease_cnn.h5")
print("✅ Model training completed and saved as plant_disease_cnn.h5")
