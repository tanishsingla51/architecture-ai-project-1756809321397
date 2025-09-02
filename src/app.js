const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middleware/error.handler');
const ApiError = require('./utils/apiError');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());
app.options('*', cors());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1', apiRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle 404 Not Found
app.use((req, res, next) => {
  next(new ApiError(404, 'Not Found'));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
