document.addEventListener('DOMContentLoaded', function () {
    // Define projections
proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs");

    var map = L.map('map').setView([28.078768, 77.606317], 15);



    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    var layerListDiv = document.getElementById('layer-list');
    var resultList = document.getElementById('result-list');
    // function clearLayerList() {
    //    resultList.innerHTML = ''; // Clear layer list
    // }
    // clearLayerList();
    // Define layer data with GeoJSON URLs and layer names
    var layerData = {
        'Layer 1': {
            url: 'http://localhost:8080/geoserver/wfs?service=wfs&version=1.0.0&request=GetFeature&typeNames=postgis:khasra_123&outputFormat=application/json',
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
    var highlightedFeature = null;
    // Function to fetch GeoJSON data and add layer to the map
    function addLayerToMap(layerName, layerUrl) {
        fetch(layerUrl)
            .then(response => response.json())
            .then(data => {
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
                            //     geojsonLayer.resetStyle();
                            // // Highlight clicked feature
                            // e.target.setStyle({
                            //     fillColor: 'yellow', // Change to desired highlight color
                            //     weight: 3
                            // });
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

                            
                                // Add information to the result list
                                var listItem = document.createElement('li');
                                listItem.textContent = "Khasra No: " + feature.properties.khasra_no;
                                layerListDiv.innerHTML = '';
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
