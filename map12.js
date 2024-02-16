document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([0, 0], 2);

    var baseMaps = {
        'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }),
        'Google Streets': L.tileLayer('http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 19,
        })
        // Add more base maps as needed
    };

    // Set the default base map
    baseMaps['OpenStreetMap'].addTo(map);

    var layerListDiv = document.getElementById('layer-list');
    var baseMapSelect = document.getElementById('base-map-select');

    // Function to change the base map
    function changeBaseMap() {
        var selectedBaseMap = baseMapSelect.value;
        baseMaps[selectedBaseMap].addTo(map);
    }

    // Event listener for base map selection change
    baseMapSelect.addEventListener('change', function () {
        // Remove existing base maps
        for (var key in baseMaps) {
            if (map.hasLayer(baseMaps[key])) {
                map.removeLayer(baseMaps[key]);
            }
        }
        // Add the selected base map
        changeBaseMap();
    });

    // Define layer data with GeoJSON URLs and layer names
    var layerData = {
        'Layer 1': {
            url: 'http://localhost:8080/geoserver/wfs?service=wfs&version=1.0.0&request=GetFeature&typeNames=topp:states&outputFormat=application/json',
            style: {
                fillColor: 'green',
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.5
            }
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
    function addLayerToMap(layerName, layerUrl, layerStyle) {
        fetch(layerUrl)
            .then(response => response.json())
            .then(data => {
                var geojsonLayer = L.geoJSON(data, {
                    style: layerStyle
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
            addLayerToMap(layerName, layer.url, layer.style);
        }
    }
});
