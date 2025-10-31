"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const websites_1 = __importDefault(require("./api/routes/websites"));
const products_1 = __importDefault(require("./api/routes/products"));
const scrape_1 = __importDefault(require("./api/routes/scrape"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/websites', websites_1.default);
app.use('/api/products', products_1.default);
app.use('/api/scrape', scrape_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map