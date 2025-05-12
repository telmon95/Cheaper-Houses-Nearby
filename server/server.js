const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan'); // For logging HTTP requests
const connectDB = require('./config/db');
const houseRoutes = require('./routes/houseRoutes');
const path = require('path'); // Needed if serving React build static files

// Load env vars (do this first)
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---

// CORS - Allow requests from your React app's origin
const allowedOrigins = process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000'] // <<<--- CORRECTED: Allow Frontend running on 3001
    : ['http://localhost:3000']; // <<<--- Placeholder for actual deployed frontend URL

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // Or allow all origins if the list is empty or contains '*' (less secure for production)
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
       return callback(null, true);
    }
    // Check if the incoming origin is in our allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      // Block if not in the list
      return callback(new Error(msg), false);
    }
    // Allow if in the list
    return callback(null, true);
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: true, // Important if you need cookies/authorization headers
}));

// Body Parser - To accept JSON data in request body
app.use(express.json());

// Morgan - Logging (use 'dev' format for concise development logging)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logs HTTP requests like: GET /api/houses/... 200 OK 5.123 ms - 123
}

// --- API Routes ---
app.use('/api/houses', houseRoutes); // Mount house routes under /api/houses

// --- Static Files (Optional - for Production Deployment) ---
// If deploying backend and frontend together on the same server/domain
if (process.env.NODE_ENV === 'production') {
  // Set static folder (assuming client build is in ../client/build relative to server.js)
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));

  // Serve index.html for any routes not handled by the API or static files
  // This allows React Router to handle client-side routing
  app.get('*', (req, res, next) => {
    // Exclude API routes from being served index.html
    if (req.originalUrl.startsWith('/api')) {
      return next(); // Let API routes fall through to the 404 handler below if not matched
    }
    // Check if the file exists in the build folder first (optional optimization)
    // If not an API route, serve the main React app entry point
    res.sendFile(path.resolve(clientBuildPath, 'index.html'), (err) => {
        if (err) {
            // Handle potential errors like file not found in build directory
            res.status(500).send(err);
        }
    });
  });
} else {
   // Basic health check route only for development
   app.get('/', (req, res) => res.send('API Running...'));
}


// --- Basic Not Found Handler (for API routes) ---
// This middleware runs if no API route defined above matched the request URL
app.use('/api/*', (req, res, next) => { // More specific path for API 404
    res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});


// --- Global Error Handling Middleware ---
// Catches errors passed via next(err) or thrown synchronously in route handlers
// Should be defined LAST, after all other app.use() and routes
app.use((err, req, res, next) => { // Standard Express error handler signature
  // Log the full error stack for debugging on the server
  console.error("Global Error Handler Caught an Error:", err.stack);

  // Determine status code: use the error's status code if it has one, otherwise default to 500
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';

  // Send a consistent JSON error response
  res.status(statusCode).json({
      success: false, // Indicate failure
      message: errorMessage,
      // Optionally provide stack trace only in development for security
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Don't leak stack details in prod
  });
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
