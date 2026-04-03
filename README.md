# VaxiCore — Child Vaccination Tracker
MERN Stack: MongoDB + Express + React + Node.js

---

## QUICK START (Local Development)

### Step 1 — Prerequisites
Install these first if you haven't:
- Node.js (v18+): https://nodejs.org
- Git: https://git-scm.com
- VS Code: https://code.visualstudio.com

---

### Step 2 — MongoDB Atlas (Free Database)
1. Go to https://cloud.mongodb.com and create a free account
2. Create a free cluster (M0 tier)
3. Under "Database Access" → Add user → set username + password
4. Under "Network Access" → Add IP → Allow access from anywhere (0.0.0.0/0)
5. Click "Connect" → "Connect your application" → copy the URI
6. It looks like: mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/

---

### Step 3 — Backend Setup
```
cd server
npm install
```

Create a `.env` file (copy from .env.example):
```
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/vaxicore
JWT_SECRET=any_long_random_string_here
PORT=5000
```

Run the server:
```
npm run dev
```

Server will start at http://localhost:5000

---

### Step 4 — Frontend Setup
Open a NEW terminal:
```
cd client
npm install
```

Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Run React:
```
npm start
```

App opens at http://localhost:3000

---

## DEPLOYMENT (Free Hosting)

### Database → MongoDB Atlas (already done above)

### Backend → Render.com
1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add Environment Variables (same as your .env):
   - MONGO_URI
   - JWT_SECRET
   - PORT = 5000
8. Deploy — Render gives you a URL like https://vaxicore-api.onrender.com

### Frontend → Vercel
1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Set Root Directory: `client`
4. Add Environment Variable:
   - REACT_APP_API_URL = https://vaxicore-api.onrender.com/api
5. Deploy — Vercel gives you a URL like https://vaxicore.vercel.app

---

## PROJECT STRUCTURE

```
vaxicore/
├── server/
│   ├── models/
│   │   ├── User.js         ← User schema
│   │   └── Child.js        ← Child + vaccines schema
│   ├── routes/
│   │   ├── auth.js         ← Login, Signup
│   │   └── children.js     ← CRUD for children + vaccines
│   ├── middleware/
│   │   └── auth.js         ← JWT verification
│   ├── .env                ← YOUR secrets (don't commit this)
│   ├── .env.example        ← Template for .env
│   └── server.js           ← Entry point
│
└── client/
    └── src/
        ├── api/
        │   └── axios.js        ← Axios API client
        ├── context/
        │   └── AuthContext.js  ← Global auth state
        ├── components/
        │   └── Navbar.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx   ← View + add + delete children
        │   └── ChildTracker.jsx← Vaccine list + mark done
        └── App.jsx             ← Routes
```

---

## API ENDPOINTS

| Method | Endpoint | Description | Auth? |
|--------|----------|-------------|-------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/children | Get all children | Yes |
| GET | /api/children/:id | Get one child | Yes |
| POST | /api/children | Add a child | Yes |
| PUT | /api/children/:id | Update child info | Yes |
| DELETE | /api/children/:id | Delete a child | Yes |
| PATCH | /api/children/:id/vaccines/:vid | Update vaccine status | Yes |
