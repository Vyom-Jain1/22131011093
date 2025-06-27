URL Shortener Frontend
A modern, responsive React + Material UI frontend for a production-grade URL Shortener microservice. This client allows users to shorten up to 5 URLs at once, view stats, and interact with a Node.js/Express/MongoDB backend.

Features
Shorten up to 5 URLs at once with optional custom shortcodes and expiry (1-1440 minutes)
Client-side validation for URLs, codes, and expiry
Copy-to-clipboard for generated short URLs
Stats page: View click count, last click, geo (simulated), expiry, and original URL
Responsive UI: Mobile-friendly, clean Material UI design
React Router for navigation (Shorten, Stats)
Axios for API requests
No login/signup required
Project Structure
frontend-test-submission/
├── public/                # Static assets and index.html
├── src/
│   ├── App.jsx            # Main app with routing
│   ├── index.js           # Entry point, theme setup
│   ├── index.css          # Global and responsive styles
│   ├── ShortenPage.jsx    # Main URL shortener form/page
│   └── components/
│       └── StatsPage.jsx  # Stats lookup page
├── package.json           # Dependencies and scripts
├── .gitignore             # Ignored files
└── README.md              # This file
Getting Started
Prerequisites
Node.js (v16+ recommended)
npm or yarn
Backend URL Shortener API running (see backend folder)
Installation
Install dependencies:

npm install
# or
yarn install
Start the development server:

npm start
# or
yarn start
The app runs at http://localhost:3000 by default.

Note: The frontend proxies API requests to http://localhost:5000 (see package.json), matching the backend default.

Build for Production
npm run build
# or
yarn build
The optimized build will be in the build/ folder.

Usage
Shorten URLs: Enter up to 5 URLs, set expiry/custom code if desired, and click "Shorten". Copy the generated short URL.
View Stats: Go to the Stats page, enter a short code, and view analytics.
Environment Variables
No custom .env is required for the frontend by default. To change the API proxy, edit the proxy field in package.json.
License
This project is for campus hiring evaluation and demo purposes
