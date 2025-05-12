import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself

// Fix for default marker icon issue with bundlers like Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- Internal Component to Handle Map Clicks ---
function LocationClickHandler({ setCenter }) {
    useMapEvents({
        click(e) {
            console.log("Map clicked at:", e.latlng);
            setCenter(e.latlng); // Update center state in App.js via the prop
            // Optional: Move map view smoothly - uncomment if map doesn't auto-pan
            // map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null; // This component doesn't render anything itself
}

// --- Main Map Component ---
function MapComponent({
    initialCenter, // Initial map view center { lat, lng }
    initialZoom,   // Initial zoom level
    defaultAreaCenter, // The actual selected center { lat, lng } or null
    setDefaultAreaCenter, // Function to set the center in App.js state
    defaultAreaRadius, // Radius in meters
    cheaperNearbyHouses = [], // Array of house result objects
}) {

    const defaultAreaOptions = { color: 'blue', fillColor: '#3498db', fillOpacity: 0.1, weight: 1 };
    // Custom icon example (optional)
    // const resultIcon = new L.Icon({
    //     iconUrl: '/path/to/your/custom-marker.png',
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //     shadowUrl: '/path/to/your/marker-shadow.png',
    //     shadowSize: [41, 41]
    // });

    return (
        <MapContainer
            center={initialCenter}
            zoom={initialZoom}
            scrollWheelZoom={true} // Enable zooming with scroll wheel
            className="leaflet-container" // Use class for styling if needed
        >
            {/* Base Map Tiles */}
            <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Component to handle map clicks and update center state */}
            <LocationClickHandler setCenter={setDefaultAreaCenter} />

            {/* Marker for the selected default area center */}
            {defaultAreaCenter && (
                 <Marker position={defaultAreaCenter}>
                    <Popup>Selected Default Area Center</Popup>
                </Marker>
            )}


            {/* Display the selected default area circle */}
            {defaultAreaCenter && defaultAreaRadius > 0 && (
                <Circle
                    center={defaultAreaCenter}
                    radius={defaultAreaRadius}
                    pathOptions={defaultAreaOptions}
                />
            )}

            {/* Display markers for the cheaper nearby houses */}
            {cheaperNearbyHouses.map((house) => (
                <Marker
                    key={house._id} // Use a unique ID from your data (_id from MongoDB)
                    position={[house.location.coordinates[1], house.location.coordinates[0]]} // Lat, Lng order for Leaflet
                    // icon={resultIcon} // Optional: Use a custom icon
                >
                    <Popup>
                        <b>Price:</b> ${house.price?.toLocaleString() ?? 'N/A'} <br />
                        <b>Address:</b> {house.address ?? 'N/A'} <br/>
                        {house.bedrooms && <><b>Beds:</b> {house.bedrooms} </>}
                        {house.bathrooms && <><b>Baths:</b> {house.bathrooms}</>}
                        {house.listingUrl && <><br/><a href={house.listingUrl} target="_blank" rel="noopener noreferrer">View Listing</a></>}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default MapComponent;
