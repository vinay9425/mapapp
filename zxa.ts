<!DOCTYPE html>
<html>
<head>
    <title>GeoServer WFS Data to Chart.js with Time Scale</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <canvas id="myChart" width="1000" height="500"></canvas>

    <script>
        // Make AJAX request to GeoServer's WFS endpoint
        var url = 'http://localhost:8080/geoserver/wfs?service=wfs&version=1.0.0&request=GetFeature&typeNames=postgis:chart_data&outputFormat=application/json';
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Parse response and extract data for chart
                var chartData = {
                    labels: [],
                    datasets: [
                        { label: 'Y', data: [], borderColor: 'red', fill: false },
                        { label: 'Z', data: [], borderColor: 'blue', fill: false },
                        { label: 'N', data: [], borderColor: 'green', fill: false }
                    ]
                };

                data.features.forEach(feature => {
                    chartData.labels.push(feature.properties.p);
                    chartData.datasets[0].data.push(parseFloat(feature.properties.y)); // Convert to float
                    chartData.datasets[1].data.push(parseFloat(feature.properties.z)); // Convert to float
                    chartData.datasets[2].data.push(parseFloat(feature.properties.n)); // Convert to float
                });

                // Render chart using Chart.js
                var ctx = document.getElementById('myChart').getContext('2d');
                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: chartData,
                    options: {
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'P'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Value'
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    </script>
</body>
</html>
