import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
dotenv.config();

const app = express();
app.use(express.json());
// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});