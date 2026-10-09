# NEXUS AI — Kiwix Offspot Hotspot Deployment Guide

This document describes how to deploy and operate **NEXUS AI** on an offline Wi-Fi network powered by the official [Kiwix Offspot](https://github.com/offspot) platform, or test it on a local laptop serving multiple student devices over Wi-Fi.

---

## 1. Architectural Architecture & Responsibilities

The system divides responsibilities between the **Offspot host operating system** and the **containerized NEXUS application**:

```
+--------------------------------------------------------------------------+
| Offspot Host (Raspberry Pi OS Lite 64-bit / Bookworm)                    |
|                                                                          |
|  - hostapd:   Manages 802.11 Wi-Fi Access Point (SSID, WPA2/Open)        |
|  - dnsmasq:   Provides local DHCP (10.0.0.x) and DNS (*.hotspot)        |
|  - iptables:  Firewall routing & captive portal redirection              |
|  - /data:     Dedicated ext4 partition auto-expanded on first boot      |
+--------------------------------------------------------------------------+
                                     |
               Docker Compose Container Orchestration
                                     |
    +--------------------------------+--------------------------------+
    |                                                                 |
    v                                                                 v
+-------------------------------+             +-------------------------------+
| NEXUS AI Web App (Port 5000)  |             | Kiwix Serve (Port 8080)       |
|                               |             |                               |
| - Express & TypeScript        |             | - Serves OpenZIM (.zim)       |
| - Embedded Single-Page App    |             | - Wikipedia, NPTEL ZIM archive|
| - SQLite Course Metadata      |             | - Offline reader download     |
| - HTTP 206 Range MP4 Video    |             +-------------------------------+
| - AI Assistant & Study Plans  |
+-------------------------------+
    |
    v (Persistent Storage)
/data/nexus -> SQLite database + uploads directory
```

---

## 2. Two Operating Modes

### Mode A: Laptop Development & Quick Demo
Run NEXUS directly on a laptop (Windows, macOS, or Linux) connected to a local Wi-Fi router or Windows Mobile Hotspot.

1. **Start the Backend**:
   Ensure `ENABLE_LAN_ACCESS=true` in `backend/.env` (binds to `0.0.0.0:5000`).
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Verify LAN IP**:
   Run `ipconfig` (Windows) or `ip a` (Linux/macOS) to identify your local Wi-Fi IP address (e.g. `192.168.137.238`).

3. **Connect Student Devices**:
   * Connect 3 or more student computers/phones to the same Wi-Fi network or mobile hotspot.
   * Open a web browser on each student device and navigate to:
     ```
     http://<LAPTOP_IP>:5000
     ```
     *(e.g., `http://192.168.137.238:5000`)*
   * Students can independently browse courses, open video lectures, and scrub through timestamps without downloading the entire video.

---

### Mode B: Offspot Raspberry Pi Hardware Deployment

Deploy NEXUS as an autonomous, self-contained educational hub on Raspberry Pi hardware (Raspberry Pi 3B+, 4B, 400, 5).

#### Hardware Requirements
* **Raspberry Pi**: 64-bit arm64 model with at least 1 GB RAM (Raspberry Pi 4 or 5 recommended).
* **Storage**: MicroSD Card (Class 10 / A2 rated, 32 GB or larger) or USB 3.0 SSD.
* **Power Supply**: Official 5V 3A (Pi 4) or 5V 5A (Pi 5) power adapter.

#### Partition Layout
Offspot base images use a three-partition layout:
1. `/boot/firmware` (`FAT32`): Firmware and `offspot.yaml` runtime configuration.
2. `/` (`ext4`): Root system partition containing host packages.
3. `/data` (`ext4`): Dedicated data partition automatically expanded on first boot to use all remaining storage.

---

## 3. Creating the Offspot Image with `offspot-config` and `image-creator`

The official Offspot workflow uses `offspot-config` to build a recipe and `image-creator` to build the flashable `.img` file:

### Step 1: Install Offspot Tooling (Linux/WSL2)
```bash
python3 -m venv offspot-env
source offspot-env/bin/activate
pip install offspot-config image-creator
```

### Step 2: Generate Image Recipe
Run the provided recipe generator:
```bash
python offspot/build_recipe.py nexus_offspot_recipe.yaml
```

### Step 3: Build the Bootable Image
```bash
sudo image-creator nexus_offspot_recipe.yaml nexus_hotspot.img
```

### Step 4: Flash to SD Card
Use Raspberry Pi Imager or `dd`:
```bash
sudo dd if=nexus_hotspot.img of=/dev/sdX bs=4M status=progress conv=fsync
```

---

## 4. First Boot & Runtime Configuration

1. **Insert SD Card**: Place the flashed card into the Raspberry Pi and power on.
2. **First Boot Expansion**: Offspot automatically expands the `/data` partition to fill the SD card.
3. **Wi-Fi Hotspot Startup**:
   * `hostapd` creates the Wi-Fi network specified in `offspot.yaml` (default SSID: `NEXUS-Campus-WiFi`).
   * `dnsmasq` starts DHCP and DNS resolution for `nexus.hotspot`.
4. **Accessing the Hub**:
   * Connect any student laptop or tablet to `NEXUS-Campus-WiFi`.
   * Open the browser and go to `http://nexus.hotspot` or `http://10.0.0.1:5000`.

---

## 5. Storage Persistence & Docker Volumes

All persistent files are stored on the `/data` partition:

| Path on Host | Path in Container | Content |
|---|---|---|
| `/data/nexus/nexus.sqlite` | `/app/data/nexus.sqlite` | Course metadata, study plans, resource index |
| `/data/nexus/uploads/` | `/app/data/uploads/` | Standalone lecture MP4s and course PDFs |
| `/data/content/zims/` | `/data/zims` | OpenZIM archives served by Kiwix |

### Backup Procedure
To back up student data and ingested courses:
```bash
sudo tar -czvf /home/user/nexus_backup_$(date +%F).tar.gz /data/nexus
```

### Restore Procedure
```bash
sudo systemctl stop docker-compose
sudo tar -xzvf nexus_backup_YYYY-MM-DD.tar.gz -C /
sudo systemctl start docker-compose
```

---

## 6. Verifying Offline Video Streaming (HTTP 206)

To confirm that video seeking operates without downloading full files into memory:

```bash
# Request byte range 0 to 1000
curl -i -H "Range: bytes=0-1000" http://nexus.hotspot:5000/api/resources/res_ml_video_1/file
```

Expected response headers:
```http
HTTP/1.1 206 Partial Content
Accept-Ranges: bytes
Content-Type: video/mp4
Content-Range: bytes 0-1000/51483814
Content-Length: 1001
Content-Disposition: inline; filename="Week 1 Lecture 2 - Supervised Learning | Machine Learning.mp4"
```

---

## 7. Security Best Practices

1. **Unprivileged Container**: The NEXUS container runs as an unprivileged application container without `CAP_NET_ADMIN` or host network manipulation privileges.
2. **Path Traversal Protection**: Storage paths are validated to ensure all uploaded files remain strictly contained within `/app/data/uploads`.
3. **No Hardcoded Passwords**: Wi-Fi credentials and admin tokens are configured via environment variables or `/boot/firmware/offspot.yaml`.
4. **Honest Status Reporting**: The Admin Console queries real system metrics and reports `"Not detected in this deployment"` if hostapd telemetry is unavailable rather than fabricating data.
