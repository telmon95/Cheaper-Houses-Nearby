import React from 'react';

function SearchControls({
    radius,
    setRadius,
    proximity,
    setProximity,
    handleSearch,
    isLoading,
    benchmarkPrice,
    resultsCount,
    areaSelected, // Pass boolean indicating if center is selected
    error
}) {
    return (
        <div className="controls">
            <p>
                {areaSelected
                 ? "Adjust search parameters below and click search."
                 : "Click on the map to select the center of your default area."
                }
            </p>
            <div>
                <label htmlFor="radius">
                    <span>Default Area Radius (meters):</span>
                    <input
                        id="radius"
                        type="number"
                        value={radius}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setRadius(isNaN(val) || val < 0 ? 0 : val); // Prevent negative/NaN
                        }}
                        min="100" // Set reasonable min
                        step="100"
                    />
                </label>
            </div>
             <div>
                 <label htmlFor="proximity">
                    <span>Search Proximity Around Area (meters):</span>
                    <input
                        id="proximity"
                        type="number"
                        value={proximity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setProximity(isNaN(val) || val < 0 ? 0 : val); // Prevent negative/NaN
                        }}
                        min="500"
                        step="100"
                    />
                </label>
            </div>
             {/* --- Placeholder for More Filters --- */}
             {/*
             <div className="filter-group">
                 <h4>Filters:</h4>
                 <label>Min Price: <input type="number" name="minPrice" /></label>
                 <label>Max Price: <input type="number" name="maxPrice" /></label>
                 <label>Min Beds: <input type="number" name="minBeds" min="0" step="1" /></label>
             </div>
             */}
            <button onClick={handleSearch} disabled={isLoading || !areaSelected}>
                {isLoading ? 'Searching...' : 'Find Cheaper Nearby Houses'}
            </button>

            {error && <p className="error-message">Error: {error}</p>}

            {!isLoading && benchmarkPrice !== null && benchmarkPrice !== undefined && (
                <div className="results-info">
                   Calculated Benchmark Median Price in Area: <strong>${benchmarkPrice.toLocaleString()}</strong> <br/>
                   Found <strong>{resultsCount ?? 0}</strong> cheaper house(s) nearby matching criteria.
                </div>
            )}
             {!isLoading && benchmarkPrice === null && resultsCount === 0 && !error && (
                 <div className="results-info">
                     No benchmark could be calculated (no houses found in the default area), or no cheaper houses found nearby.
                 </div>
            )}
        </div>
    );
}

export default SearchControls;
