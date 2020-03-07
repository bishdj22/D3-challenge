// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Insert chart dynamics 

// Initial Params
var chosenXAxis = "obesity";


// function used for updating x-scale var upon click on axis label
function xScale(censusdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusdata, d => d[chosenXAxis]) * 0.8,
      d3.max(censusdata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}


// Need to continue with tooltips **
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "obesity") {
    var label = "Obesity (%)";
  }
  else {
    var label = "Obesity (%) MAX";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br> Median Income: ${d.income}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Read in CSV data
//,,,,,,,,,,,,,,
d3.csv("data.csv").then(function(censusdata) {
    console.log(censusdata);

    censusdata.forEach(function(d){
      d.poverty = +d.poverty;
      d.povertyMoe = +d.povertyMoe;
      d.age = +d.age;
      d.ageMoe = +d.ageMoe;
      d.income = +d.income;
      d.incomeMoe = +d.incomeMoe;
      d.healthcare = +d.healthcare;
      d.healthcareLow = +d.healthcareLow;
      d.healthcareHigh = +d.healthcareHigh;
      d.obesity = +d.obesity;
      d.obesityLow = +d.obesityLow;
      d.obesityHigh = +d.obesityHigh;
      d.smokes = +d.smokes;
      d.smokesLow = +d.smokesLow;
      d.smokesHigh = +d.smokesHigh;

    });
    console.log(censusdata);

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusdata, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusdata, d => d.income)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  
  // append y axis
  chartGroup.append("g")
    .call(leftAxis);
  
  // append initial circles 
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusdata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.income))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");
  
  // Add text to circles --> State Abbrevs.  
  chartGroup.select("g")
    .selectAll("circle")
    .data(censusdata)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.income))
    .attr("dy",-395)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black");
  
  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");
    console.log(obesityLabel);

  var obesityMAXLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesityHigh") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity (%) MAX");
  
  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Median Household Income");

// Update ToolTip function 
// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
labelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(censusdata, chosenXAxis);

      // updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityMAXLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityMAXLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });

 
 });
 