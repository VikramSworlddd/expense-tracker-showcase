import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { mutationHeaderMiddleware } from './middleware/mutationHeader.js';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import expensesRoutes from './routes/expenses.js';
import metricsRoutes from './routes/metrics.js';

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Mutation header check for POST/PUT/DELETE
app.use(mutationHeaderMiddleware);

// Routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/categories', authMiddleware, categoriesRoutes);
app.use('/api/expenses', authMiddleware, expensesRoutes);
app.use('/api/metrics', authMiddleware, metricsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

