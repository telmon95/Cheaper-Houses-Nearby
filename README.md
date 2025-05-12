# Nearby Cheaper Houses Finder

A full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) to find houses in the vicinity of a selected area that are priced lower than the median price within that selected area.

## Features

*   **Interactive Map:** Uses Leaflet via `react-leaflet` to display a map.
*   **Area Selection:** Users can click on the map to define the center of a default search area.
*   **Customizable Search:** Users can define the radius of the default area and the proximity around it to search for cheaper houses.
*   **Benchmark Calculation:** The backend calculates the median price of houses found *within* the selected default area.
*   **Nearby Cheaper Filtering:** The backend finds houses *outside* the default area but within the specified proximity and filters them to show only those priced *below* the calculated benchmark.
*   **Results Visualization:** Cheaper nearby houses are displayed as markers on the map.
*   **(Optional List View):** Can display results in a text list below the map.

## Tech Stack

*   **Frontend:**
    *   React (v18+)
    *   `react-leaflet` & `leaflet` for interactive maps
    *   `axios` for API calls
    *   CSS (basic styling, can be extended)
*   **Backend:**
    *   Node.js
    *   Express.js framework
    *   Mongoose ODM for MongoDB interaction
    *   `cors` for handling Cross-Origin Resource Sharing
    *   `dotenv` for environment variables
    *   `morgan` for HTTP request logging
*   **Database:**
    *   MongoDB (requires geospatial query support)
*   **Environment:**
    *   Node.js (LTS versions like v18 or v20 recommended)
    *   `npm` (Node Package Manager)

## Project Structure
Use code with caution.
Markdown
MVP/
├── client/ # React Frontend
│ ├── public/ # Static assets (index.html, favicon, etc.)
│ ├── src/ # React source code (components, services, App.js)
│ └── package.json # Frontend dependencies & scripts
│
├── server/ # Node.js/Express Backend
│ ├── config/ # Database connection logic (db.js)
│ ├── controllers/ # Request handling logic (houseController.js)
│ ├── models/ # Mongoose schemas (House.js)
│ ├── routes/ # API route definitions (houseRoutes.js)
│ ├── .env # Environment variables (MONGODB_URI, PORT) - !! GITIGNORE !!
│ ├── server.js # Main backend server file
│ └── package.json # Backend dependencies & scripts
│
└── README.md # This file

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** An LTS (Long-Term Support) version is strongly recommended (e.g., v18.x, v20.x). Avoid using highly experimental versions (like v23). You can use [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) to manage multiple Node versions.
*   **npm:** Usually comes bundled with Node.js.
*   **MongoDB:** A running instance of MongoDB (local or remote like MongoDB Atlas). The application requires MongoDB's geospatial query capabilities.
*   **Git:** For cloning the repository (if applicable).

## Installation & Setup

1.  **Clone the Repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd MVP # Or your project's root folder name
    ```

2.  **Backend Setup:**
    *   Navigate to the server directory:
        ```bash
        cd server
        ```
    *   Install backend dependencies:
        ```bash
        npm install
        ```
    *   Create an environment variable file:
        ```bash
        touch .env
        ```
    *   Add the following variables to the `.env` file, replacing the placeholder values:
        ```dotenv
        NODE_ENV=development
        PORT=5001 # Or another port for the backend
        MONGODB_URI=mongodb://localhost:27017/housingDB # Replace with your MongoDB connection string
        ```
    *   **Important:** Add `.env` to your root `.gitignore` file to avoid committing secrets.

3.  **Frontend Setup:**
    *   Navigate to the client directory (from the project root):
        ```bash
        cd ../client # If you were in server/
        # OR
        # cd client # If you were in MVP/
        ```
    *   Install frontend dependencies:
        ```bash
        npm install
        ```
    *   *(Note: If you encounter OpenSSL errors on older Node versions, you might need the `--openssl-legacy-provider` flag in the `start`/`build` scripts in `client/package.json`, but using Node LTS is preferred).*

4.  **Database Setup:**
    *   Ensure your MongoDB server specified in `MONGODB_URI` is running.
    *   Connect to your MongoDB database (e.g., using `mongosh` or MongoDB Compass).
    *   Select the database (e.g., `housingDB`).
    *   **Add Sample Data:** This application *requires* data in the `houses` collection to function. Insert documents matching the schema defined in `server/models/House.js`. Crucially, include the `location` field with GeoJSON Point data:
        ```json
        // Example Document
        {
          "address": "123 Main St, Sampleville",
          "price": 550000,
          "location": {
            "type": "Point",
            "coordinates": [-74.001, 40.710] // [longitude, latitude]
          },
          "bedrooms": 3,
          "bathrooms": 2
        }
        ```
        Add multiple data points both inside and outside potential search areas with varying prices.

## Running the Application

You need **two separate terminals** running simultaneously.

1.  **Start the Backend Server:**
    *   Open a terminal window.
    *   Navigate to the server directory: `cd server`
    *   Run: `npm start`
    *   You should see output like:
        ```
        Server running in development mode on port 5001
        MongoDB Connected: <your_host>
        ```
    *   Keep this terminal open.

2.  **Start the Frontend Client:**
    *   Open a **new** terminal window.
    *   Navigate to the client directory: `cd client`
    *   Run: `npm start`
    *   This should automatically open your web browser to `http://localhost:3000` (or the next available port, like 3001 - **make sure your server's CORS config matches this port!**).

