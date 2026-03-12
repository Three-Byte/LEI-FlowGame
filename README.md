<div align="center">

# 🍔 3-Byte LEI Unit Flow Game

### *Learn lean flow principles by packing food orders*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 🎯 What Is This?

An interactive simulation that teaches **lean manufacturing flow concepts** through a food-order assembly scenario. Arrange four food categories in priority order, run a simulation of **25 orders**, and see how sequencing impacts speed, quality, and consistency.

> **TL;DR** — Drag categories into the right order. Hit Run. Watch the metrics change. Discover why sequencing matters.

---

## 🕹️ How To Play

### 1. 📋 Arrange Categories (Items Screen)

Drag and reorder four food categories to set your assembly priority:

| Category | 🌡️ Temp | Bag Units | Items |
|---|---|---|---|
| 🥪 **Sandwiches** | Hot | 2 | Sando 1, Sando 2, Sando 3 |
| 🍟 **Hot Sides** | Hot | 4 | Hot 1, Hot 2, Hot 3 |
| 🥤 **Cold Sides** | Cold | 4 | Cold 1, Cold 2, Cold 3 |
| 🥗 **Salads** | Cold | 12 | Salad 1, Salad 2 |

The **top category is assembled first**, the bottom last. This order determines how items are layered into the bag.

### 2. ▶️ Run the Simulation

Press **Run** to simulate 25 randomised orders (3–5 items each, deterministic seed). The simulation calculates lead times, penalties, and quality scores based on your chosen sequence.

### 3. 📊 Read the Metrics (Metrics Screen)

Three gauges tell you how well your sequence performed:

| Gauge | What It Measures |
|---|---|
| 🟢 **Flow Efficiency** | Ratio of pure assembly time to total time. 100% = zero sequencing waste. |
| 🟡 **Quality** | Thermal layering correctness. Each misplaced category costs 25%. |
| 🔵 **Smoothness** | Consistency of lead times across orders. Low variation = predictable output. |

Plus supporting stats: **Avg Lead Time** (seconds/order) and **Throughput** (orders/hour).

---

## 🧠 Key Concepts

### 🔥 Thermal Layering
Hot items (Sandwiches, Hot Sides) belong **on top** of the bag. Cold items (Cold Sides, Salads) go **on the bottom**. Mixing them up degrades food quality — hot food cools down, cold food warms up.

### ⏱️ Bag Reorganisation Penalty
When categories are out of optimal order, each **inversion** (pair of categories in the wrong relative position) adds **15 seconds** of reorganisation time at the Bag Pack station. More inversions = more wasted time, compounding across all 25 orders.

### ✅ The Optimal Sequence

```
🥪 Sandwiches  →  🍟 Hot Sides  →  🥤 Cold Sides  →  🥗 Salads
```

This eliminates reorganisation penalties **and** places hot items on top, cold on the bottom — maximising both speed and quality.

---

## 🛠️ Development

```bash
npm install        # install dependencies
npm run dev        # start dev server
npm test           # run tests
npm run build      # production build
```

---

## 📁 Project Structure

```
src/
├── lib/simulation.ts       # Pure TypeScript simulation engine
├── components/
│   ├── HomeScreen.tsx       # Drag-to-reorder items screen
│   ├── StatsScreen.tsx      # Gauges, stats & Gantt chart
│   ├── AboutScreen.tsx      # How-it-works reference
│   ├── GanttChart.tsx       # Order timeline visualisation
│   ├── GaugeRow.tsx         # Flow / Quality / Smoothness gauges
│   └── ...
└── assets/icons/            # Category & bag SVG icons
```

---

## 📄 License

[MIT](LICENSE)
