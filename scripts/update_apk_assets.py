#!/usr/bin/env python3
import os
import shutil
import subprocess
import zipfile

KEYSTORE = "/root/debug.keystore"

def update_apk(source_apk, assets_dir, out_apk, copy_destinations=None):
    print(f"Updating {source_apk} with assets from {assets_dir}...")
    temp_dir = "/tmp/apk_work"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    unaligned_apk = os.path.join(temp_dir, "unaligned.apk")
    aligned_apk = os.path.join(temp_dir, "aligned.apk")

    with zipfile.ZipFile(source_apk, "r") as zin:
        with zipfile.ZipFile(unaligned_apk, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename.startswith("META-INF/"):
                    continue
                if item.filename.startswith("assets/www/"):
                    rel = os.path.relpath(item.filename, "assets/www")
                    src = os.path.join(assets_dir, rel)
                    if os.path.exists(src):
                        continue  # updated version will be written below
                data = zin.read(item.filename)
                zout.writestr(item, data)

            for root, dirs, files in os.walk(assets_dir):
                for f in sorted(files):
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, assets_dir)
                    arc_name = f"assets/www/{rel_p}"
                    zout.write(full_p, arc_name)

    # 4-byte zipalign
    subprocess.run(["zipalign", "-f", "-p", "4", unaligned_apk, aligned_apk], check=True)

    # apksigner sign
    subprocess.run([
        "apksigner", "sign",
        "--ks", KEYSTORE,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        "--out", out_apk,
        aligned_apk
    ], check=True)

    # verify signature
    res = subprocess.run(["apksigner", "verify", "--verbose", out_apk], capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"apksigner verification failed for {out_apk}: {res.stderr}")
    print(f"Signature verified for {out_apk}")

    if copy_destinations:
        for dst in copy_destinations:
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(out_apk, dst)
            print(f"Copied to {dst} ({os.path.getsize(dst)} bytes)")

def main():
    repo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # 1. Update Holo APK
    holo_src = os.path.join(repo_dir, "holo-app/bin/AgenticHolo-Android.apk")
    holo_assets = os.path.join(repo_dir, "holo-app/assets/www")
    holo_dests = [
        os.path.join(repo_dir, "downloads/AgenticHolo-Android.apk"),
        "/root/Downloads/AgenticHolo-Android.apk",
        "/root/AgenticHolo-Android.apk"
    ]
    update_apk(holo_src, holo_assets, holo_src, holo_dests)

    # 2. Update Essence APK
    essence_src = os.path.join(repo_dir, "android-app/bin/AgenticEssence-Android.apk")
    essence_assets = os.path.join(repo_dir, "android-app/assets/www")
    essence_dests = [
        os.path.join(repo_dir, "downloads/AgenticEssence-Android.apk"),
        os.path.join(repo_dir, "downloads/AngeticEssence-Android.apk"),
        "/root/Downloads/AgenticEssence-Android.apk",
        "/root/AgenticEssence-Android.apk"
    ]
    update_apk(essence_src, essence_assets, essence_src, essence_dests)
    print("All APKs successfully updated, aligned, signed, and distributed!")

if __name__ == "__main__":
    main()
