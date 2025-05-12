const express = require('express');
const { findCheaperNearby } = require('../controllers/houseController');

const router = express.Router();

// POST /api/houses/find-cheaper-nearby
router.post('/find-cheaper-nearby', findCheaperNearby);

// Add other house-related routes here if needed (e.g., GET /api/houses/:id)

module.exports = router;
