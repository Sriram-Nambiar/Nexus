#!/usr/bin/env python3
"""
NEXUS AI - Course Video Synchronizer
Ensures that every course in the database has a video resource pointing to
'Week 1 Lecture 2 - Supervised Learning.mp4' with HTTP 206 Range capability.
"""

import os
import shutil
import sqlite3

def sync_videos():
    source_video = r"C:\Users\Swathi\Desktop\Nexus'\Week 1 Lecture 2 - Supervised Learning.mp4"
    if not os.path.exists(source_video):
        source_video = "Week 1 Lecture 2 - Supervised Learning.mp4"

    if not os.path.exists(source_video):
        raise FileNotFoundError(f"Source video not found: {source_video}")

    file_size = os.path.getsize(source_video)
    print(f"[*] Found source video: {source_video} ({file_size / (1024*1024):.2f} MB)")

    # 1. Target upload folders
    upload_dirs = ["backend/data/uploads", "data/uploads"]
    for udir in upload_dirs:
        os.makedirs(udir, exist_ok=True)
        # Main standardized storage filename
        main_dest = os.path.join(udir, "supervised_learning_lecture.mp4")
        shutil.copy2(source_video, main_dest)
        print(f"[+] Synced main video to {main_dest}")

        # Also overwrite previous demo video names so any existing link instantly streams this video
        fallback_names = [
            "demo_ml_lecture.mp4",
            "demo_os_deadlocks.mp4",
            "res_85f6f95e-929d-4aa5-9bea-6630126340f9.mp4",
            "res_b4ce4fe1-91ce-4bd8-a5bd-a3d42a8900f7.mp4",
            "res_c05d3d8f-7497-4897-b442-becf36cb8131.mp4",
            "res_e763fed4-2dcf-451a-ae4c-be0c07d8fbad.mp4"
        ]
        for name in fallback_names:
            dst = os.path.join(udir, name)
            shutil.copy2(source_video, dst)

    # 2. Sync ZIM archive if generated
    zim_path = "Week_1_Lecture_2_Supervised_Learning.zim"
    zim_size = os.path.getsize(zim_path) if os.path.exists(zim_path) else 51520941
    if os.path.exists(zim_path):
        for udir in upload_dirs:
            shutil.copy2(zim_path, os.path.join(udir, "Week_1_Lecture_2_Supervised_Learning.zim"))
        print(f"[+] Synced ZIM archive ({zim_size / (1024*1024):.2f} MB) to upload folders")

    # 3. Update SQLite Databases
    db_paths = ["backend/data/nexus.sqlite", "data/nexus.sqlite"]
    for db_path in db_paths:
        if not os.path.exists(db_path):
            continue

        con = sqlite3.connect(db_path)
        cur = con.cursor()

        # Update all existing video resources to point to supervised_learning_lecture.mp4
        cur.execute("""
            UPDATE resources
            SET storage_path = 'supervised_learning_lecture.mp4',
                mime_type = 'video/mp4',
                file_size = ?,
                title = 'Week 1 Lecture 2 - Supervised Learning | Machine Learning'
            WHERE resource_type = 'video'
        """, (file_size,))
        updated = cur.rowcount
        print(f"[+] {db_path}: Updated {updated} video resources to point to Supervised Learning video")

        # Make sure EVERY course in courses has at least one video resource
        courses = cur.execute("SELECT id, title FROM courses").fetchall()
        for cid, ctitle in courses:
            existing = cur.execute(
                "SELECT id FROM resources WHERE course_id = ? AND resource_type = 'video'",
                (cid,)
            ).fetchone()

            if not existing:
                vid_id = f"res_vid_{cid}"
                cur.execute("""
                    INSERT INTO resources (
                        id, course_id, title, description, resource_type,
                        storage_path, mime_type, file_size, created_at
                    ) VALUES (?, ?, ?, ?, 'video', 'supervised_learning_lecture.mp4', 'video/mp4', ?, datetime('now'))
                """, (
                    vid_id,
                    cid,
                    f"{ctitle} - Video Lecture: Supervised Learning",
                    "NPTEL Lecture 2 - Supervised Learning by Prof. Balaraman Ravindran (IIT Madras)",
                    file_size
                ))
                print(f"[+] {db_path}: Linked Supervised Learning video to course '{ctitle}' ({cid})")

        # Add Kiwix ZIM package as a downloadable resource for NPTEL Machine Learning course
        cur.execute("""
            INSERT OR REPLACE INTO resources (
                id, course_id, title, description, resource_type,
                storage_path, mime_type, file_size, created_at
            ) VALUES (
                'res_zim_ml_nptel',
                'crs_ml_nptel',
                'Kiwix ZIM Package: Week 1 Lecture 2 Supervised Learning',
                'OpenZIM archive containing the offline video lecture and interactive player for Kiwix hotspots.',
                'other',
                'Week_1_Lecture_2_Supervised_Learning.zim',
                'application/x-zim',
                ?,
                datetime('now')
            )
        """, (zim_size,))

        con.commit()
        con.close()
        print(f"[OK] Database {db_path} committed successfully!")

if __name__ == "__main__":
    sync_videos()
