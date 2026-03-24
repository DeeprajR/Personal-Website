---
title: "Weaponising WiFi with a $3 Chip: ESP8266 Deauth Attack"
hook: "How I used a tiny NodeMCU board and 80 lines of C++ to silently kick devices off any WiFi network, and what that taught me about protocol-level security."
date: 2026-03-14
categories: ["Cybersecurity"]
tags: ["esp8266", "wifi", "cybersecurity", "hardware", "networking"]
bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1600"
---

This is a project I built purely out of curiosity: a WiFi deauthentication attack tool running on a board that costs less than a cup of coffee. No magic, no black-box tools — just the IEEE 802.11 spec, an ESP8266 NodeMCU, and a Saturday afternoon.

> **Disclaimer:** This was built and tested exclusively on my own home network. Running deauth attacks against networks you don't own is illegal under the Computer Fraud and Abuse Act (US), IT Act (India), and equivalent laws globally. This article is for educational understanding only.

---

### What is a Deauth Attack?

A WiFi deauthentication attack exploits a fundamental flaw in the **IEEE 802.11** wireless protocol. In older WiFi standards (pre-802.11w), management frames — the packets responsible for connecting and disconnecting devices — are completely **unauthenticated**. Anyone on the same frequency band can forge a deauth frame with a victim's MAC address as the source, and the target access point or client will dutifully disconnect.

It looks like this in practice:

```
Attacker → (forged deauth frame, src=victim MAC, dst=router) → Router
Router → "Okay, you asked to leave" → Kicks victim device off WiFi
```

The router cannot verify whether the deauth frame actually came from the real device. This is not a software bug. It is a protocol specification issue that existed for over 20 years.

---

### The Hardware

The ESP8266 is a micro Wi-Fi SoC (System on Chip) built by Espressif. The NodeMCU development board wraps it with a USB interface and broken-out GPIO pins, making it trivially easy to flash firmware from a laptop.

**What I used:**
- **NodeMCU v1.0** (ESP8266 12-E module)
- **Micro USB cable** for flashing
- **Arduino IDE** with the ESP8266 board package installed

The chip natively supports 802.11 b/g/n at 2.4 GHz, which is exactly what we need.

---

### How It Works Under the Hood

The ESP8266 SDK exposes low-level functions that allow you to send **raw 802.11 management frames** directly, bypassing the normal WiFi stack. The `wifi_send_pkt_freedom()` function is the key — it lets you craft and inject arbitrary frames onto the air.

A deauth frame has a very specific byte structure per the 802.11 spec:

```
Frame Control (2 bytes) | Duration (2 bytes) | 
Destination MAC (6 bytes) | Source MAC (6 bytes) | 
BSSID (6 bytes) | Sequence Number (2 bytes) | 
Reason Code (2 bytes)
```

The **Reason Code** field tells the recipient *why* it's being disconnected. Code `0x07` means "Class 3 frame received from nonassociated STA" — a perfectly plausible reason that routers accept without question.

---

### The Implementation

I flashed a custom firmware that does three things in a loop:

1. **Scans** the 2.4 GHz band for all nearby access points and their BSSIDs
2. **Selects** a target SSID and BSSID from the scan results
3. **Continuously transmits** forged deauth frames — alternating between targeting the AP to kick clients, and targeting clients directly

```cpp
#include <ESP8266WiFi.h>

// Raw deauth frame template (802.11 management frame)
uint8_t deauthPacket[26] = {
  0xC0, 0x00,             // Frame Control: Deauth
  0x00, 0x00,             // Duration
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, // Destination: Broadcast
  0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, // Source (spoofed as AP)
  0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, // BSSID (target AP)
  0x00, 0x00,             // Sequence number
  0x07, 0x00              // Reason code: Class 3 frame
};

void sendDeauth(uint8_t* apMac, uint8_t channel) {
  wifi_set_channel(channel);
  memcpy(&deauthPacket[10], apMac, 6); // Set source as AP MAC
  memcpy(&deauthPacket[16], apMac, 6); // Set BSSID as AP MAC
  
  // Send 10 deauth frames per burst for reliability
  for (int i = 0; i < 10; i++) {
    wifi_send_pkt_freedom(deauthPacket, sizeof(deauthPacket), 0);
    delay(2);
  }
}
```

When this runs, every device on the targeted network starts getting disconnected. Phones, laptops — everyone gets kicked and fails to reconnect because the deauth frames keep coming faster than the handshake can complete.

---

### What I Observed

Testing on my own home network, the results were immediate:

- **Reconnection attempts** were continuously disrupted as long as the board was transmitting
- **Hidden SSIDs** became visible during the scan phase (the probe responses reveal them)
- **Channel hopping** was necessary since modern dual-band routers use 5 GHz, which the ESP8266 doesn't reach — meaning only 2.4 GHz clients were affected

A key observation: devices that supported **802.11w (Protected Management Frames)** were significantly more resistant. My newer MacBook was harder to keep disconnected compared to older IoT gadgets on the network.

---

### The Protocol Fix: 802.11w

The IEEE addressed this vulnerability in the **802.11w amendment (2009)**, which introduced Management Frame Protection (MFP). When enabled, management frames are cryptographically signed using the same 4-way handshake key negotiated during association. A forged deauth frame from an attacker won't have a valid MIC (Message Integrity Code) and will be silently dropped.

The catch? 802.11w requires **both the router and the client** to support and negotiate it. Legacy devices, cheap IoT hardware, and older firmware often don't — making this attack still viable on most home and enterprise networks today.

---

### What This Taught Me

This project shifted how I think about layers of trust in systems — not just in networks, but in product design more broadly.

The deauth attack works because the 802.11 spec trusted *intent* over *verification*. The protocol assumed that if a frame looks valid, it must be authentic. That's the exact kind of assumption that creates systemic fragility, whether in a WiFi stack, a product roadmap, or an organizational workflow.

The best systems validate at the boundary, not just at the core.

---

### Resources
- [IEEE 802.11w specification](https://ieeexplore.ieee.org/document/5278659)
- [ESP8266 SDK Documentation — Espressif](https://www.espressif.com/en/support/documents/technical-documents)
- [SpacehuhnTech deauth detector (defensive tool)](https://github.com/SpacehuhnTech/esp8266_deauther)
