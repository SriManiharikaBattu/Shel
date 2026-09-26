# 🏡 Shel — Modern PG & Hostel Discovery Platform

<p align="center">
  <img src="public/logo.png" alt="Shel Logo" width="100" height="100" style="border-radius: 50%;" />
</p>

<p align="center">
  <strong>Find & list verified paying guest (PG) accommodations, student hostels, and premium co-living spaces across India with live bed vacancy tracking, GPS radar, and direct owner messaging.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-shel__db-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Prisma-6.2-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet" />
</p>

---

## 🌟 Key Features

- **⚡ Sleek Pure Black / Dark Glassmorphism UI**: High contrast `#090d16` aesthetics with emerald, amber, and cyan visual accents.
- **📍 Real-Time GPS & Multi-City Radar**: Nationwide coverage spanning 10 major Indian metro hubs (Hyderabad, Bengaluru, Mumbai, Pune, Delhi NCR, Noida, Gurugram, Chennai, Kolkata, Ahmedabad) with distance calculations.
- **🛏️ Live Bed Vacancy Tracking**: Real-time room availability counters (Single, Double, Triple, and Dormitory sharing).
- **🛡️ Multi-Role System**:
  - **Seekers**: Auto-gender filtered search, side-by-side comparison matrix (up to 3 hostels), wishlisting, and direct chat enquiries.
  - **Property Owners**: Property listing with structured photo picker, bed vacancy counter controls, and enquiry chat hub.
  - **Admins**: Verification badge approval, compliance monitoring, and platform metrics.
- **📸 Authentic Photo Gallery Architecture**: Categorized images segregated into `/images/girls/`, `/images/boys/`, `/images/coed/`, `/images/rooms/`, and `/images/exteriors/`.
- **💬 Real-Time In-App Messaging**: Direct end-to-end communication between seekers and hostel owners.
- **🔐 Secure Authentication**: JWT cookies, bcrypt password hashing, and fast phone OTP authentication.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **UI Library** | [React 19](https://react.dev/) & [Lucide Icons](https://lucide.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with Glassmorphic styling |
| **Database** | [MongoDB](https://www.mongodb.com/) (`shel_db` with replica set `rs0`) |
| **ORM** | [Prisma 6.2](https://www.prisma.io/) (MongoDB connector) |
| **Maps** | [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) |
| **Auth** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |

---

## 📂 Project Architecture

```plaintext
pg-finder/
├── prisma/
│   ├── schema.prisma         # Prisma MongoDB schema definition
│   └── seed.js               # 400 Indian hostels dataset with modern branding
├── public/
│   ├── logo.png              # Circular Shel brand logo
│   └── images/               # Categorized image assets
│       ├── boys/             # Boys PG & Hostel photos
│       ├── girls/            # Girls PG & Ladies Hostel photos
│       ├── coed/             # Shared & Co-Living lounge/dorm photos
│       ├── rooms/            # Single/Double/Triple AC room photos
│       └── exteriors/        # Multi-storey campus & exterior photos
├── src/
│   ├── app/
│   │   ├── admin/            # Admin moderation dashboard
│   │   ├── auth/             # Login, Signup, OTP & Password flows
│   │   ├── owner/            # Owner dashboard & enquiry chat
│   │   ├── seeker/           # Search, Leaflet map, filters & compare
│   │   ├── profile/          # User profile settings
│   │   └── api/              # REST endpoints for auth, properties, chat
│   ├── components/           # Navbar, PropertyCard, Map, ChatWindow
│   └── lib/                  # Prisma client, JWT, authentication helpers
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- [MongoDB](https://www.mongodb.com/try/download/community) (v6.0+ or v8.0+) configured with a replica set.

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/shel-search.git
cd shel-search/pg-finder
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
DATABASE_URL="mongodb://127.0.0.1:27018/shel_db?replicaSet=rs0&directConnection=true"
JWT_SECRET="shel_super_secret_jwt_key_2026"

# Email OTP Delivery via Resend
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="Shel <onboarding@resend.dev>"

# SMS OTP Delivery via MSG91
MSG91_AUTH_KEY="your_msg91_auth_key"
MSG91_TEMPLATE_ID="your_msg91_template_id"
```

---

## 📩 OTP Delivery Setup

The platform uses real, secure, multi-channel OTP delivery for passwordless authentication:

1. **Email OTP via Resend**:
   - Sign up at [Resend](https://resend.com) and create an API Key.
   - Set `RESEND_API_KEY` in `.env`.
   - Optionally set `RESEND_FROM_EMAIL="Shel <yourname@yourdomain.com>"` (defaults to `Shel <onboarding@resend.dev>` for sandbox testing).

2. **SMS OTP via MSG91**:
   - Sign up at [MSG91](https://msg91.com) and retrieve your **Authkey**.
   - Create an OTP template/flow in MSG91 and copy the **Template ID**.
   - Set `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` in `.env`.

> [!IMPORTANT]
> Both email and SMS providers are strictly validated. If a user attempts to log in with an email or phone number and the corresponding API credentials are not provided or delivery fails, the system will fail loudly with a descriptive error message rather than silently faking successful delivery.

---

### 5. Start MongoDB with Replica Set
Prisma MongoDB connector requires a replica set enabled:
```powershell
# Windows
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --port 27018 --dbpath "data\mongo_db" --replSet rs0 --bind_ip 127.0.0.1
```

### 6. Sync Database & Ingest Dataset
```bash
npx prisma db push
node prisma/seed.js
```

### 7. Run the Application
```bash
# Development mode
npm run dev

# Or Production build
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo & Test Accounts

| Role | Email | Password | Role Access |
| :--- | :--- | :--- | :--- |
| **Seeker (Female)** | `priya@pgfinder.com` | `password123` | Seeker Stays Directory & Chats (`/seeker`) |
| **Seeker (Male)** | `rahul@pgfinder.com` | `password123` | Seeker Stays Directory & Chats (`/seeker`) |
| **PG Owner** | `anjali@pgfinder.com` | `password123` | Hostels Portfolio & Inquiries (`/owner`) |
| **Admin** | `admin@pgfinder.com` | `password123` | Verification Desk & Admin Panel (`/admin`) |

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).

