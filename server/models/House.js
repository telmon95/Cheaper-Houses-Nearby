const mongoose = require('mongoose');

const HouseSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    // GeoJSON Point format for MongoDB geospatial queries
    location: {
        type: {
            type: String,
            enum: ['Point'], // Only 'Point' allowed
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude] order
            required: true,
        },
    },
    bedrooms: Number,
    bathrooms: Number,
    sqft: Number,
    propertyType: String,
    listingUrl: String,
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

// Create a 2dsphere index for geospatial queries
HouseSchema.index({ location: '2dsphere' });

// Helper function to calculate median price from an array of prices
HouseSchema.statics.calculateMedianPrice = function(prices) {
    if (!prices || prices.length === 0) return 0;
    // Create a copy before sorting
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    if (sortedPrices.length % 2 === 0) {
        // Even number of prices, average the two middle ones
        return (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
    } else {
        // Odd number of prices, return the middle one
        return sortedPrices[mid];
    }
};


module.exports = mongoose.model('House', HouseSchema);
