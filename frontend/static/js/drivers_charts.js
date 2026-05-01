// Renders the two static summary boxes
export function renderSummaryBoxes(data, containerId) {
    const container = document.getElementById(containerId);
    if (!data || data.length === 0) return;

    // Assuming data is an object or a single-row array with two key-value pairs
    const row = Array.isArray(data) ? data[0] : data;
    const keys = Object.keys(row);

    container.innerHTML = `
        <div class="summary-box">
            <div class="summary-title">${keys[0].replace(/_/g, ' ')}</div>
            <div class="summary-value">${row[keys[0]]}</div>
        </div>
        <div class="summary-box">
            <div class="summary-title">${keys[1].replace(/_/g, ' ')}</div>
            <div class="summary-value">${row[keys[1]]}</div>
        </div>
    `;
}

// Reusable Paginated Horizontal Bar Chart
// Reusable Paginated Horizontal Bar Chart
export function createPaginatedChart(config) {
    const {
        containerSelector, data, title, subtitle, xAxisLabel,
        prevBtnId, nextBtnId, pageInfoId, color = "steelblue",
        xKey, yKey // <-- NEW: Explicitly accept the column names
    } = config;

    const margin = {top: 60, right: 60, bottom: 60, left: 160};
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Title & Subtitle
    svg.append("text").attr("x", width / 2).attr("y", -30).attr("text-anchor", "middle").style("font-size", "18px").text(title);
    if (subtitle) {
        svg.append("text").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "#666").text(subtitle);
    }

    // Static X Axis based on full dataset max
    const maxVal = d3.max(data, d => Number(d[xKey]));
    const x = d3.scaleLinear()
      .domain([0, maxVal * 1.1]) // 10% padding
      .range([0, width]);
      
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
      
    svg.append("text").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text(xAxisLabel);

    // Y Axis Setup
    const y = d3.scaleBand().range([0, height]).padding(0.2);
    const yAxisGroup = svg.append("g");

    // Pagination Setup
    let currentIndex = 0;
    const itemsPerPage = 10;
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const pageInfo = document.getElementById(pageInfoId);

    function updateChart() {
        const currentData = data.slice(currentIndex, currentIndex + itemsPerPage);

        // Update Y Scale
        y.domain(currentData.map(d => d[yKey]));
        yAxisGroup.transition().duration(500).call(d3.axisLeft(y));

        // Join Bars
        const bars = svg.selectAll(".bar").data(currentData, d => d[yKey]);

        // Enter + Update Bars
        bars.enter()
          .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d[yKey]))
            .attr("width", 0)
            .attr("height", y.bandwidth())
            .attr("fill", color)
          .merge(bars)
          .transition().duration(500)
            .attr("y", d => y(d[yKey]))
            .attr("width", d => x(Number(d[xKey]))) // Ensure it's treated as a number
            .attr("height", y.bandwidth());

        // Exit Bars
        bars.exit().transition().duration(500).attr("width", 0).remove();

        // Data Labels
        const labels = svg.selectAll(".label").data(currentData, d => d[yKey]);
        
        labels.enter()
          .append("text")
            .attr("class", "label")
            .attr("y", d => y(d[yKey]) + y.bandwidth() / 2)
            .attr("x", 0)
            .attr("dy", ".35em")
            .attr("dx", 5)
            .style("fill", "#333")
            .style("font-size", "12px")
          .merge(labels)
          .transition().duration(500)
            .attr("y", d => y(d[yKey]) + y.bandwidth() / 2)
            .attr("x", d => x(Number(d[xKey])))
            .text(d => {
                let val = Number(d[xKey]);
                return Number.isInteger(val) ? val : val.toFixed(2);
            });

        labels.exit().remove();

        // Update Buttons & Text
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex + itemsPerPage >= data.length;
        const currentEnd = Math.min(currentIndex + itemsPerPage, data.length);
        pageInfo.innerText = `Showing ${currentIndex + 1} - ${currentEnd} of ${data.length}`;
    }

    // Listeners
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex -= itemsPerPage;
            updateChart();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex + itemsPerPage < data.length) {
            currentIndex += itemsPerPage;
            updateChart();
        }
    });

    updateChart(); // Initial Render
}