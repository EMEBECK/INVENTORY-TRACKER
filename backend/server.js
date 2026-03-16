const express = require('express');
const cors = require('cors');
require('dotenv').config();

const inventoryRoutes = require('./routes/inventory');
const activityRoutes = require('./routes/activity');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/activity', activityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
