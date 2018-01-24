(function() {
  var margin = { top: 30, left: 40, right: 30, bottom: 30},
  height = 400 - margin.top - margin.bottom,
  width = 780 - margin.left - margin.right;

  var container = d3.select("#crosses")
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

  var i = 0;

  d3.queue()
  .defer(d3.csv, "data/AAPL_HistoricalQuotes_5Yrs.csv", function(d){
    d.datetime = parseTime(d.date);
    i += 1;
    d.dayIndex = i;
    return d;
  })
  .await(ready);

  function ready(error, aapl) {
    var dates = aapl.map(function(d){
          return d.datetime
        })

    var xPositionScale = d3.scaleTime()
      .domain(d3.extent(aapl, function(d) { return d.datetime; }))
      .range([0, width])

    var closeMin = d3.min(aapl, function(d){
      return +d.close
    })
    var closeMax = d3.max(aapl, function(d){
      return +d.close
    })
    var yPositionScale = d3.scaleLinear()
      .domain([closeMin, closeMax])
      .range([height, 0])

    var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%Y"))
    svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.tickValues([parseTime("01/01/14"), parseTime("01/01/15"), parseTime("01/01/16"), parseTime("01/01/17")]));

    var yAxis = d3.axisLeft(yPositionScale)
    svg.append("g")
      .attr("class", "axis y-axis")
      .call(yAxis.tickValues([75, 125, 175]));

    var longTermDays = 200;
    var shortTermDays = longTermDays * 0.25;

    function y2yPerformance() {

        var line = d3.line()
          .x(function(d){
            return xPositionScale(d.datetime)
          })
          .y(function(d){
            return yPositionScale(+d.close)
          })
          .curve(d3.curveCardinal)


        svg.append("path")
          .datum(aapl)
          .attr("d", line)
          .attr("class", "line-aapl")
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("opacity", 0.15)

      
        }//END of y2yPerformance

    function movingAverages() {

      aapl.forEach(function(element) {

        if (element.dayIndex > longTermDays) {

          var longTermSliceEnd = element.dayIndex;
          var longTermSliceBegin = element.dayIndex - longTermDays;
          var longTermSliceArray = aapl.slice(longTermSliceBegin, longTermSliceEnd)
          var longTermMappedArray = longTermSliceArray.map(function(element) {
            return +element.close;
          })
          var longTermMappedArrayMean = d3.mean(longTermMappedArray);
          element.longTermMovingAvg = longTermMappedArrayMean;

          var shortTermSliceEnd = element.dayIndex;
          var shortTermSliceBegin = element.dayIndex - shortTermDays;
          var shortTermSliceArray = aapl.slice(shortTermSliceBegin, shortTermSliceEnd)
          var shortTermMappedArray = shortTermSliceArray.map(function(element) {
            return +element.close;
          })
          var sortTermMappedArrayMean = d3.mean(shortTermMappedArray);
          element.shortTermMovingAvg = sortTermMappedArrayMean;

        }//END of if element.dayIndex > 20
      })//END of aapl.forEach loop

      var lineLong = d3.line()
        .x(function(d){
          if (d.dayIndex > longTermDays) {
            return xPositionScale(d.datetime);
          } else {
            return xPositionScale(aapl[longTermDays].datetime);
          }
        })
        .y(function(d){
          if (d.dayIndex > longTermDays) {
            return yPositionScale(d.longTermMovingAvg);
          } else {
            return yPositionScale(aapl[longTermDays].longTermMovingAvg);
          }
        })
        .curve(d3.curveCardinal)
 
        var lineShort = d3.line()
          .x(function(d){
            if (d.dayIndex > longTermDays) {
              return xPositionScale(d.datetime);
            } else {
              return xPositionScale(aapl[longTermDays].datetime);
            }
          })
          .y(function(d){
            if (d.dayIndex > longTermDays) {
              return yPositionScale(d.shortTermMovingAvg);
            } else {
              return yPositionScale(aapl[longTermDays].shortTermMovingAvg);
            }
          })
          .curve(d3.curveCardinal)

      svg.append("path")
        .datum(aapl)
        .attr("d", lineLong)
        .attr("class", "line-aapl-long")
        .attr("stroke", "red")
        .attr("fill", "none")

      svg.append("path")
        .datum(aapl)
        .attr("d", lineShort)
        .attr("class", "line-aapl-short")
        .attr("stroke", "green")
        .attr("fill", "none")

      var longTermX1 = width * 0.46;
      var longTermY = 0;
      svg.append("line")
        .attr("x1", longTermX1)
        .attr("y1", longTermY)
        .attr("x2", longTermX1 + 30)
        .attr("y2", longTermY)
        .attr("stroke", "red")
        .attr("fill", "none")

      svg.append("g")
        .attr("class", "tick")
        .append("text")
        .text("Long-term")
        .attr("x", longTermX1 - 70)
        .attr("y", longTermY + 5)

      var shortTermX1 = longTermX1 + 120;
      var shortTermY = longTermY;
      svg.append("line")
        .attr("x1", shortTermX1)
        .attr("y1", shortTermY)
        .attr("x2", shortTermX1 + 30)
        .attr("y2", shortTermY)
        .attr("stroke", "green")
        .attr("fill", "none")        

      svg.append("g")
        .attr("class", "tick")
        .append("text")
        .text("Short-term")
        .attr("x", shortTermX1 - 70)
        .attr("y", shortTermY + 5)


    }//END of MovingAverages func


    function findCrosses() {
      var deathCrossX;
      var deathCrossY;
      var goldenCrossX;
      var goldenCrossY;

      aapl.some(function(d){
        if (d.dayIndex > longTermDays) {
          if (d.longTermMovingAvg > d.shortTermMovingAvg) {
            deathCrossX = d.datetime;
            deathCrossY = +d.longTermMovingAvg;
            return d;
          }//END of if averages are equal
        }//END of if dayIndex
      })//END of appl.forEach

      aapl.some(function(d){
        if (d.datetime > deathCrossX) {
          if (d.longTermMovingAvg < d.shortTermMovingAvg) {
            goldenCrossX = d.datetime;
            goldenCrossY = +d.shortTermMovingAvg;
            return d;
          }//END of if averages are equal
        }//END of if dayIndex
      })//END of appl.forEach

    var deathArc = d3.arc()
      .innerRadius(40)
      .outerRadius(41)
      .startAngle(-1.5)
      .endAngle(-0.5)

    var goldenArc = d3.arc()
      .innerRadius(40)
      .outerRadius(41)
      .startAngle(-2.5)
      .endAngle(-1.5)

    svg.append("g")
      .attr("transform", "translate(" + (xPositionScale(deathCrossX) + 42) + "," + (yPositionScale(deathCrossY)) + ")")
      .append("path")
      .attr("d", deathArc)
      .attr("fill", "gray")


    svg.append("g")
      .attr("transform", "translate(" + (xPositionScale(goldenCrossX) + 42) + "," + (yPositionScale(goldenCrossY) + 7) + ")")
      .append("path")
      .attr("d", goldenArc)
      .attr("fill", "gray")

    svg.append("g")
      .attr("class", "chart-annots")
      .append("text")
      .text("Death Cross")
      .attr("x", xPositionScale(deathCrossX) - 15)
      .attr("y", yPositionScale(deathCrossY) - 40)


    svg.append("g")
      .attr("class", "chart-annots")
      .append("text")
      .text("Golden Cross")
      .attr("x", xPositionScale(goldenCrossX) - 25)
      .attr("y", yPositionScale(goldenCrossY) + 55)

    }//END of findCrosses func

    y2yPerformance();
    movingAverages();
    findCrosses();


  }//END of ready(aapl)

})();