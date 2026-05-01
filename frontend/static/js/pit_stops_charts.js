export function drawPitStopCorrelation(data, containerId) {
    // 1. Dimensions and Margins
    // We increased margin.right from 30 to 100 to make room for the legend
    const margin = { top: 40, right: 100, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // 2. Clear existing SVG
    d3.select(containerId).selectAll("*").remove();

    // 3. Append SVG
    const svg = d3.select(containerId)
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract our maximums for scaling
    const maxPosition = d3.max(data, d => parseFloat(d.AvgFinishingPosition)) || 20;
    const maxOccurrences = d3.max(data, d => parseInt(d.TotalOccurrences)) || 1;
    const minOccurrences = d3.min(data, d => parseInt(d.TotalOccurrences)) || 0;

    // 4. X Axis (Pit Stops)
    const x = d3.scaleBand()
        .domain(data.map(d => d.PitStopsPerRace))
        .range([0, width])
        .padding(0.2);
    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .text("Number of Pit Stops Per Race");

    // 5. Y Axis (Avg Finishing Position)
    const y = d3.scaleLinear()
        .domain([0, Math.ceil(maxPosition) + 2]) 
        .range([height, 0]);
        
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -height / 2)
        .text("Avg Finishing Position");

    // 6. Dynamic Color Scale based on Total Occurrences
    // Low occurrences = light red/pink, High occurrences = intense F1 red
    const colorScale = d3.scaleLinear()
        .domain([minOccurrences, maxOccurrences])
        .range(["#ffb3b3", "#e10600"]); 

    // 7. Draw Bars
    svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.PitStopsPerRace))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.AvgFinishingPosition)) 
        .attr("height", d => height - y(d.AvgFinishingPosition))
        .attr("fill", d => colorScale(d.TotalOccurrences)); // Color mapped to occurrences
        
    // 8. Data Labels (Finishing Position Number)
    svg.selectAll(".label")
        .data(data)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("x", d => x(d.PitStopsPerRace) + (x.bandwidth() / 2))
        .attr("y", d => y(d.AvgFinishingPosition) - 10) 
        .text(d => parseFloat(d.AvgFinishingPosition).toFixed(1))
        .style("font-size", "12px")
        .style("font-weight", "bold");

    // ==========================================
    // 9. DRAW THE GRADIENT LEGEND
    // ==========================================

    // A. Define the gradient in SVG defs
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "occurrence-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%") // Bottom is 100% (Light)
        .attr("x2", "0%")
        .attr("y2", "0%");  // Top is 0% (Dark)

    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffb3b3"); // Light color at the bottom

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#e10600"); // Dark color at the top

    // B. Create a group for the legend on the right side
    const legendWidth = 20;
    const legendHeight = height; 
    const legendX = width + 30; // Push it 30px to the right of the main chart

    const legendGroup = svg.append("g")
        .attr("transform", `translate(${legendX}, 0)`);

    // C. Draw the rectangle filled with the gradient
    legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#occurrence-gradient)");

    // D. Create a scale and axis for the legend text
    const legendScale = d3.scaleLinear()
        .domain([maxOccurrences, minOccurrences]) // Reversed so max is at the top
        .range([0, legendHeight]);

    // Attach the axis to the right side of the legend rectangle
    legendGroup.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(d3.axisRight(legendScale).ticks(5));

    // E. Add a title to the legend
    legendGroup.append("text")
        .attr("class", "legend-title")
        .attr("x", -10)
        .attr("y", -10)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Occurrences");
}

// 1. Pit Stops Per Year Chart (D3.js) - Updated with labels
export function createPitStopsPerYearChart(containerSelector, data) {
    const margin = {top: 60, right: 30, bottom: 60, left: 70};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Title & Subtitle
    svg.append("text").attr("x", width / 2).attr("y", -30).attr("text-anchor", "middle").style("font-size", "18px").text("Total Pit Stops Per Racing Season");
    svg.append("text").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "#666").text("Shows the evolution of race strategy over time");

    // X Axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.year))
      .padding(0.2);
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
        
    svg.append("text").attr("x", width / 2).attr("y", height + 50).attr("text-anchor", "middle").text("Season (Year)");

    // Y Axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.PitStopCount)])
      .range([height, 0]);
      
    svg.append("g").call(d3.axisLeft(y));
    svg.append("text").attr("transform", "rotate(-90)").attr("y", -50).attr("x", -height / 2).attr("text-anchor", "middle").text("Number of Pit Stops");

    // Bars
    svg.selectAll("rect")
      .data(data)
      .join("rect")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.PitStopCount))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.PitStopCount))
        .attr("fill", "steelblue");

    // Data Labels (Numbers on top of bars)
    svg.selectAll(".bar-label")
      .data(data)
      .join("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.year) + x.bandwidth() / 2)
        .attr("y", d => y(d.PitStopCount) - 5) // 5 pixels above the bar
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#333")
        .text(d => d.PitStopCount);
}

