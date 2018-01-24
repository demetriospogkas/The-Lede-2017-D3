(function() {
  var margin = { top: 30, left: 40, right: 30, bottom: 30},
  height = 400 - margin.top - margin.bottom,
  width = 780 - margin.left - margin.right;

  var container = d3.select("#chart-1")
                      .style("background-color", "")

  var svg = container
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .attr("class", "chart1-class")
        .attr("opacity", 1)
        .style("background-color", "")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var parseTime = d3.timeParse("%m/%d/%y")

  d3.queue()
    .defer(d3.csv, "data/stocks_new.csv", function(d) {
      d.datetime = parseTime(d.date);
      return d;
    })
    .await(ready);

  function ready(error, datapoints) {

    var dates = datapoints.map(function(d){
      return d.datetime
    })

    var xPositionScale = d3.scaleTime()
      .domain(d3.extent(datapoints, function(d) { return d.datetime; }))
      .range([0, width])

    closeMin = d3.min(datapoints, function(d){
      return +d.aapl
    })
    closeMax = d3.max(datapoints, function(d){
      return +d.aapl
    })
    yPositionScale = d3.scaleLinear()
      .domain([closeMin, closeMax])
      .range([height, 0])

    var line = d3.line()
      .x(function(d){
        return xPositionScale(d.datetime)
      })
      .y(function(d){
        return yPositionScale(+d.aapl)
      })
      .curve(d3.curveCardinal)

    svg.append("path")
      .datum(datapoints)
      .attr("d", line)
      .attr("stroke", "black")
      .attr("fill", "none")

    var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%m/%y"))
    svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    var yAxis = d3.axisLeft(yPositionScale)
    svg.append("g")
      .attr("class", "axis y-axis")
      .call(yAxis.tickValues([125,150,175]));


    }
})();