// Initialize Leaflet map
var map = L.map('map').setView([0, 0], 2);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

//cordiiante view

var coordinates = document.getElementById('coordinates');
map.on('mousemove', function (e) {
    coordinates.innerHTML = 'Latitude: ' + e.latlng.lat.toFixed(5) + '<br>Longitude: ' + e.latlng.lng.toFixed(5);
});

// Fetch data from GeoServer
fetch('http://localhost:8080/geoserver/wfs?service=wfs&version=1.0.0&request=GetFeature&typeNames=topp:states&outputFormat=application/json')
  .then(response => response.json())
  .then(data => {
    // Define a style function for the polygon layer
    function style(feature) {
      return {
        fillColor: 'green', // Change to the desired fill color
        weight: 2, // Border thickness
        opacity: 1, // Border opacity
        color: 'white', // Border color
        fillOpacity: 0.5 // Fill opacity
      };
    }

    // Create a Leaflet GeoJSON layer with the defined style function
    var geojsonLayer = L.geoJSON(data, {
      style: style // Apply the style function
    });

    // Add the GeoJSON layer to the map
    geojsonLayer.addTo(map);

    // Create layer list
    var layerList = document.getElementById('layer-list');

    // Create checkbox for the layer
    var layerCheckbox = document.createElement('input');
    layerCheckbox.type = 'checkbox';
    layerCheckbox.id = 'layer-checkbox';
    layerCheckbox.checked = true; // Default checked
    layerCheckbox.addEventListener('change', function() {
      if (this.checked) {
        map.addLayer(geojsonLayer);
      } else {
        map.removeLayer(geojsonLayer);
      }
    });

    // Create label for the checkbox
    var layerLabel = document.createElement('label');
    layerLabel.textContent = 'Layer Name'; // Specify the layer name
    layerLabel.htmlFor = 'layer-checkbox';

    // Append checkbox and label to the layer list
    layerList.appendChild(layerCheckbox);
    layerList.appendChild(layerLabel);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
