(function() {
  var margin = { top: 10, left: 40, right: 30, bottom: 30},
  height = 400 - margin.top - margin.bottom,
  width = 780 - margin.left - margin.right;

  var container = d3.select("#bollinger")
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

    var rsiDays = 14;
    var shortTermDays = 20;

    var startingDate = parseTime("03/14/15");
    var endingDate = parseTime("01/01/16");
    var startingArrayIndex;

    aapl.some(function(element){
      if (element.datetime > startingDate) {
        startingArrayIndex = element.dayIndex
        return element;
      }//END of if datetime greater than
    })//END of aapl.some
    startingArrayIndex = startingArrayIndex - 1;

    var xPositionScale = d3.scaleTime()
      .domain([startingDate, endingDate])
      .range([0, width])

    var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%Y/%m"))
    svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.tickValues([startingDate, endingDate]));

    var closeMin = d3.min(aapl, function(d){
      if (startingDate <= d.datetime && d.datetime <= endingDate) {
        return +d.close
      }
    })
    var closeMax = d3.max(aapl, function(d){
      if (startingDate <= d.datetime && d.datetime <= endingDate) {
        return +d.close
      }
    })
      
    var yPositionScale = d3.scaleLinear()
      .domain([closeMin - 10, closeMax + 10])
      .range([height, 0])

    var yAxis = d3.axisLeft(yPositionScale)
    svg.append("g")
      .attr("class", "axis y-axis")
      .call(yAxis.tickValues([75, 125, 175]));

    function y2yPerformance() {

      var line = d3.line()
        .x(function(d){
          if (d.datetime >= startingDate) {
            return xPositionScale(d.datetime)
          } else {
            return xPositionScale(startingDate)
          }
        })
        .y(function(d){
          if (d.datetime >= startingDate) {
            return yPositionScale(+d.close)
          } else {
            return yPositionScale(+aapl[startingArrayIndex].close)
          }
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

    function bollingerBands() {

      aapl.forEach(function(element) {

        if (element.datetime > startingDate) {

          var shortTermSliceEnd = element.dayIndex;
          var shortTermSliceBegin = element.dayIndex - shortTermDays;
          var shortTermSliceArray = aapl.slice(shortTermSliceBegin, shortTermSliceEnd)
          var shortTermMappedArray = shortTermSliceArray.map(function(element) {
            return +element.close;
          })

          var sortTermMappedArrayMean = d3.mean(shortTermMappedArray);
          var sortTermMappedArrayStdDevUpper = sortTermMappedArrayMean + (d3.deviation(shortTermMappedArray) * 2);
          var sortTermMappedArrayStdDevLower = sortTermMappedArrayMean + (d3.deviation(shortTermMappedArray) * -2);
          
          element.shortTermMovingAvg = sortTermMappedArrayMean;
          element.shortTermMovingDevUp = sortTermMappedArrayStdDevUpper;
          element.shortTermMovingDevBott = sortTermMappedArrayStdDevLower;

        }//END of if element.dayIndex > 20
      })//END of aapl.forEach loop

        var lineShort = d3.line()
          .x(function(d){
            if (d.datetime > startingDate) {
              return xPositionScale(d.datetime);
            } else {
              return xPositionScale(startingDate);
            }
          })
          .y(function(d){
            if (d.datetime > startingDate) {
              return yPositionScale(d.shortTermMovingAvg);
            } else {
              return yPositionScale(+aapl[startingArrayIndex].shortTermMovingAvg);
            }
          })
          .curve(d3.curveCardinal)

        var lineDevUp = d3.line()
          .x(function(d){
            if (d.datetime > startingDate) {
              return xPositionScale(d.datetime);
            } else {
              return xPositionScale(startingDate);
            }
          })
          .y(function(d){
            if (d.datetime > startingDate) {
              return yPositionScale(d.shortTermMovingDevUp);
            } else {
              return yPositionScale(+aapl[startingArrayIndex].shortTermMovingDevUp);
            }
          })
          .curve(d3.curveCardinal)

        var lineDevBott = d3.line()
          .x(function(d){
            if (d.datetime > startingDate) {
              return xPositionScale(d.datetime);
            } else {
              return xPositionScale(startingDate);
            }
          })
          .y(function(d){
            if (d.datetime > startingDate) {
              return yPositionScale(d.shortTermMovingDevBott);
            } else {
              return yPositionScale(+aapl[startingArrayIndex].shortTermMovingDevBott);
            }
          })
          .curve(d3.curveCardinal)


      svg.append("path")
        .datum(aapl)
        .attr("d", lineShort)
        .attr("class", "line-aapl-short")
        .attr("stroke", "black")
        .attr("fill", "none")
        .style("stroke-dasharray", ("1.5,1.5"))
        .attr("opacity", 0.55)

      svg.append("path")
        .datum(aapl)
        .attr("d", lineDevUp)
        .attr("class", "line-aapl-devup")
        .attr("stroke", "green")
        .attr("fill", "none")

      svg.append("path")
        .datum(aapl)
        .attr("d", lineDevBott)
        .attr("class", "line-aapl-devbott")
        .attr("stroke", "red")
        .attr("fill", "none")


    }//END of bollingerBands func

    function legend() {
      var chartLegend = svg.append("g")
            .attr("class", "legend-annots")
      var movAvgX = width * 0.16;
      var movAvgY = 20;
      var movAvgX1 = movAvgX + 130;
      var movAvgX2 = movAvgX1 + 30;
      var movAvgY1 = 17;
      chartLegend
          .append("text")
          .text("20-day Moving Avg")
          .attr("x", movAvgX)
          .attr("y", movAvgY)
      chartLegend
          .append("line")
          .attr("class", "line-annot-dash")
          .attr("x1", movAvgX1)
          .attr("y1", movAvgY1)
          .attr("x2", movAvgX2)
          .attr("y2", movAvgY1)
          .attr("stroke", "black")
          .attr("fill", "none")
          .style("stroke-dasharray", ("1.5,1.5"))
          .attr("opacity", 0.55)
      var stdDevUpX = movAvgX2 + 30;
      var stdDevUPX1 = stdDevUpX + 100;
      var stdDevUPX2 = stdDevUPX1 + 30;
      chartLegend
          .append("text")
          .text("2 Std Devs Up")
          .attr("x", stdDevUpX)
          .attr("y", movAvgY)
      chartLegend
          .append("line")
          .attr("class", "line-annot-dash")
          .attr("x1", stdDevUPX1)
          .attr("y1", movAvgY1)
          .attr("x2", stdDevUPX2)
          .attr("y2", movAvgY1)
          .attr("stroke", "green")
          .attr("fill", "none")
      var stdDevDown = stdDevUPX2 + 30;
      var stdDevDown1 = stdDevDown + 120;
      var stdDevDown2 = stdDevDown1 + 30;
      chartLegend
          .append("text")
          .text("2 Std Devs Down")
          .attr("x", stdDevDown)
          .attr("y", movAvgY)
      chartLegend
          .append("line")
          .attr("class", "line-annot-dash")
          .attr("x1", stdDevDown1)
          .attr("y1", movAvgY1)
          .attr("x2", stdDevDown2)
          .attr("y2", movAvgY1)
          .attr("stroke", "red")
          .attr("fill", "none")
    }

    function annotations() {
      var chartAnnots = svg.append("g")
            .attr("class", "chart-annots")

      var sellingArc = d3.arc()
        .innerRadius(40)
        .outerRadius(41)
        .startAngle(-1.5)
        .endAngle(-0.5)
      var sellingArcX = parseTime("08/28/15")
      var sellingArcY = 285
      chartAnnots
        .append("g")
        .attr("transform", "translate(" + xPositionScale(sellingArcX) + "," + sellingArcY+ ")")
        .append("path")
        .attr("d", sellingArc)
        .attr("fill", "gray")
      chartAnnots
        .append("text")
        .text("Strong selling")
        .attr("x", xPositionScale(sellingArcX) - 95)
        .attr("y", sellingArcY + 15)

      var buyingArc = d3.arc()
        .innerRadius(40)
        .outerRadius(41)
        .startAngle(-2.5)
        .endAngle(-1.5)
      var buyingArcX = parseTime("10/31/15")
      var buyingArcY = 160
      chartAnnots
        .append("g")
        .attr("transform", "translate(" + xPositionScale(buyingArcX) + "," + buyingArcY + ")")
        .append("path")
        .attr("d", buyingArc)
        .attr("fill", "gray")
      chartAnnots
        .append("text")
        .text("Strong buying")
        .attr("x", xPositionScale(buyingArcX) - 90)
        .attr("y", buyingArcY - 10)
    }



    y2yPerformance();
    bollingerBands();
    legend();
    annotations();

  }//END of ready(aapl)

})();