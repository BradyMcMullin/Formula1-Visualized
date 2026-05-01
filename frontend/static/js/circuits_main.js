// Import the new createWorldMap function alongside the others
import { createPaginatedChart, createBubbleChart, createWorldMap } from './circuits_charts.js';

document.addEventListener("DOMContentLoaded", async () => {

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error(`Error loading data from ${url}:`, error);
            return null;
        }
    }

    // 0. NEW: World Map of Circuits (Rendered first)
    const mapData = await fetchData('/api/circuits/locations');
    if (mapData) {
        createWorldMap({
            containerSelector: '#worldMapChart',
            data: mapData,
            title: "Global Footprint of Formula 1",
            subtitle: "Locations of all circuits in F1 history"
        });
    }

    // 2. Number of Races by Circuit
    const racesData = await fetchData('/api/circuits/races');
    if (racesData) {
        createPaginatedChart({
            containerSelector: '#racesChart',
            data: racesData,
            title: "Total Races Hosted by Circuit",
            xAxisLabel: "Total Races",
            prevBtnId: 'prevRacesBtn',
            nextBtnId: 'nextRacesBtn',
            pageInfoId: 'racesPageInfo',
            color: '#1f77b4',
            xKey: 'total_races',
            yKey: 'circuit_name'
        });
    }

    // 1. Total Retirements by Circuit
    const retirementsData = await fetchData('/api/circuits/retirements');
    if (retirementsData) {
        createPaginatedChart({
            containerSelector: '#retirementsChart',
            data: retirementsData,
            title: "Most Dangerous Tracks: Total Retirements",
            subtitle: "Total times a driver scored an 'R' (Retirement) at the circuit",
            xAxisLabel: "Total Retirements",
            prevBtnId: 'prevRetBtn',
            nextBtnId: 'nextRetBtn',
            pageInfoId: 'retPageInfo',
            color: '#d62728',
            xKey: 'total_retirements',
            yKey: 'circuit_name'
        });
    }

    // 3. Countries by Circuits Hosted
    const countriesData = await fetchData('/api/circuits/countries');
    if (countriesData) {
        createPaginatedChart({
            containerSelector: '#countriesChart',
            data: countriesData,
            title: "Countries with the Most Unique Circuits",
            xAxisLabel: "Unique Circuits Hosted",
            prevBtnId: 'prevCtryBtn',
            nextBtnId: 'nextCtryBtn',
            pageInfoId: 'ctryPageInfo',
            color: '#2ca02c',
            xKey: 'circuits_hosted',
            yKey: 'country'
        });
    }

    // 4. Highest Average Finishing Position by Circuit
    const driverCircuitData = await fetchData('/api/circuits/highest-average-finish');
    if (driverCircuitData) {
        const formattedData = driverCircuitData.map(d => ({
            combo_label: `${d.driver} at ${d.circuit}`,
            avg_finish: d.avg_finish
        }));

        createPaginatedChart({
            containerSelector: '#driverCircuitChart',
            data: formattedData,
            title: "Track Specialists: Best Average Finishes",
            subtitle: "Minimum 10 starts required. Lower average position is better.",
            xAxisLabel: "Average Finishing Position",
            prevBtnId: 'prevDcBtn',
            nextBtnId: 'nextDcBtn',
            pageInfoId: 'dcPageInfo',
            color: '#9467bd',
            xKey: 'avg_finish',
            yKey: 'combo_label'
        });
    }

    // 5. Competitiveness Over Time (Scatter/Bubble Chart)
    const competitivenessData = await fetchData('/api/circuits/competitiveness');
    if (competitivenessData) {
        createBubbleChart({
            containerSelector: '#competitivenessChart',
            data: competitivenessData,
            title: "Circuit Competitiveness Over Decades",
            subtitle: "X = Decade, Y = Avg Positions Gained, Bubble Size = Winner Diversity Ratio"
        });
    }

});