(function() {
  var margin = { top: 10, left: 40, right: 30, bottom: 30},
  height = 400 - margin.top - margin.bottom,
  width = 780 - margin.left - margin.right;

  var container = d3.select("#rsi")
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

    var xPositionScale = d3.scaleTime()
      .domain(d3.extent(aapl, function(d) { return d.datetime; }))
      .range([0, width])

    var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%Y"))
    svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.tickValues([parseTime("01/01/14"), parseTime("01/01/15"), parseTime("01/01/16"), parseTime("01/01/17")]));

    var rsiDays = 14;

    function y2yPerformance() {

      var closeMin = d3.min(aapl, function(d){
        return +d.close
      })
      var closeMax = d3.max(aapl, function(d){
        return +d.close
      })
      var yPositionScale = d3.scaleLinear()
        .domain([closeMin, closeMax])
        .range([height, 0])

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

    function rsi() {
      aapl.forEach(function(element) {
        if (element.dayIndex === rsiDays + 1) { 
          var rsiArrayEnd = element.dayIndex;
          var rsiArrayBegin = element.dayIndex - rsiDays;
          var rsiArray = aapl.slice(rsiArrayBegin, rsiArrayEnd);

          var rsiGains = rsiArray.map(function(obj) {
            if (+obj.change >= 0) {
              return +obj.change;
            }
          })
          var rsiLosses = rsiArray.map(function(obj) {
            if (+obj.change < 0) {
              return Math.abs(+obj.change);
            }
          })
          var avgGains = d3.mean(rsiGains);
          var avgLosses = d3.mean(rsiLosses);

          var rs = avgGains / avgLosses;
          var rsindex = 100 - (100 / (1 + rs));

          element.avgGains = avgGains;
          element.avgLosses = avgLosses;
          element.rsindex = rsindex;

        } else if (element.dayIndex > rsiDays + 1) {//END of if for first of 14 days period

          var previousAvgGains = aapl[element.dayIndex - 2].avgGains;
          var previousAvgLosses = aapl[element.dayIndex - 2].avgLosses;
          var avgGains, avgLosses;

          if (element.change >= 0) {
            avgGains = ((previousAvgGains * 13) + Math.abs(+element.change)) / 14;
            avgLosses = ((previousAvgLosses * 13)) / 14;
          } else {
            avgGains = ((previousAvgGains * 13)) / 14;
            avgLosses = ((previousAvgLosses * 13) + Math.abs(+element.change)) / 14;
          }

          var rs = avgGains / avgLosses;
          var rsindex = 100 - (100 / (1 + rs));

          element.avgGains = avgGains;
          element.avgLosses = avgLosses;
          element.rsindex = rsindex;

        }//END of else if for next of 14 days period

      })//END of aapl.forEach

      var rsiMin = d3.min(aapl, function(d){
        return +d.rsindex
      })
      var rsiMax = d3.max(aapl, function(d){
        return +d.rsindex
      })

      var yPositionScale = d3.scaleLinear()
        .domain([15, rsiMax])
        .range([height, 0])

      var yAxis = d3.axisLeft(yPositionScale)
      svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis.tickValues([30, 70]));

      var lineRSI = d3.line()
        .x(function(d){
          if (d.dayIndex >= rsiDays + 1) {
            return xPositionScale(d.datetime);
          } else {
            return xPositionScale(aapl[rsiDays + 1].datetime);
          }
        })
        .y(function(d){
          if (d.dayIndex >= rsiDays + 1) {
            return yPositionScale(d.rsindex);
          } else {
            return yPositionScale(aapl[rsiDays + 1].rsindex);
          }
        })
        .curve(d3.curveCardinal)


      svg.append("path")
        .datum(aapl)
        .attr("d", lineRSI)
        .attr("class", "line-RSI")
        .attr("stroke", "blue")
        .attr("fill", "none")
        .attr("opacity", 0.15)

      svg.append("line")
        .attr("x1", xPositionScale(aapl[rsiDays + 1].datetime))
        .attr("y1", yPositionScale(30))
        .attr("x2", xPositionScale(aapl[aapl.length - 1].datetime))
        .attr("y2", yPositionScale(30))
        .attr("stroke", "gray")
        .attr("fill", "none")
        .attr("stroke-width", 0.5)
      svg.append("line")
        .attr("x1", xPositionScale(aapl[rsiDays + 1].datetime))
        .attr("y1", yPositionScale(70))
        .attr("x2", xPositionScale(aapl[aapl.length - 1].datetime))
        .attr("y2", yPositionScale(70))
        .attr("stroke", "gray")
        .attr("fill", "none")
        .attr("stroke-width", 0.5)

      svg.append("g")
        .attr("class", "chart-annots")
        .append("text")
        .text("Oversold Area")
        .attr("x", xPositionScale(parseTime("01/01/14")))
        .attr("y", yPositionScale(25))
      svg.append("g")
        .attr("class", "chart-annots")
        .append("text")
        .text("Overbought Area")
        .attr("x", xPositionScale(parseTime("05/01/15")))
        .attr("y", yPositionScale(73))


    }//END of rsi func

    rsi();

  }//END of ready(aapl)

})();