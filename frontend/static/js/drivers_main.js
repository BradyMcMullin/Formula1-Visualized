import { renderSummaryBoxes, createPaginatedChart } from './drivers_charts.js';

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

    // 7. Dataset Summary Boxes (Uses dynamic keys, no update needed here)
    const summaryData = await fetchData('/api/drivers/dataset-summary');
    if (summaryData) renderSummaryBoxes(summaryData, 'summaryContainer');

    // 4. Nationality
    const nationalityData = await fetchData('/api/drivers/nationality');
    if (nationalityData) {
        createPaginatedChart({
            containerSelector: '#nationalityChart',
            data: nationalityData,
            title: "Drivers by Nationality",
            xAxisLabel: "Number of Drivers",
            prevBtnId: 'prevNatBtn',
            nextBtnId: 'nextNatBtn',
            pageInfoId: 'natPageInfo',
            color: '#1f77b4',
            xKey: 'total_drivers',
            yKey: 'nationality'
        });
    }

    // 6. Career Length
    const careerData = await fetchData('/api/drivers/career-length');
    if (careerData) {
        createPaginatedChart({
            containerSelector: '#careerLengthChart',
            data: careerData,
            title: "Longest Careers in F1",
            subtitle: "Measured by years between first and last race",
            xAxisLabel: "Years Active",
            prevBtnId: 'prevCarBtn',
            nextBtnId: 'nextCarBtn',
            pageInfoId: 'carPageInfo',
            color: '#2ca02c',
            xKey: 'career_length_years',
            yKey: 'driver_name'
        });
    }

    // 5. Most Experienced
    const experienceData = await fetchData('/api/drivers/most-experienced');
    if (experienceData) {
        createPaginatedChart({
            containerSelector: '#experiencedChart',
            data: experienceData,
            title: "Most Experienced Drivers",
            xAxisLabel: "Total Races Entered",
            prevBtnId: 'prevExpBtn',
            nextBtnId: 'nextExpBtn',
            pageInfoId: 'expPageInfo',
            color: '#9467bd',
            xKey: 'total_races_entered',
            yKey: 'driver_name'
        });
    }

    // 3. Best Overtakers
    const overtakerData = await fetchData('/api/drivers/best-overtakers');
    if (overtakerData) {
        createPaginatedChart({
            containerSelector: '#overtakersChart',
            data: overtakerData,
            title: "Best Overtakers",
            subtitle: "Average positions gained per race",
            xAxisLabel: "Positions Gained",
            prevBtnId: 'prevOveBtn',
            nextBtnId: 'nextOveBtn',
            pageInfoId: 'ovePageInfo',
            color: '#ff7f0e',
            xKey: 'avg_positions_gained_per_race',
            yKey: 'driver_name'
        });
    }

    // 2. Win Percentage
    const winPctData = await fetchData('/api/drivers/win-percentage');
    if (winPctData) {
        createPaginatedChart({
            containerSelector: '#winPctChart',
            data: winPctData,
            title: "Highest Win Percentage",
            subtitle: "Total Wins / Total Races",
            xAxisLabel: "Win Rate (%)",
            prevBtnId: 'prevPctBtn',
            nextBtnId: 'nextPctBtn',
            pageInfoId: 'pctPageInfo',
            color: '#d62728',
            xKey: 'win_percentage',
            yKey: 'driver_name'
        });
    }

    // 1. Most Wins
    const winsData = await fetchData('/api/drivers/most-wins');
    if (winsData) {
        createPaginatedChart({
            containerSelector: '#mostWinsChart',
            data: winsData,
            title: "Most Wins in F1 History",
            xAxisLabel: "Total Wins",
            prevBtnId: 'prevWinBtn',
            nextBtnId: 'nextWinBtn',
            pageInfoId: 'winPageInfo',
            color: '#e377c2',
            xKey: 'total_wins',
            yKey: 'driver_name'
        });
    }

});