import os
import shutil
import random

def setup_dirs(base_dir):
    train_dir = os.path.join(base_dir, "train")
    val_dir = os.path.join(base_dir, "val")
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)
    return train_dir, val_dir

def copy_and_split(src_folder, dest_train, dest_val, prefix=""):
    print(f"Processing {src_folder}...")
    if not os.path.exists(src_folder):
        print(f"Skipping {src_folder} - not found.")
        return
        
    for class_name in os.listdir(src_folder):
        class_path = os.path.join(src_folder, class_name)
        if not os.path.isdir(class_path) or class_name.startswith("."):
            continue
            
        final_class_name = f"{prefix}{class_name}".replace(" ", "_")
        
        train_class_dir = os.path.join(dest_train, final_class_name)
        val_class_dir = os.path.join(dest_val, final_class_name)
        os.makedirs(train_class_dir, exist_ok=True)
        os.makedirs(val_class_dir, exist_ok=True)
        
        images = [f for f in os.listdir(class_path) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
        random.shuffle(images)
        
        split_idx = int(len(images) * 0.8) # 80% train, 20% val
        train_imgs = images[:split_idx]
        val_imgs = images[split_idx:]
        
        for img in train_imgs:
            shutil.copy(os.path.join(class_path, img), os.path.join(train_class_dir, img))
        for img in val_imgs:
            shutil.copy(os.path.join(class_path, img), os.path.join(val_class_dir, img))

def main():
    dest_dir = "final_dataset"
    train_dir, val_dir = setup_dirs(dest_dir)
    
    # 1. PlantVillage (80/20 split)
    pv_dir = "datasets/plantvillage"
    copy_and_split(pv_dir, train_dir, val_dir)
    
    # 2. PlantDoc (It already has train/test split)
    pd_train = "datasets/plantdoc/train"
    pd_test = "datasets/plantdoc/test"
    print(f"Processing PlantDoc...")
    if os.path.exists(pd_train):
        for c in os.listdir(pd_train):
            cpath = os.path.join(pd_train, c)
            if os.path.isdir(cpath) and not c.startswith("."):
                dpath = os.path.join(train_dir, c.replace(" ", "_"))
                os.makedirs(dpath, exist_ok=True)
                for img in os.listdir(cpath):
                    if img.lower().endswith((".png", ".jpg", ".jpeg")):
                        shutil.copy(os.path.join(cpath, img), os.path.join(dpath, img))
                        
    if os.path.exists(pd_test):
        for c in os.listdir(pd_test):
            cpath = os.path.join(pd_test, c)
            if os.path.isdir(cpath) and not c.startswith("."):
                dpath = os.path.join(val_dir, c.replace(" ", "_"))
                os.makedirs(dpath, exist_ok=True)
                for img in os.listdir(cpath):
                    if img.lower().endswith((".png", ".jpg", ".jpeg")):
                        shutil.copy(os.path.join(cpath, img), os.path.join(dpath, img))
                        
    # 3. Indian Crops (Rice) (80/20 split)
    rice_dir = "datasets/indian_crops/Rice Leaf Disease Images"
    copy_and_split(rice_dir, train_dir, val_dir, prefix="Rice___")
    
    print(f"\nData consolidation complete! The AI is ready to train on the '{dest_dir}' folder.")

if __name__ == "__main__":
    main()
