import axios from 'axios';

// Use environment variable for API URL in production, otherwise default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Adjust port if needed

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Finds cheaper houses nearby based on search parameters.
 * @param {object} searchParams - The search parameters.
 * @param {object} searchParams.defaultArea - Defines the central area.
 * @param {string} searchParams.defaultArea.type - Type of area (e.g., 'Circle').
 * @param {object} searchParams.defaultArea.center - Center coordinates { lat, lng }.
 * @param {number} searchParams.defaultArea.radius - Radius in meters.
 * @param {number} searchParams.searchProximity - Distance around default area to search (meters).
 * @param {object} [searchParams.filters={}] - Optional filters { minPrice, maxPrice, minBeds, etc. }.
 * @returns {Promise<object>} - The API response data { success, benchmarkPrice, housesInAreaCount, cheaperNearbyHouses, message? }.
 * @throws {Error} - Throws an error if the API call fails or returns success: false.
 */
export const findCheaperNearbyHouses = async (searchParams) => {
    try {
        console.log('Sending search params:', searchParams);
        const response = await apiClient.post('/houses/find-cheaper-nearby', searchParams);

        // Check if the backend indicated success explicitly (optional but good practice)
        if (!response.data || response.data.success === false) {
            // Use message from backend if available, otherwise generic error
            throw new Error(response.data?.message || 'API returned unsuccessful response.');
        }

        return response.data; // Contains { success: true, benchmarkPrice, housesInAreaCount, cheaperNearbyHouses, message? }

    } catch (error) {
        console.error("API Error:", error.response || error.message || error);

        // Extract a meaningful error message
        let errorMessage = 'Failed to fetch data from server.';
        if (error.response) {
            // Request made and server responded with a status code outside 2xx range
            errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'No response from server. Please check network connection or if the server is running.';
        } else if (error.message) {
            // Something happened in setting up the request that triggered an Error
            errorMessage = error.message;
        }

        // Re-throw an error with a user-friendly message
        throw new Error(errorMessage);
    }
};

// Add other API functions here if needed (e.g., fetching house details)
