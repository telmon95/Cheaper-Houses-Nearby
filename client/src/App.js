import React, { useState, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import SearchControls from './components/SearchControls';
import ResultsList from './components/ResultsList'; // Optional list view
import { findCheaperNearbyHouses } from './services/api';
import './index.css'; // Ensure styles are imported

function App() {
    // --- State ---
    // Map View State (Set your desired initial view)
    const [mapInitialCenter] = useState({ lat: 34.0522, lng: -118.2437 }); // Example: Los Angeles
    const [mapInitialZoom] = useState(10);

    // Search Parameters State
    const [defaultAreaCenter, setDefaultAreaCenter] = useState(null); // { lat, lng } - Center selected by user click
    const [defaultAreaRadius, setDefaultAreaRadius] = useState(1500); // meters - Default radius
    const [searchProximity, setSearchProximity] = useState(5000); // meters - Default search proximity
    const [filters, setFilters] = useState({}); // For future filters { minPrice, maxPrice, minBeds... }

    // Results State
    const [results, setResults] = useState([]); // Array of cheaper nearby house objects
    const [benchmarkPrice, setBenchmarkPrice] = useState(null); // Median price from API
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); // Error message string

    // --- Handlers ---
    const handleSearch = useCallback(async () => {
        if (!defaultAreaCenter) {
            setError('Please click on the map to select a center point first.');
            return;
        }
        if (defaultAreaRadius <= 0 || searchProximity <= 0) {
            setError('Radius and Proximity must be greater than zero.');
            return;
        }

        setIsLoading(true);
        setError(''); // Clear previous errors
        setResults([]); // Clear previous results
        setBenchmarkPrice(null); // Clear previous benchmark

        const searchParams = {
            defaultArea: {
                type: 'Circle', // Using Circle type as defined in backend/frontend
                center: { // Ensure lat/lng structure matches backend expectation
                    lat: defaultAreaCenter.lat,
                    lng: defaultAreaCenter.lng,
                },
                radius: defaultAreaRadius,
            },
            searchProximity: searchProximity,
            filters: filters, // Pass any additional filters collected from UI
        };

        try {
            const data = await findCheaperNearbyHouses(searchParams);
            console.log("API Response Data:", data);

            // Update state based on successful API response
            setBenchmarkPrice(data.benchmarkPrice); // Will be null if none calculated
            setResults(data.cheaperNearbyHouses || []); // Ensure it's an array

            // Clear error on success
            setError('');

        } catch (err) {
             console.error("Search failed:", err);
             // Set error message from the caught error (thrown by api.js)
             setError(err.message || 'An unknown error occurred during the search.');
             // Clear results on error
             setResults([]);
             setBenchmarkPrice(null);
        } finally {
            // Ensure loading is set to false regardless of success or failure
            setIsLoading(false);
        }
    }, [defaultAreaCenter, defaultAreaRadius, searchProximity, filters]); // Dependencies for useCallback


    // --- Render ---
    return (
        <div className="app-container">
            <h1>Find Cheaper Houses Nearby</h1>

            <SearchControls
                radius={defaultAreaRadius}
                setRadius={setDefaultAreaRadius}
                proximity={searchProximity}
                setProximity={setSearchProximity}
                handleSearch={handleSearch}
                isLoading={isLoading}
                benchmarkPrice={benchmarkPrice}
                resultsCount={results.length}
                areaSelected={!!defaultAreaCenter} // Pass true if center is not null
                error={error}
                // Pass filter state and setters here if you add filters:
                // filters={filters}
                // setFilters={setFilters}
            />

            <MapComponent
                initialCenter={mapInitialCenter}
                initialZoom={mapInitialZoom}
                defaultAreaCenter={defaultAreaCenter}
                setDefaultAreaCenter={setDefaultAreaCenter} // Pass the setter function
                defaultAreaRadius={defaultAreaRadius}
                cheaperNearbyHouses={results}
            />

            {/* Optional: Display results in a list below the map */}
            {!isLoading && !error && (results.length > 0 || benchmarkPrice !== null) &&
                <ResultsList houses={results} />
            }
            {/* Display message if no results and no error */}
             {!isLoading && !error && results.length === 0 && benchmarkPrice === null && defaultAreaCenter &&
                <p style={{textAlign: 'center', marginTop: '10px'}}>No results found for the selected area and criteria.</p>
            }

        </div>
    );
}

export default App;
