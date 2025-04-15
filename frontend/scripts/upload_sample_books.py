import os
import subprocess
import re
import boto3
from botocore.client import Config
from dotenv import load_dotenv

# Load .env if needed
load_dotenv()

BOOKS_DIR = "../assets/books"
BOOK_FILES = ["a_tale_of_two_cities.epub", "metamorphosis.epub"]
BUCKET_NAME = "books"

def get_supabase_s3_details():
    result = subprocess.run(["supabase", "status"], capture_output=True, text=True, check=True)
    output = result.stdout

    def extract(label):
        match = re.search(fr"{label}:\s+(.*)", output)
        return match.group(1).strip() if match else None

    return {
        "endpoint": extract("S3 Storage URL"),
        "access_key": extract("S3 Access Key"),
        "secret_key": extract("S3 Secret Key"),
        "region": extract("S3 Region"),
    }

def upload_to_supabase_s3(s3, filename):
    path = os.path.join(BOOKS_DIR, filename)
    if not os.path.exists(path):
        print(f"❌ File not found: {path}")
        return

    print(f"📤 Uploading {filename}...")

    with open(path, "rb") as f:
        s3.upload_fileobj(f, BUCKET_NAME, filename)
        print(f"✅ Uploaded: {filename}")

if __name__ == "__main__":
    print("🔍 Extracting Supabase S3 details...")
    s3_config = get_supabase_s3_details()

    if not all(s3_config.values()):
        print("❌ Missing S3 config. Please ensure all values are available.")
        exit(1)

    print("✅ Config loaded. Connecting to local S3...\n")

    s3 = boto3.client(
        "s3",
        aws_access_key_id=s3_config["access_key"],
        aws_secret_access_key=s3_config["secret_key"],
        region_name=s3_config["region"],
        endpoint_url=s3_config["endpoint"],
        config=Config(signature_version="s3v4"),
    )

    for book in BOOK_FILES:
        try:
            upload_to_supabase_s3(s3, book)
        except Exception as e:
            print(f"❌ Error uploading {book}: {e}")
