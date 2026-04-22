// Import the chart drawing function
import { drawPitStopCorrelation } from './pit_stops_charts.js';

// Wait for the HTML to fully load before trying to draw
document.addEventListener("DOMContentLoaded", async () => {
    
    try {
        // 1. Fetch the data from your Flask API route
        const response = await fetch('/api/pit-stop-correlation');
        
        // 2. Parse the JSON response
        const data = await response.json();
        
        // 3. Hand the data off to D3 to draw the chart
        drawPitStopCorrelation(data, "#pit-stop-chart");

    } catch (error) {
        console.error("Error loading pit stop data:", error);
        document.querySelector("#pit-stop-chart").innerHTML = "<p>Error loading chart data.</p>";
    }
    
});