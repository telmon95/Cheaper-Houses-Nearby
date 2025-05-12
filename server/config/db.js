const mongoose = require('mongoose');
require('dotenv').config(); // Make sure dotenv is configured early

const connectDB = async () => {
    try {
        // Mongoose 6+ no longer requires these options
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
