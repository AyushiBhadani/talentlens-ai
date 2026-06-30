from PIL import Image
import os

def crop_black_borders(image_path, output_path):
    img = Image.open(image_path)
    # Convert to RGB if not already
    img = img.convert("RGB")
    
    # Get bounding box of non-black pixels
    # getbbox might fail if the background is slightly noisy.
    # Let's do a manual scan to be safe.
    width, height = img.size
    pixels = img.load()
    
    top = 0
    bottom = height - 1
    
    # Find top
    for y in range(height):
        is_black = True
        for x in range(width):
            if sum(pixels[x, y]) > 10: # threshold
                is_black = False
                break
        if not is_black:
            top = y
            break
            
    # Find bottom
    for y in range(height - 1, -1, -1):
        is_black = True
        for x in range(width):
            if sum(pixels[x, y]) > 10:
                is_black = False
                break
        if not is_black:
            bottom = y
            break
            
    # Crop the image (left, top, right, bottom)
    cropped = img.crop((0, top, width, bottom + 1))
    cropped.save(output_path)
    print(f"Cropped {image_path} -> {output_path} (Size: {cropped.size})")

# Image paths
artifacts_dir = r"C:\Users\Vishn\.gemini\antigravity\brain\bd7d8fc5-8849-4828-a030-0369f533a183"
slide1_path = os.path.join(artifacts_dir, "media__1782540198034.png")
slide2_path = os.path.join(artifacts_dir, "media__1782542282257.png")

crop_black_borders(slide1_path, r"d:\data ana ai hackathon\bg_slide1.png")
crop_black_borders(slide2_path, r"d:\data ana ai hackathon\bg_slide2.png")
