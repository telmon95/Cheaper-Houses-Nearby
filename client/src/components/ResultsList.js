import React from 'react';

function ResultsList({ houses }) {
    if (!houses || houses.length === 0) {
        // Don't show the heading if there are no results
        return null;
        // Or return <p>No cheaper houses found nearby matching your criteria.</p>;
    }

    return (
        <div className="results-list">
            <h3>Cheaper Nearby Houses Found:</h3>
            <ul>
                {houses.map(house => (
                    <li key={house._id}>
                        <strong>${house.price?.toLocaleString() ?? 'N/A'}</strong>
                         - {house.address ?? 'No Address'}
                         {(house.bedrooms || house.bathrooms) && ' ('}
                         {house.bedrooms && `${house.bedrooms} bed`}
                         {house.bedrooms && house.bathrooms && ', '}
                         {house.bathrooms && `${house.bathrooms} bath`}
                         {(house.bedrooms || house.bathrooms) && ')'}
                        {house.listingUrl && (
                            <a href={house.listingUrl} target="_blank" rel="noopener noreferrer">
                                View Listing
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ResultsList;
