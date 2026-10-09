#!/usr/bin/env python3
"""
NEXUS AI — Offspot Image Recipe Builder
========================================
Builds the YAML recipe file required by `image-creator` to produce a bootable
Kiwix Hotspot Raspberry Pi OS image with NEXUS AI and educational ZIM archives pre-loaded.

Usage:
    pip install offspot-config
    python offspot/build_recipe.py [output_recipe.yaml]

References:
    - https://github.com/offspot/offspot-config
    - https://github.com/offspot/image-creator
    - https://github.com/offspot/overview
"""

import os
import sys
from pathlib import Path

try:
    from offspot_config.builder import ConfigBuilder
    from offspot_config.inputs.base import BaseConfig
except ImportError:
    print("[ERROR] 'offspot-config' is required. Install it with: pip install offspot-config")
    print("Writing reference YAML recipe directly without library...")
    ConfigBuilder = None


DEFAULT_OUTPUT = "nexus_offspot_recipe.yaml"
OUTPUT_FILE = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUTPUT

# Offspot Base Image metadata (Raspberry Pi OS Lite 64-bit arm64)
BASE_VERSION = "1.2.1"
BASE_ROOTFS_SIZE = 2663383040

SSID = os.getenv("OFFSPOT_SSID", "NEXUS-Campus-WiFi")
PASSPHRASE = os.getenv("OFFSPOT_PASSPHRASE", "")  # Empty = Open network
DOMAIN = os.getenv("OFFSPOT_DOMAIN", "nexus")
TLD = "hotspot"


def build_recipe():
    print(f"[*] Building Offspot recipe for NEXUS AI...")
    print(f"    - SSID: {SSID}")
    print(f"    - Domain: {DOMAIN}.{TLD}")
    print(f"    - Output: {OUTPUT_FILE}")

    if ConfigBuilder:
        builder = ConfigBuilder(
            base=BaseConfig(
                source=BASE_VERSION,
                rootfs_size=BASE_ROOTFS_SIZE,
            ),
            name="NEXUS AI Campus Knowledge Hub",
            domain=DOMAIN,
            welcome_domain=f"goto.{DOMAIN}",
            tld=TLD,
            ssid=SSID,
            passphrase=PASSPHRASE,
            timezone="UTC",
            environ={
                "ADMIN_USERNAME": "admin",
                "ADMIN_PASSWORD": "nexus-offline-admin",
            },
            write_config=True,
        )

        # Add Offspot services
        builder.add_dashboard(allow_zim_downloads=True)
        builder.add_captive_portal()
        builder.add_reverseproxy()

        # Write output
        Path(OUTPUT_FILE).write_text(builder.dump_yaml(), encoding="utf-8")
        print(f"[OK] Successfully generated Offspot recipe using ConfigBuilder at {OUTPUT_FILE}")
    else:
        # Generate standalone YAML format matching offspot/image-creator specification
        recipe_yaml = f"""# NEXUS AI Kiwix Hotspot Image Creator Recipe
base:
  source: "{BASE_VERSION}"
  root_size: {BASE_ROOTFS_SIZE}

output:
  size: "auto"

offspot:
  timezone: "UTC"
  hostname: "{DOMAIN}"
  ethernet:
    type: "dhcp"
  ap:
    domain: "{DOMAIN}"
    welcome: "goto.{DOMAIN}"
    tld: "{TLD}"
    ssid: "{SSID}"
    passphrase: "{PASSPHRASE}"
    as-gateway: false

  containers:
    name: "offspot"
    services:
      nexus-app:
        image: "nexus-ai:offspot"
        ports:
          - "5000:5000"
        environment:
          - NODE_ENV=production
          - PORT=5000
          - HOST=0.0.0.0
          - ENABLE_LAN_ACCESS=true
          - BASE_URL=http://{DOMAIN}.{TLD}
          - OFFSPOT_INTEGRATION=true
        volumes:
          - "/data/nexus:/app/data"
          - "/data/content/zims:/data/zims:ro"

files:
  - to: "/data/nexus/uploads/supervised_learning_lecture.mp4"
    url: "" # Imported from local media during image creation
"""
        Path(OUTPUT_FILE).write_text(recipe_yaml, encoding="utf-8")
        print(f"[OK] Generated standard Offspot recipe at {OUTPUT_FILE}")


if __name__ == "__main__":
    build_recipe()
