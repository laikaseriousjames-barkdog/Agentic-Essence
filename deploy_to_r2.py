#!/usr/bin/env python3
import os
import sys
import mimetypes
import urllib.request
import urllib.error
import json
import time

# Configuration loader (env vars or .cloudflare_credentials.json)
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cloudflare_credentials.json")
_creds = {}
if os.path.exists(CONFIG_FILE):
    try:
        with open(CONFIG_FILE, "r") as f:
            _creds = json.load(f)
    except Exception:
        pass

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", _creds.get("account_id", ""))
API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", _creds.get("api_token", ""))
BUCKET_NAME = os.environ.get("CLOUDFLARE_R2_BUCKET", _creds.get("bucket", "agentic"))
BASE_URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/r2/buckets/{BUCKET_NAME}/objects"

MIME_MAP = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".apk": "application/vnd.android.package-archive",
    ".exe": "application/x-msdownload",
    ".zip": "application/zip",
}

def get_content_type(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    return MIME_MAP.get(ext, "application/octet-stream")

def upload_file(local_path, remote_key):
    content_type = get_content_type(local_path)
    size = os.path.getsize(local_path)
    url = f"{BASE_URL}/{remote_key}"
    
    print(f"Uploading {local_path} -> {remote_key} ({size:,} bytes, {content_type})...")
    
    with open(local_path, "rb") as f:
        data = f.read()
        
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": content_type,
        },
        method="PUT"
    )
    
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                if resp_data.get("success"):
                    print(f"  [OK] {remote_key} uploaded successfully.")
                    return True
                else:
                    print(f"  [FAIL] {remote_key}: {resp_data.get('errors')}")
                    return False
        except Exception as e:
            print(f"  [RETRY {attempt}/{max_retries}] Error uploading {remote_key}: {e}")
            time.sleep(2 * attempt)
            
    print(f"  [FAILED] Could not upload {remote_key} after {max_retries} attempts.")
    return False

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    website_dir = os.path.join(root_dir, "website")
    downloads_dir = os.path.join(root_dir, "downloads")
    
    uploads = []
    
    # 1. Website files
    for root, dirs, files in os.walk(website_dir):
        # Skip symlinks like downloads -> ../downloads
        for file in files:
            full_path = os.path.join(root, file)
            if os.path.islink(full_path):
                continue
            rel_path = os.path.relpath(full_path, website_dir)
            uploads.append((full_path, rel_path))
            
    # 2. Downloads directory
    for root, dirs, files in os.walk(downloads_dir):
        for file in files:
            full_path = os.path.join(root, file)
            if os.path.islink(full_path):
                continue
            rel_path = os.path.join("downloads", os.path.relpath(full_path, downloads_dir))
            uploads.append((full_path, rel_path))
            
            # Root APK convenience copies
            if file.endswith(".apk"):
                uploads.append((full_path, file))

    print(f"Total files to upload: {len(uploads)}")
    
    success_count = 0
    fail_count = 0
    
    for local_path, remote_key in uploads:
        if upload_file(local_path, remote_key):
            success_count += 1
        else:
            fail_count += 1
            
    print("\n" + "=" * 50)
    print(f"Upload Summary: {success_count} succeeded, {fail_count} failed.")
    print("=" * 50)
    
    if fail_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
