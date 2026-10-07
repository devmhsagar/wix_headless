# Aura Studio — Production Wix Headless Platform

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Wix Headless](https://img.shields.io/badge/Wix-Headless_SDK-0C6EFC?style=flat&logo=wix&logoColor=white)](https://dev.wix.com/docs/build-apps/developer-tools/headless)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance digital architecture and strategic advisory portfolio website powered by the official **Wix Headless JavaScript SDKs** and a modern **React 19 + Vite** frontend.

---

## 🌟 Live Features & Integrated Wix Services

This project is deeply integrated with real Wix cloud services without mock data:

| Domain | Official SDK Package | Features |
| :--- | :--- | :--- |
| **Bookings & Scheduling** | `@wix/bookings` | Interactive monthly calendar picker, real-time Wix **Time Slots V2** queries (`bookable: true`), attendee details form, live session reservation. |
| **Store & eCommerce** | `@wix/stores` & `@wix/ecom` | Live product catalog, price formatting, stock status, slide-over cart drawer, quantity modifiers, and checkout session redirect. |
| **Studio Journal / Blog** | `@wix/blog` | Dynamic feed of published articles, keyword search, newest/oldest sorting, and full publication modal view. |
| **Client Testimonials** | `@wix/data` | Real-time endorsements queried from Wix CMS Data Collection with ratings and role metadata. |
| **Direct Contact / CRM** | `@wix/forms` | Dedicated `/contact` page dispatching inquiries to native Wix Forms / CRM contacts with reference confirmation. |

---

## 🏗️ Architecture & Security Model

```
┌──────────────────────────────────────────────────────────┐
│              Browser Client (React 19 + Vite)            │
│  - Public OAuthStrategy Client: VITE_WIX_CLIENT_ID       │
│  - @wix/sdk, @wix/blog, @wix/stores, @wix/bookings       │
│  - @wix/ecom, @wix/data, @wix/forms                      │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTPS / TLS (OAuth 2.0)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                     Wix Cloud Gateway                    │
│  - Site ID: 1c6ae045-e46e-43d4-adfb-3beb1beaac3e         │
│  - Account ID: 456351de-45e0-479b-829a-e50e747b2bec      │
│  - Wix Stores • Wix Bookings • Wix CMS • Wix Forms       │
└──────────────────────────────────────────────────────────┘
```

> **Security Rule**: `WIX_API_KEY` and administrative secret tokens are strictly maintained server-side and never bundled into client-facing JavaScript.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js `^20.9.0 || ^22.11.0 || ^24` (or v26+)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/devmhsagar/wix_headless.git
cd wix_headles
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_WIX_CLIENT_ID=1fe2dd83-1c28-450a-8f3a-9ee727449674
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🚢 Vercel Deployment Guide

1. **Connect GitHub Repository**: Import [https://github.com/devmhsagar/wix_headless.git](https://github.com/devmhsagar/wix_headless.git) in the [Vercel Dashboard](https://vercel.com/new).
2. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   - `VITE_WIX_CLIENT_ID`: `1fe2dd83-1c28-450a-8f3a-9ee727449674`
4. **Deploy**: Click **Deploy**. Vercel will assign a production `.vercel.app` URL.

---

## 📄 License
MIT License. Crafted by Aura Studio & Advisory.
