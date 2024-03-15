document.addEventListener('DOMContentLoaded', function () {
    // Define Leaflet map with EPSG:3857 CRS
    var map = L.map('map', {
        crs: L.CRS.EPSG3857 // Leaflet's default CRS (EPSG:3857)
    }).setView([28.6139, 77.209], 12); // Set view to Delhi with zoom level 12

    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Define layer data with GeoJSON URLs and layer names
    var layerData = {
        'Layer 1': {
            url: 'http://localhost:8080/geoserver/wfs?service=wfs&version=1.0.0&request=GetFeature&typeNames=postgis:khasra_12&outputFormat=application/json',
        }
        // Add more layers as needed
    };

    // Variable to store the currently highlighted feature
    var highlightedFeature = null;

    // Function to add GeoJSON layer to the map
    function addLayerToMap(layerName, layerUrl) {
        fetch(layerUrl)
            .then(response => response.json())
            .then(data => {
                // Create GeoJSON layer
                var geojsonLayer = L.geoJSON(data, {
                    style: function (feature) {
                        return {
                            fillColor: getColor(feature.properties.code),
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.5
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        // Add click event listener to each feature
                        layer.on('click', function (e) {
                            // Remove highlight from previously clicked feature
                            if (highlightedFeature) {
                                highlightedFeature.setStyle({
                                    fillColor: getColor(highlightedFeature.feature.properties.code),
                                    weight: 2,
                                    opacity: 1,
                                    color: 'white',
                                    fillOpacity: 0.5
                                });
                            }
                            // Highlight clicked feature
                            e.target.setStyle({
                                fillColor: 'yellow', // Change to desired highlight color
                                weight: 3
                            });
                            // Update highlighted feature
                            highlightedFeature = e.target;
                        });
                    }
                });

                // Add GeoJSON layer to map
                geojsonLayer.addTo(map);

                // Create checkbox for the layer (if needed)
                // Add checkbox and label to layer list (if needed)
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    // Add layers to the map
    for (var layerName in layerData) {
        if (layerData.hasOwnProperty(layerName)) {
            var layer = layerData[layerName];
            addLayerToMap(layerName, layer.url);
        }
    }

    // Function to determine color based on state_name (if needed)
    function getColor(code) {
        // Define color mapping based on state_name
        var colorMap = {
            'L': 'green',
            'T': 'red',
            'L': 'blue'
            // Add more state_name - color mappings as needed
        };
        return colorMap[code] || 'gray'; // Default color if state_name doesn't match any mapping
    }
});
