const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sensorRoutes = require('./routes/sensors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/innovafactory', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use('/api', sensorRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
