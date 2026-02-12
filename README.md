This project follows a clean separation of concerns by organizing logic, UI, hooks, utilities, and API layers inside the src/ directory.

🚀 Tech Stack

React (JSX)

Vite

Tailwind CSS

PostCSS

ESLint

Modern ES Modules

📂 Project Structure
├── .qodo/                    # Qodo configuration (if used)
├── entities/                 # Domain entities / business models (if global)

├── src/
│   ├── api/                  # API calls & service layer
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Shared libraries / external configs
│   ├── pages/                # Page-level components (routes/screens)
│   ├── utils/                # Utility/helper functions
│   │
│   ├── App.jsx               # Root application component
│   ├── Layout.jsx            # Layout wrapper component
│   ├── main.jsx              # Application entry point
│   ├── App.css               # App styles
│   ├── index.css             # Global styles
│   └── pages.config.js       # Page/route configuration
│
├── index.html                # HTML entry (Vite)
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
├── components.json           # Component configuration
├── jsconfig.json             # Path alias configuration
├── .gitignore
└── README.md

🛠️ Local Development
1️⃣ Clone Repository
git clone <your-repository-url>
cd <project-folder>

2️⃣ Install Dependencies
npm install

3️⃣ Start Development Server
npm run dev


App runs at:

http://localhost:5173

📦 Production Build

Build optimized production files:

npm run build


This generates:

/dist


Preview production build locally:

npm run preview

🌍 Deployment Guide

Since this is a Vite React frontend, it can be deployed to any static hosting provider.

✅ Recommended: Vercel

Best for Vite + React projects.

Steps:

Push project to GitHub

Go to https://vercel.com

Click New Project

Import your repo

Configure:

Framework: Vite
Build Command: npm run build
Output Directory: dist


Deploy 🎉

✅ Netlify

Build settings:

Build command: npm run build
Publish directory: dist

✅ GitHub Pages

Install:

npm install gh-pages --save-dev


Update package.json:

"homepage": "https://yourusername.github.io/repository-name",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}


Deploy:

npm run deploy

✅ cPanel / VPS Hosting

Run:

npm run build


Upload the contents of dist/ folder into:

public_html/

⚙️ Environment Variables

Create .env in root:

VITE_API_URL=https://api.example.com


Access inside code:

const apiUrl = import.meta.env.VITE_API_URL;


⚠️ All Vite variables must start with VITE_.

🧠 Architecture Philosophy

api/ → Communication layer

components/ → UI building blocks

pages/ → Full screens

hooks/ → Reusable logic

utils/ → Helpers

lib/ → Shared setup/config

entities/ → Domain models

Layout.jsx → Global layout wrapper

main.jsx → App bootstrap entry

This architecture ensures:

Scalability

Maintainability

Clean separation of responsibilities

Easy feature expansion

🧹 Linting

Run ESLint:

npm run lint

📜 License

MIT License
