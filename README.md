# CityCare
A responsive civic complaint demo built with Node.js, Express and optional MongoDB Atlas.

## Run locally
1. Install Node.js 18 or newer.
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open http://localhost:3000

Without MONGODB_URI, complaints are stored in temporary memory and disappear when the server restarts. For persistent storage, create a MongoDB Atlas database and set MONGODB_URI and MONGODB_DB in your hosting provider's environment settings. Set ADMIN_KEY to a strong secret there too. Never commit `.env` or share admin keys.

## Deploy
Push this folder to a GitHub repository. On Render create a new Web Service from that repository. Build command: `npm install`; Start command: `npm start`. Add environment variables `MONGODB_URI`, `MONGODB_DB=citycare`, and a strong `ADMIN_KEY` in Render. Deploy, then open the generated HTTPS URL. Browser GPS needs user permission and HTTPS.

This is a starter/demo and does not include identity verification, rate limiting, or production-grade privacy/security review.
