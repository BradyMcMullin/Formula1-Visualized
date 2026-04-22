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