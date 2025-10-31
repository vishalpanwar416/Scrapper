import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import websitesRouter from './api/routes/websites.js';
import productsRouter from './api/routes/products.js';
import scrapeRouter from './api/routes/scrape.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/websites', websitesRouter);
app.use('/api/products', productsRouter);
app.use('/api/scrape', scrapeRouter);
// Health
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});
