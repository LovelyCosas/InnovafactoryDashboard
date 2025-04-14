const express = require('express');
const router = express.Router();
const { getSensors, postReading, getAlerts, getHistory, handleChat } = require('../controllers/sensors');

router.get('/sensors', getSensors);
router.post('/readings', postReading);
router.get('/alerts', getAlerts);
router.get('/history', getHistory);
router.post('/chat', handleChat);

module.exports = router;
