
document.addEventListener('DOMContentLoaded', function () {
    // Define projections
    proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs");

    // Define Leaflet map
    //var map = L.map('map').setView([0, 0], 2);
    var map = L.map('map', {
        crs: L.CRS.EPSG3857 // Leaflet's default CRS
    });
    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Define layer list div
    var layerListDiv = document.getElementById('layer-list');
    var resultList = document.getElementById('result-list');

    // Define layer data with GeoJSON URLs and layer names
    var layerData = {
        'Layer 1': {
            url: 'http://localhost:8080/geoserver/wfs?service=wfs&version=1.0.0&request=GetFeature&typeNames=postgis:khasra_12&outputFormat=application/json',
        }
        // Add more layers as needed
    };

    // Function to toggle layer visibility
    function toggleLayerVisibility(geojsonLayer) {
        if (map.hasLayer(geojsonLayer)) {
            map.removeLayer(geojsonLayer);
        } else {
            map.addLayer(geojsonLayer);
        }
    }

    // Function to fetch GeoJSON data and add layer to the map
    function addLayerToMap(layerName, layerUrl) {
        fetch(layerUrl)
            .then(response => response.json())
            .then(data => {
                // Reproject GeoJSON data from EPSG:32643 to EPSG:3857
                data = reprojectGeoJSON(data);

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
                        layer.on({
                            click: function (e) {
                                // Add information to the result list
                                var listItem = document.createElement('li');
                                listItem.textContent = "State Name: " + feature.properties.code;
                                resultList.appendChild(listItem);

                                // Zoom to layer
                                map.fitBounds(layer.getBounds());
                            },
                            mouseover: function (e) {
                                layer.bindTooltip(feature.properties.code).openTooltip();
                            }
                        });
                    }
                });

                // Add GeoJSON layer to the map
                geojsonLayer.addTo(map);

                // Create checkbox for the layer
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = layerName;
                checkbox.checked = true; // Default checked
                checkbox.addEventListener('change', function () {
                    toggleLayerVisibility(geojsonLayer);
                });

                // Create label for the checkbox
                var label = document.createElement('label');
                label.textContent = layerName;
                label.htmlFor = layerName;

                // Append checkbox and label to the layer list
                layerListDiv.appendChild(checkbox);
                layerListDiv.appendChild(label);
                layerListDiv.appendChild(document.createElement('br'));
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    // Function to reproject GeoJSON data from EPSG:32643 to EPSG:3857
    function reprojectGeoJSON(data) {
        for (var i = 0; i < data.features.length; i++) {
            var feature = data.features[i];
            var coordinates = feature.geometry.coordinates;
            for (var j = 0; j < coordinates.length; j++) {
                if (!Array.isArray(coordinates[j]) || coordinates[j].some(coord => !isFinite(coord))) {
                    console.warn('Invalid coordinates found in feature:', feature);
                    console.warn('Invalid coordinates:', coordinates[j]);
                    continue; // Skip invalid coordinates
                }
                var xy = proj4('EPSG:32643', 'EPSG:3857', coordinates[j]);
                coordinates[j] = [xy[0], xy[1]];
            }
        }
        return data;
    }

    // Add layers to the map
    for (var layerName in layerData) {
        if (layerData.hasOwnProperty(layerName)) {
            var layer = layerData[layerName];
            addLayerToMap(layerName, layer.url);
        }
    }

    // Function to determine color based on state_name
    function getColor(code) {
        // Define color mapping based on state_name
        var colorMap = {
            'L': 'green',
            'T': 'red',
            'L': 'blue'
            // Add more state_name - color mappings as needed
        };

        // Return the color based on the state_name value, or a default color if not found
        return colorMap[code] || 'gray'; // Default color if state_name doesn't match any mapping
    }
});

