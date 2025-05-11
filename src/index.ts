import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import ingredientRoutes from './routes/ingredientRoutes';
import categoryRoutes from './routes/categoryRoutes';
import toppingRoutes from './routes/toppingRoutes';
import productRoutes from './routes/productRoutes';
import supplierRoutes from './routes/supplierRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MilkTea API',
      version: '1.0.0',
      description: 'API documentation for the MilkTea backend',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Đường dẫn đến các file route của bạn
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);

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
      console.log(`API docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
