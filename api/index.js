/**
 * Vercel Serverless Function entry point.
 * This file imports the Express app from the backend and exports it
 * as a Vercel serverless handler. Vercel automatically picks up any
 * file in the /api directory as a serverless function.
 */
module.exports = require('../backend/server');
