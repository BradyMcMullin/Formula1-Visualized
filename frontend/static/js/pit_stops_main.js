import { 
    drawPitStopCorrelation, 
    createPitStopsPerYearChart, 
    createAvgPitStopDurationChart, 
    createFastestPitCrewsChart 
} from './pit_stops_charts.js';

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. D3 Chart: Pit Stop Correlation
    try {
        const response = await fetch('/api/pit-stop-correlation');
        const data = await response.json();
        drawPitStopCorrelation(data, "#pit-stop-chart");
    } catch (error) {
        console.error("Error loading pit stop correlation data:", error);
    }

    // 2. D3 Chart: Pit Stops Per Year
    try {
        const response = await fetch('/api/pit-stops-per-year');
        const data = await response.json();
        createPitStopsPerYearChart('#pitStopsYearChart', data);
    } catch (error) {
        console.error("Error loading pit stops per year data:", error);
    }

    // 3. D3 Chart: Avg Pit Stop Duration
    try {
        const response = await fetch('/api/avg-pit-stop-duration');
        const data = await response.json();
        createAvgPitStopDurationChart('#avgDurationChart', data);
    } catch (error) {
        console.error("Error loading avg pit stop duration data:", error);
    }

    // 4. D3 Chart: Fastest Pit Crews (With Pagination)
    try {
        const response = await fetch('/api/fastest-pit-crews');
        const data = await response.json();
        createFastestPitCrewsChart('#fastestCrewsChart', data, 'prevCrewsBtn', 'nextCrewsBtn', 'crewsPageInfo');
    } catch (error) {
        console.error("Error loading fastest pit crews data:", error);
    }
    
});