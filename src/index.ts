import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import ingredientRoutes from './routes/ingredientRoutes';
import categoryRoutes from './routes/categoryRoutes';
import toppingRoutes from './routes/toppingRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import orderDetailRoutes from './routes/orderDetailRoutes';
import promotionRoutes from './routes/promotionRoutes';
import supplierRoutes from './routes/supplierRoutes';
import orderIngredientRoutes from './routes/orderIngredientRoutes';
import orderIngredientDetailRoutes from './routes/orderIngredientDetailRoutes';
import statisticIngredientRoutes from './routes/statisticIngredientRoutes';
import reviewRoutes from './routes/reviewRoutes';
import feedRoutes from './routes/feedbackRoutes';
import storeRoutes from './routes/storeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-details', orderDetailRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/order-ingredients', orderIngredientRoutes);
app.use('/api/order-ingredient-details', orderIngredientDetailRoutes);
app.use('/api/statistic-ingredients', statisticIngredientRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/feedbacks', feedRoutes);
app.use('/api/store', storeRoutes);

// Sample route
app.get('/', (_req, res) => {
  res.send('Hello from Express + TypeScript + MongoDB!');
});

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI || '', {})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
