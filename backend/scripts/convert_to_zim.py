#!/usr/bin/env python3
"""
NEXUS AI - Offline ZIM Converter for Course Videos
Converts MP4 video lectures into OpenZIM (.zim) format for Kiwix offline readers and hotspots.
"""

import sys
import os
import pathlib
import datetime
import libzim.writer as w
import libzim

class ZIMItem(w.Item):
    def __init__(self, path: str, title: str, mimetype: str, provider: w.ContentProvider, hints=None):
        super().__init__()
        self._path = path
        self._title = title
        self._mimetype = mimetype
        self._provider = provider
        self._hints = hints or {}

    def get_path(self) -> str:
        return self._path

    def get_title(self) -> str:
        return self._title

    def get_mimetype(self) -> str:
        return self._mimetype

    def get_contentprovider(self) -> w.ContentProvider:
        return self._provider

    def get_hints(self):
        return self._hints


def create_player_html(title: str, video_filename: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — NEXUS AI / Kiwix</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background-color: #171e19;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 24px 16px;
      display: flex;
      justify-content: center;
    }}
    .container {{
      max-width: 900px;
      width: 100%;
      background: #ffffff;
      border: 3px solid #000000;
      border-radius: 16px;
      box-shadow: 10px 10px 0px #000000;
      overflow: hidden;
    }}
    .header {{
      background-color: #ffe17c;
      border-bottom: 3px solid #000000;
      padding: 20px 24px;
    }}
    .badge {{
      display: inline-block;
      background: #000000;
      color: #ffe17c;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 8px;
    }}
    h1 {{
      font-size: 24px;
      font-weight: 900;
      line-height: 1.2;
      color: #000000;
      margin-bottom: 6px;
    }}
    .meta {{
      font-size: 13px;
      font-weight: 600;
      color: #333333;
    }}
    .video-wrapper {{
      background: #000000;
      border-bottom: 3px solid #000000;
      position: relative;
      width: 100%;
    }}
    video {{
      width: 100%;
      max-height: 520px;
      display: block;
      background: #000000;
    }}
    .content {{
      padding: 24px;
      background: #ffffff;
    }}
    .section-title {{
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      border-left: 5px solid #ffe17c;
      padding-left: 10px;
    }}
    p {{
      font-size: 14px;
      line-height: 1.6;
      color: #222222;
      margin-bottom: 16px;
    }}
    .pill-grid {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }}
    .pill {{
      background: #b7c6c2;
      color: #000000;
      border: 2px solid #000000;
      box-shadow: 2px 2px 0px #000000;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
    }}
    .footer {{
      background: #f4f4f5;
      border-top: 2px solid #000000;
      padding: 14px 24px;
      font-size: 11px;
      font-weight: 700;
      color: #555555;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">NPTEL IIT Madras • Offline Kiwix Edition</div>
      <h1>{title}</h1>
      <div class="meta">Instructor: Prof. Balaraman Ravindran • Machine Learning Curriculum</div>
    </div>

    <div class="video-wrapper">
      <video controls playsinline preload="metadata">
        <source src="{video_filename}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>

    <div class="content">
      <div class="section-title">Lecture Overview</div>
      <p>
        In this lecture, Prof. Balaraman Ravindran covers the foundational concepts of Supervised Learning,
        including empirical risk minimization, feature space mappings, regression vs classification tasks,
        and loss function formulations. Packaged for 100% offline distribution across campus intranets and Kiwix hotspots.
      </p>

      <div class="section-title">Core Topics Covered</div>
      <p>
        • Concept learning and target function approximation<br>
        • Labeled training data pairs (X, y) and generalization bounds<br>
        • Hypothesis spaces, inductive bias, and Occam's razor<br>
        • Evaluation metrics: Mean Squared Error (MSE) and 0/1 Loss
      </p>

      <div class="pill-grid">
        <span class="pill">#SupervisedLearning</span>
        <span class="pill">#MachineLearning</span>
        <span class="pill">#NPTEL</span>
        <span class="pill">#IITMadras</span>
        <span class="pill">#KiwixOffline</span>
        <span class="pill">#NEXUS</span>
      </div>
    </div>

    <div class="footer">
      <span>NEXUS AI Intranet Education OS</span>
      <span>Format: OpenZIM Archive</span>
    </div>
  </div>
</body>
</html>
"""


def convert_mp4_to_zim(input_mp4_path: str, output_zim_path: str):
    input_path = pathlib.Path(input_mp4_path).resolve()
    if not input_path.exists():
        raise FileNotFoundError(f"Input MP4 file not found: {input_path}")

    output_path = pathlib.Path(output_zim_path).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists():
        output_path.unlink()

    file_size_mb = input_path.stat().st_size / (1024 * 1024)
    print(f"[*] Input Video: {input_path}")
    print(f"[*] File Size: {file_size_mb:.2f} MB")
    print(f"[*] Target ZIM Archive: {output_path}")

    title = "Week 1 Lecture 2 - Supervised Learning | Machine Learning"
    video_zim_name = "video.mp4"

    # Initialize Creator
    creator = w.Creator(output_path)
    # Don't index large binary video files with text searcher
    creator.config_indexing(False, "eng")

    # Start writing
    with creator:
        creator.set_mainpath("index.html")
        creator.add_metadata("Title", title)
        creator.add_metadata("Creator", "Prof. Balaraman Ravindran (NPTEL / IIT Madras)")
        creator.add_metadata("Publisher", "NEXUS AI Campus Offline Node")
        creator.add_metadata("Date", datetime.date.today().isoformat())
        creator.add_metadata("Description", "NPTEL Machine Learning Course - Week 1 Lecture 2: Supervised Learning video lecture packaged for offline Kiwix playback.")
        creator.add_metadata("Language", "eng")
        creator.add_metadata("Tags", "nptel;machine-learning;supervised-learning;iit-madras;video;nexus")

        # 1. Add index.html player page
        player_html = create_player_html(title, video_zim_name)
        creator.add_item(
            ZIMItem(
                path="index.html",
                title=title,
                mimetype="text/html; charset=utf-8",
                provider=w.StringProvider(player_html)
            )
        )
        print("    [+] Added index.html player interface")

        # 2. Add the MP4 video using FileProvider
        video_provider = w.FileProvider(str(input_path))
        creator.add_item(
            ZIMItem(
                path=video_zim_name,
                title="Supervised Learning Lecture Video",
                mimetype="video/mp4",
                provider=video_provider
            )
        )
        print(f"    [+] Added {video_zim_name} ({file_size_mb:.2f} MB)")

    print(f"[OK] ZIM creation completed: {output_path}")
    print(f"[OK] Final ZIM size: {output_path.stat().st_size / (1024 * 1024):.2f} MB")

    # Verify with libzim.Archive
    archive = libzim.Archive(str(output_path))
    print(f"[OK] ZIM Verification:")
    print(f"    - Main Entry: {archive.main_entry.path}")
    print(f"    - Entry Count: {archive.entry_count}")
    print(f"    - Valid ZIM Archive: Ready for Kiwix deployment!")
    return str(output_path)


if __name__ == "__main__":
    default_input = r"C:\Users\Swathi\Desktop\Nexus'\Week 1 Lecture 2 - Supervised Learning.mp4"
    default_output = r"C:\Users\Swathi\Desktop\Nexus'\Week_1_Lecture_2_Supervised_Learning.zim"

    input_file = sys.argv[1] if len(sys.argv) > 1 else default_input
    output_file = sys.argv[2] if len(sys.argv) > 2 else default_output

    convert_mp4_to_zim(input_file, output_file)
