# Backend setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `MONGO_URI` to your MongoDB connection string and replace `JWT_SECRET` with a long, random value.
4. Start the API with `npm run dev` or `npm start`.

Keep `.env` private. It is ignored by Git; only `.env.example` should be committed.

On startup, the backend adds any missing starter products from `data/sampleProducts.js` without duplicating products by name. It also refreshes the image URLs for the wireless charger, tablet stand, jigsaw puzzle, and board game in existing databases.