## API Endpoints (Backend)

*   **`POST /api/houses/find-cheaper-nearby`**
    *   **Description:** Finds houses nearby a specified area that are cheaper than the median price within that area.
    *   **Request Body (JSON):**
        ```json
        {
          "defaultArea": {
            "type": "Circle", // Currently only Circle supported
            "center": { "lat": 40.7128, "lng": -74.0060 },
            "radius": 1000 // Radius in meters
          },
          "searchProximity": 5000, // Distance (meters) around defaultArea to search
          "filters": { // Optional filters
            "minPrice": 100000,
            "maxPrice": 800000,
            "minBeds": 2
          }
        }
        ```
    *   **Success Response (200 OK):**
        ```json
        {
          "success": true,
          "benchmarkPrice": 550000, // Calculated median price or null
          "housesInAreaCount": 5,   // Count of houses used for benchmark
          "cheaperNearbyHouses": [ // Array of house objects matching criteria
            { "_id": "...", "address": "...", "price": 450000, "location": {...}, ... },
            // ... more houses
          ]
        }
        ```
     *   **Error Response (e.g., 400, 500):**
        ```json
        {
          "success": false,
          "message": "Error description...",
          "stack": "..." // Only in development
        }
        ```

## Environment Variables (Backend)

Create a `.env` file in the `server/` directory:

*   `NODE_ENV`: Set to `development` or `production`. Controls logging, CORS settings, error details.
*   `PORT`: The port for the backend server (e.g., `5001`).
*   `MONGODB_URI`: Your full MongoDB connection string (e.g., `mongodb://localhost:27017/housingDB` or MongoDB Atlas URI).

## Usage

1.  Open the application in your browser (e.g., `http://localhost:3000`).
2.  Click on the map to define the center of the area you're interested in. A marker and a blue circle (representing the radius) will appear.
3.  Use the controls to adjust the `Default Area Radius` and the `Search Proximity` if desired.
4.  Click the "Find Cheaper Nearby Houses" button.
5.  The application will contact the backend.
6.  The backend calculates the benchmark price and finds cheaper houses nearby.
7.  The map will update to show green markers for the cheaper houses found outside the blue circle.
8.  Information about the benchmark price and the number of results found will be displayed.

## Potential Improvements / Future Work

*   **Real Data Integration:** Connect to a real estate API (if feasible/affordable) or explore other data sources. Implement data fetching, cleaning, geocoding, and regular updates.
*   **More Filters:** Add frontend controls and backend logic for more filters (bedrooms, bathrooms, property type, square footage, price range).
*   **Area Selection:** Allow users to draw polygons or rectangles on the map instead of just defining a circle.
*   **Improved UI/UX:** Add loading indicators, better error messages, map pop-up details, result sorting/pagination.
*   **Testing:** Implement unit tests (Jest, React Testing Library) and integration tests.
*   **Deployment:** Add scripts and instructions for deploying the frontend and backend (e.g., using Netlify/Vercel for frontend, Heroku/AWS/DigitalOcean for backend).
*   **Authentication:** Add user accounts to save searches or favorite properties.

## License

[MIT](./LICENSE) (or choose another license if preferred)
Use code with caution.
Before Committing:

Make sure you have a .gitignore file in your root directory (MVP/) that includes at least node_modules/, .env, and potentially build folders.

Replace placeholder text like <your-repository-url> and YOUR_PRODUCTION_FRONTEND_URL.

Consider adding a LICENSE file if you choose a license like MIT.