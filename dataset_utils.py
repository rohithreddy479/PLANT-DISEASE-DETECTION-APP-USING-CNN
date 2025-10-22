# dataset_utils.py
import os

DATA_PATH = r"C:\Users\avroh\Music\New folder\data"

def inspect_dataset():
    print("Root folders:", os.listdir(DATA_PATH))
    train_path = os.path.join(DATA_PATH, "train")
    print("Train classes:", os.listdir(train_path))
    return DATA_PATH