// 2. Average Pit Stop Duration Per Year Chart (D3.js) - Updated with labels
export function createAvgPitStopDurationChart(containerSelector, data) {
    const margin = {top: 60, right: 30, bottom: 60, left: 70};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Title & Subtitle
    svg.append("text").attr("x", width / 2).attr("y", -30).attr("text-anchor", "middle").style("font-size", "18px").text("Average Pit Stop Duration Per Season");
    svg.append("text").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "#666").text("Excludes severe outliers (stops longer than 180s)");

    // X Axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.year))
      .padding(0.2);
      
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
        
    svg.append("text").attr("x", width / 2).attr("y", height + 50).attr("text-anchor", "middle").text("Season (Year)");

    // Y Axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgPitStopDuration) * 1.05]) // Added 5% padding so highest label isn't cut off
      .range([height, 0]);
      
    svg.append("g").call(d3.axisLeft(y));
    svg.append("text").attr("transform", "rotate(-90)").attr("y", -50).attr("x", -height / 2).attr("text-anchor", "middle").text("Average Time (Seconds)");

    // Bars
    svg.selectAll("rect")
      .data(data)
      .join("rect")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.AvgPitStopDuration))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.AvgPitStopDuration))
        .attr("fill", "crimson");

    // Data Labels (Numbers on top of bars)
    svg.selectAll(".bar-label")
      .data(data)
      .join("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.year) + x.bandwidth() / 2)
        .attr("y", d => y(d.AvgPitStopDuration) - 5) // 5 pixels above the bar
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#333")
        .text(d => d.AvgPitStopDuration.toFixed(2) + "s"); // Rounded to 2 decimals with 's' suffix
}

// 3. Fastest Pit Crews Horizontal Bar Chart with Pagination (D3.js)
export function createFastestPitCrewsChart(containerSelector, data, prevBtnId, nextBtnId, pageInfoId) {
    const margin = {top: 60, right: 60, bottom: 60, left: 160}; // Increased left margin for constructor names
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(containerSelector)
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Title & Subtitle
    svg.append("text").attr("x", width / 2).attr("y", -30).attr("text-anchor", "middle").style("font-size", "18px").text("Fastest Pit Crews by Constructor");
    svg.append("text").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "#666").text("Modern Era (2014+), Min. 100 stops, excludes stops > 40s");

    // Static X Axis (Based on maximum dataset value to prevent jumpiness)
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgPitStopDuration) * 1.05]) 
      .range([0, width]);
      
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
      
    svg.append("text").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text("Average Time (Seconds)");

    // Y Axis (Dynamic based on data subset)
    const y = d3.scaleBand().range([0, height]).padding(0.2);
    const yAxisGroup = svg.append("g");

    // Pagination State
    let currentIndex = 0;
    const itemsPerPage = 10;
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const pageInfo = document.getElementById(pageInfoId);

    // D3 Update Function
    function updateChart() {
        const currentData = data.slice(currentIndex, currentIndex + itemsPerPage);

        // Update Y Scale and Axis
        y.domain(currentData.map(d => d.ConstructorName));
        yAxisGroup.transition().duration(500).call(d3.axisLeft(y));

        // Join Bars
        const bars = svg.selectAll(".bar").data(currentData, d => d.ConstructorName);

        // Enter + Update
        bars.enter()
          .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.ConstructorName))
            .attr("width", 0) // Start at 0 for transition
            .attr("height", y.bandwidth())
            .attr("fill", "teal")
          .merge(bars)
          .transition().duration(500)
            .attr("y", d => y(d.ConstructorName))
            .attr("width", d => x(d.AvgPitStopDuration))
            .attr("height", y.bandwidth());

        // Exit
        bars.exit()
          .transition().duration(500)
            .attr("width", 0)
          .remove();

        // Update Labels inside/near bars
        const labels = svg.selectAll(".label").data(currentData, d => d.ConstructorName);
        
        labels.enter()
          .append("text")
            .attr("class", "label")
            .attr("y", d => y(d.ConstructorName) + y.bandwidth() / 2)
            .attr("x", 0)
            .attr("dy", ".35em")
            .attr("dx", 5)
            .style("fill", "#333")
            .style("font-size", "12px")
          .merge(labels)
          .transition().duration(500)
            .attr("y", d => y(d.ConstructorName) + y.bandwidth() / 2)
            .attr("x", d => x(d.AvgPitStopDuration))
            .text(d => d.AvgPitStopDuration.toFixed(3) + "s");

        labels.exit().remove();

        // Update Pagination Controls
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex + itemsPerPage >= data.length;
        const currentEnd = Math.min(currentIndex + itemsPerPage, data.length);
        pageInfo.innerText = `Showing ${currentIndex + 1} - ${currentEnd} of ${data.length}`;
    }

    // Attach Event Listeners
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

    // Initial render
    updateChart();
}