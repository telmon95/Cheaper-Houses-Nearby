const House = require('../models/House');

// @desc    Find cheaper houses nearby a default area
// @route   POST /api/houses/find-cheaper-nearby
// @access  Public
exports.findCheaperNearby = async (req, res) => {
    try {
        const { defaultArea, searchProximity, filters = {} } = req.body;

        // --- Basic Validation ---
        if (!defaultArea || !defaultArea.center || typeof defaultArea.center.lat !== 'number' || typeof defaultArea.center.lng !== 'number' || typeof defaultArea.radius !== 'number' || typeof searchProximity !== 'number') {
            return res.status(400).json({ success: false, message: 'Missing or invalid required parameters: defaultArea (center {lat, lng}, radius), searchProximity' });
        }
        if (defaultArea.type !== 'Circle') {
             return res.status(400).json({ success: false, message: 'Only Circle defaultArea type supported in this example' });
        }
        if (defaultArea.radius <= 0 || searchProximity <= 0) {
             return res.status(400).json({ success: false, message: 'Radius and proximity must be positive numbers' });
        }

        const centerCoords = [defaultArea.center.lng, defaultArea.center.lat]; // [lng, lat]
        const defaultRadiusMeters = defaultArea.radius;
        const searchRadiusMeters = defaultRadiusMeters + searchProximity;

        // --- 1. Find houses INSIDE the default area & Calculate Benchmark ---
        const defaultAreaGeometry = {
            $geometry: {
                type: "Point",
                coordinates: centerCoords
            },
            $maxDistance: defaultRadiusMeters // Distance in meters
        };

        // Add filters if provided (simple example for filtering WITHIN the area)
        const queryFiltersInArea = {};
        // Example: if (filters.propertyType) queryFiltersInArea.propertyType = filters.propertyType;
        // Example: if (filters.minBedsInArea) queryFiltersInArea.bedrooms = { $gte: filters.minBedsInArea };

        const housesInArea = await House.find({
            location: { $nearSphere: defaultAreaGeometry },
            ...queryFiltersInArea // Apply optional filters for benchmark calculation
        }).lean(); // .lean() returns plain JS objects, faster for read-only

        if (housesInArea.length === 0) {
            return res.status(200).json({ // Use 200 OK but indicate no benchmark possible
                success: true,
                message: 'No houses found in the selected default area to calculate benchmark.',
                benchmarkPrice: null,
                housesInAreaCount: 0,
                cheaperNearbyHouses: [],
            });
        }

        // Calculate Median Benchmark Price
        const pricesInArea = housesInArea.map(h => h.price);
        const benchmarkPrice = House.calculateMedianPrice(pricesInArea); // Using static method

        // --- 2. Define the SEARCH area (around the default area) ---
        const searchAreaGeometry = {
            $geometry: {
                type: "Point",
                coordinates: centerCoords
            },
            // Houses within the larger radius (searchProximity + defaultRadius)
            $maxDistance: searchRadiusMeters
        };

        // --- 3. Find houses NEARBY (in search area BUT NOT in default area) ---
        // Define filters for the nearby search (can be different from benchmark filters)
        const queryFiltersNearby = {};
        if (filters.minPrice) queryFiltersNearby.price = { ...queryFiltersNearby.price, $gte: filters.minPrice };
        // Max price filter is applied AFTER benchmark comparison below
        if (filters.minBeds) queryFiltersNearby.bedrooms = { $gte: filters.minBeds };
        if (filters.minBaths) queryFiltersNearby.bathrooms = { $gte: filters.minBaths };
        if (filters.propertyType) queryFiltersNearby.propertyType = filters.propertyType;
        // Add other non-price filters similarly

        const nearbyHouses = await House.find({
            location: {
                $nearSphere: searchAreaGeometry, // Within the larger search radius
                 $not: { // But NOT within the smaller default radius using $geoWithin for accuracy
                    $geoWithin: {
                         $centerSphere: [ centerCoords, defaultRadiusMeters / 6378100 ] // Requires radius in radians (meters / Earth's radius in meters approx)
                    }
                 }
            },
             ...queryFiltersNearby // Apply non-price filters here
        }).lean();


        // --- 4. Filter nearby houses by the benchmark price ---
        const cheaperNearbyHouses = nearbyHouses.filter(house => house.price < benchmarkPrice);

        // Optionally apply maxPrice filter from request *after* benchmark filtering
        const finalFilteredHouses = filters.maxPrice
            ? cheaperNearbyHouses.filter(house => house.price <= filters.maxPrice)
            : cheaperNearbyHouses;


        // --- 5. Send Response ---
        res.status(200).json({
            success: true,
            benchmarkPrice,
            housesInAreaCount: housesInArea.length,
            cheaperNearbyHouses: finalFilteredHouses, // Send the final filtered list
        });

    } catch (error) {
        console.error('Error finding cheaper houses:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
