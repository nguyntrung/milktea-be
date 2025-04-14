import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import userRouters from './routes/userRoutes';

import connectDB from './config/db';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRouters);

// Start
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
