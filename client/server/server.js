const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const modelRoutes = require('./routes/modelRoutes');
const uploadRoutes = require('./routes/uploadRoutes');


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api/model', modelRoutes);
app.use('/api/upload', uploadRoutes);

// Connect to MongoDB (你需要在 .env 文件中设置 MONGODB_URI)
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.get('/', (req, res) => {
  res.send('ML No-Code Platform API');
});

// Start server
const port = process.env.PORT || 5002;
app.listen(port, () => console.log(`Server running on port ${port}`));