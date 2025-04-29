# Express TypeScript MongoDB Starter 🚀

A boilerplate Node.js project using **Express.js**, **TypeScript**, **Mongoose (MongoDB)**, **ESLint**, **Prettier**, and **pnpm**. It provides a clean and scalable project structure with folders for configuration, controllers, models, routes, middlewares, utilities, and documentation.

## ✨ Features

- **Express.js** with TypeScript for type-safe development
- **MongoDB** integration using Mongoose
- Environment variable management with `dotenv`
- Middleware setup: CORS, Helmet for security
- Code quality with **ESLint** and **Prettier**
- Scalable project structure
- Development server with `ts-node-dev` for hot-reloading
- Dependency management with **pnpm**

## 📁 Project Structure

```
.
├── node_modules/      # Dependencies
├── src/              # Source code
│   ├── config/       # Configuration files (e.g., database, env)
│   ├── controllers/  # Request handlers
│   ├── docs/         # API documentation
│   ├── middleware/   # Custom middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # Express routes
│   ├── utils/        # Utility functions
│   └── index.ts      # Entry point
├── .env              # Environment variables
├── .eslintrc         # ESLint configuration
├── .eslintrc.js      # Alternative ESLint configuration
|── .gitattributes    #Normalize line endings for current files
├── .gitignore        # Git ignore file
├── .prettierrc       # Prettier configuration
├── package.json      # Project metadata and scripts
├── pnpm-lock.yaml    # pnpm lock file
├── README.md         # Project documentation
└── tsconfig.json     # TypeScript configuration
```

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nguyntrung/milktea-be.git
cd milktea-be
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:

```plaintext
MONGO_URI=your_mongodb_connection_string
```

### 4. Run the Development Server

```bash
pnpm dev
```

The server will start at: [http://localhost:5000](http://localhost:5000)

### 5. Build and Run in Production

```bash
pnpm build
pnpm start
```

## 📦 Available Scripts

- **`pnpm dev`**  
  Starts the development server with hot-reloading using `ts-node-dev`.

- **`pnpm build`**  
  Compiles TypeScript to JavaScript and outputs to the `dist/` folder.

- **`pnpm start`**  
  Runs the compiled project in production mode.

- **`pnpm lint`**  
  Lints the codebase using ESLint with TypeScript rules.

- **`pnpm format`**  
  Formats the code using Prettier for consistent styling.

## ✅ Linting and Formatting

- **ESLint** is configured with TypeScript-specific rules to catch errors early.  
- **Prettier** ensures consistent code formatting across the project.  

Run the following to maintain code quality:

```bash
pnpm lint    # Check for linting issues
pnpm format  # Auto-format the codebase
```

## 📝 Notes

- Ensure MongoDB is running locally or provide a valid `MONGO_URI` for a remote database.
- Customize the project structure and middleware as needed for your application.