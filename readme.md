# VATPHIL METAR Viewer

A real-time, draggable, resizable METAR viewer for Philippine airports. Built with **React + TypeScript**, this app fetches live METAR data from a local server and presents it in interactive, customizable boxes.

---

## Features

### 1. Real-time METAR Data
- Fetches METAR reports from VATSIM.
- Displays:
  - QNH (hPa and inHg)
  - Wind direction, speed, and gusts
  - Cloud coverage
  - Raw METAR string
- Automatic refresh every **30 minutes**.
- Local time (PH) and Zulu (UTC) clock updating **every second**.

---

### 2. Interactive Boxes
- **Draggable**: Click and drag boxes anywhere on the screen.
- **Resizable**: Drag the bottom-right corner to adjust size.
- **Editable ICAO**: Change the airport ICAO code; press **Enter** to fetch.
- **Dynamic Red Highlight**: Box flashes **red** when a new METAR is received, but only after the initial fetch (not on first load).
- **Transparency**: Boxes are slightly transparent for a sleek look.
- **Remove Individual Box**: Click the `–` button on each box to remove it.

---

### 3. Global Controls
- **Add Box (+)**: Creates a new METAR box at the screen center.
  - Hover tooltip: `Add METAR`.
- **Clear All Boxes (-)**: Removes all METAR boxes.
  - Hover tooltip: `Remove all`.

---

### 4. User Experience
- **No page scroll**: Fixed full-screen layout.
- **Automatic color adjustments**: Text and box colors update dynamically based on state.

---

### 5. Airport Coverage
Default airport ICAO codes included:
- `RPLL` — Ninoy Aquino International Airport
- `RPVM` — Mactan International Airport
- `RPLB` — Subic Bay International Airport
- `RPMD` — Francisco Bangoy International Airport
- `RPLI` — Laog International Airport
- `RPVK` — Kalibo International Airport
- `RPMZ` — Zamboanga International Airport
- `RPVD` — Dumaguete Airport
- `RPLC` — Clark International Airport
- Unknown ICAOs show as `Unknown Airport`.

---

### 6. Technical Details
- Built with **React** and **TypeScript**.
- State management with `useState` and `useRef`.
- Box positions tracked dynamically.
- Periodic fetch reads current boxes for live updates.
- **App.css** handles layout, colors, buttons, transparency, and logo placement.

---

## Setup Instructions

To be added
