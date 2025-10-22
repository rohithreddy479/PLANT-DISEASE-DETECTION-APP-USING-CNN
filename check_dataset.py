import os

train_path = r"C:\Users\avroh\Music\plant_disease_app\plant_data\train"
test_path = r"C:\Users\avroh\Music\plant_disease_app\plant_data\test"

print("✅ Train folders found:", os.listdir(train_path)[:5])
print("✅ Test folders found:", os.listdir(test_path)[:5])

train_classes = len(os.listdir(train_path))
test_classes = len(os.listdir(test_path))

print(f"\nNumber of training classes: {train_classes}")
print(f"Number of testing classes: {test_classes}")
