import { createPaginatedChart } from './seasons_charts.js';

document.addEventListener("DOMContentLoaded", async () => {
    
    // Helper to fetch JSON safely
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error(`Error loading data from ${url}:`, error);
            return null;
        }
    }

    // 1. Most Unique Winners by Year
    const winnersData = await fetchData('/api/seasons/most-winners');
    if (winnersData) {
        createPaginatedChart({
            containerSelector: '#winnersChart',
            data: winnersData,
            title: "Most Unpredictable Seasons",
            subtitle: "Seasons ranked by the highest number of unique race winners",
            xAxisLabel: "Unique Winners",
            prevBtnId: 'prevWinBtn',
            nextBtnId: 'nextWinBtn',
            pageInfoId: 'winPageInfo',
            color: '#1f77b4',
            xKey: 'unique_winners',
            yKey: 'year' 
        });
    }

   // 2. Constructor Points Scored by Country
    const pointsData = await fetchData('/api/seasons/constructor-points');
    if (pointsData) {
        // Format the data to combine Team Name and Host Country
        const formattedPointsData = pointsData.map(d => ({
            combo_label: `${d.constructor_name} in ${d.host_country}`, // Updated key
            total_points: d.total_points
        }));

        createPaginatedChart({
            containerSelector: '#pointsChart',
            data: formattedPointsData,
            title: "Most Dominant Teams by Host Country",
            subtitle: "Total points scored by specific constructors at race locations",
            xAxisLabel: "Total Points",
            prevBtnId: 'prevPtsBtn',
            nextBtnId: 'nextPtsBtn',
            pageInfoId: 'ptsPageInfo',
            color: '#ff7f0e',
            xKey: 'total_points',
            yKey: 'combo_label'
        });
    }

});