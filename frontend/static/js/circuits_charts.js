export async function createWorldMap(config) {
    const { containerSelector, data, title, subtitle } = config;

    // Increased margin top, AND increased overall base height from 500 to 600
    const margin = {top: 80, right: 20, bottom: 20, left: 20};
    const width = 850 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom; 

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Titles
    svg.append("text").attr("x", width / 2).attr("y", -40).attr("text-anchor", "middle").style("font-size", "18px").text(title);
    if (subtitle) {
        svg.append("text").attr("x", width / 2).attr("y", -20).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "#666").text(subtitle);
    }

    // THE FIX: explicitly push the Y-translation down by 110 pixels
    const projection = d3.geoMercator()
        .scale(100) 
        .translate([width / 2, (height / 2) + 110]); 

    const path = d3.geoPath().projection(projection);

    const tooltip = d3.select("#mapTooltip");

    // Fetch standard World GeoJSON from an open CDN
    const geoData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .join("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

    // Add F1 Circuits
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
        .attr("cx", d => projection([Number(d.lng), Number(d.lat)])[0])
        .attr("cy", d => projection([Number(d.lng), Number(d.lat)])[1])
        .attr("r", 4)
        .style("fill", "#e10600") // F1 Red
        .style("stroke", "#fff")
        .style("stroke-width", 0.5)
        .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
          d3.select(this).style("stroke", "black").style("opacity", 1).attr("r", 6);
          tooltip.style("opacity", 1)
                 .html(`<strong>${d.circuit_name}</strong><br>${d.location}, ${d.country}`)
                 .style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseleave", function() {
          d3.select(this).style("stroke", "#fff").style("opacity", 0.8).attr("r", 4);
          tooltip.style("opacity", 0);
      });
}

// Reusable Paginated Horizontal Bar Chart
export function createPaginatedChart(config) {
    const {
        containerSelector, data, title, subtitle, xAxisLabel,
        prevBtnId, nextBtnId, pageInfoId, color = "steelblue",
        xKey, yKey
    } = config;

    const margin = {top: 60, right: 60, bottom: 60, left: 200}; // Wider left margin for circuit names
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text").attr("x", width / 2).attr("y", -30).attr("text-anchor", "middle").style("font-size", "18px").text(title);
    if (subtitle) {
        svg.append("text").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "#666").text(subtitle);
    }

    const maxVal = d3.max(data, d => Number(d[xKey]));
    const x = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, width]);
      
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("text").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text(xAxisLabel);

    const y = d3.scaleBand().range([0, height]).padding(0.2);
    const yAxisGroup = svg.append("g");

    let currentIndex = 0;
    const itemsPerPage = 10;
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const pageInfo = document.getElementById(pageInfoId);

    function updateChart() {
        const currentData = data.slice(currentIndex, currentIndex + itemsPerPage);

        y.domain(currentData.map(d => d[yKey]));
        yAxisGroup.transition().duration(500).call(d3.axisLeft(y));

        const bars = svg.selectAll(".bar").data(currentData, d => d[yKey]);

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
            .attr("width", d => x(Number(d[xKey])))
            .attr("height", y.bandwidth());

        bars.exit().transition().duration(500).attr("width", 0).remove();

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

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex + itemsPerPage >= data.length;
        const currentEnd = Math.min(currentIndex + itemsPerPage, data.length);
        pageInfo.innerText = `Showing ${currentIndex + 1} - ${currentEnd} of ${data.length}`;
    }

    prevBtn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex -= itemsPerPage; updateChart(); } });
    nextBtn.addEventListener('click', () => { if (currentIndex + itemsPerPage < data.length) { currentIndex += itemsPerPage; updateChart(); } });

    updateChart();
}

// Custom Bubble Chart for Competitiveness Over Time
// Custom Bubble Chart for Competitiveness Over Time
export function createBubbleChart(config) {
    const { containerSelector, data, title, subtitle } = config;

    const margin = {top: 60, right: 60, bottom: 60, left: 70};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Titles
    svg.append("text").attr("x", width / 2).attr("y", -30).attr("text-anchor", "middle").style("font-size", "18px").text(title);
    svg.append("text").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "#666").text(subtitle);

    // X Axis: Decade
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.decade))
      .range([0, width])
      .nice();
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))); 
    svg.append("text").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text("Decade");

    // Y Axis: Avg Positions Gained (UPDATED TO HANDLE NEGATIVES)
    const yMin = d3.min(data, d => d.avg_positions_gained);
    const yMax = d3.max(data, d => d.avg_positions_gained);

    const y = d3.scaleLinear()
      .domain([yMin < 0 ? yMin * 1.2 : 0, yMax * 1.1]) // Dynamically scales negatives
      .range([height, 0])
      .nice();
      
    svg.append("g").call(d3.axisLeft(y));
    svg.append("text").attr("transform", "rotate(-90)").attr("y", -40).attr("x", -height / 2).attr("text-anchor", "middle").text("Avg Positions Gained");

    // NEW: Draw a dashed zero-line if data dips into negatives
    if (yMin < 0) {
        svg.append("line")
           .attr("x1", 0)
           .attr("x2", width)
           .attr("y1", y(0))
           .attr("y2", y(0))
           .attr("stroke", "#333")
           .attr("stroke-dasharray", "4,4")
           .style("opacity", 0.5);
    }

    // Z Scale: Winner Diversity Ratio (determines bubble radius)
    const z = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.winner_diversity_ratio)])
      .range([3, 15]); 

    // Tooltip Logic
    const tooltip = d3.select("#bubbleTooltip");

    // Draw Bubbles
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
        .attr("cx", d => x(d.decade))
        .attr("cy", d => y(d.avg_positions_gained))
        .attr("r", d => z(d.winner_diversity_ratio))
        .style("fill", "#e10600")
        .style("opacity", "0.6")
        .attr("stroke", "white")
        .attr("stroke-width", "1px")
      .on("mouseover", function(event, d) {
          d3.select(this).style("stroke", "black").style("opacity", "1");
          tooltip.style("opacity", 1)
                 .html(`Circuit ID: ${d.circuitId}<br>Decade: ${d.decade}s<br>Pos Gained: ${d.avg_positions_gained}<br>Diversity Ratio: ${d.winner_diversity_ratio.toFixed(2)}`)
                 .style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseleave", function() {
          d3.select(this).style("stroke", "white").style("opacity", "0.6");
          tooltip.style("opacity", 0);
      });
}