(function() {
  var margin = { top: 45, left: 45, right: 45, bottom: 85}
  var widthSvg = window.innerWidth * 0.9
  var heightSvg = 700
  var widthScale = widthSvg - margin.left - margin.right
  var heightScale = heightSvg - margin.top - margin.bottom

  var container = d3.select("#chart-1")
    .style("margin-left", "")
    .style("margin-right", "")
    .style("background-color", "")

  var mainSvg = container.append("svg")
    .attr("width", widthSvg)
    .attr("height", heightSvg)
    .style("background-color", "")

  var mainG = mainSvg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var projection = d3.geoAlbersUsa()
        .translate([widthSvg/2, heightSvg/2])
        .scale([1200]);
          
  var path = d3.geoPath()
        .projection(projection);

  var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeReds[9]);

  d3.queue()
    .defer(d3.json, "data/us_states.topojson")
    .defer(d3.csv, "data/01_State-pct-in-US-GDP-2017Q2_Abbrs.csv")
    .await(ready)


  function ready(error, polygon, datapoints) {
    var states = topojson.feature(polygon, polygon.objects.us_states).features
    var statesAbbrs = datapoints.map(function(d){
      return d.Abbr
    })
    var popMax = d3.max(datapoints, function(d){
      return +d.Pop
    })
    var xPositionScale = d3.scaleBand()
      .domain(statesAbbrs)
      .range([15, widthScale])
    var yPositionScale = d3.scaleLinear()
      .domain([0 , popMax])
      .range([heightScale, 0])
    var xAxis = d3.axisBottom(xPositionScale)
    var yAxis = d3.axisLeft(yPositionScale)
                  .tickValues([0, 1000000, 5000000, 20000000, 40000000]).tickFormat(d3.format(".0s"))

    for ( var i = 0; i < datapoints.length; i++) {
      for (var j = 0; j < states.length; j++) {
        if (datapoints[i].State === states[j].properties.name) {
          datapoints[i].geometry = states[j]['geometry']
          datapoints[i].properties = states[j]['properties']
          datapoints[i].type = states[j]['type']
          break
        } else {
        }// END if
      }// END loop states
    }// END loop datapoints

    function throwLegend() {
      xPositionScaleLegend = d3.scaleBand()
        .domain(color.range())
        .range([0, 600])

      colorScaleLegend = d3.scaleOrdinal()
        .domain(color.range())
        .range(color.range())

      mainG.selectAll(".legendCircles")
        .data(color.range())
        .enter().append("circle")
        .attr("class", "legendCircles")
        .attr("opacity", 1)
        .attr("r", 10)
        .attr("cx", function(d){
          return widthScale*0.3 + xPositionScaleLegend(d)
        })
        .attr("cy", heightScale)
        .attr("fill", function(d){
          return colorScaleLegend(d)
        })
        .attr("stroke", "lightgray")

      mainG.selectAll(".legendTexts")
        .data(color.range())
        .enter().append("text")
        .attr("class", "legendTexts")
        .attr("opacity", 1)
        .text(function(d){
          if (d === "#67000d") {
            return "14%"
          } else if (d === "#fb6a4a"){
            return "4%"
          } else if (d === "#fff5f0") {
            return "0.2%"
          }
        })
        .attr("x", function(d){
          if (d === "#fb6a4a") {
            return widthScale*0.291 + xPositionScaleLegend(d)
          } else {
            return widthScale*0.288 + xPositionScaleLegend(d)
          }
        })
        .attr("y", heightScale + 26)


      mainG.append("g")
        .append("text")
        .attr("class", "sourceCredit")
        .text("Source: Gross Domestic Product by State, Second Quarter 2017 - Bureau of Economic Analysis. Population Estimates as of July, 2016 - US Census Bureau.")
        .attr("x", widthScale*0.19)
        .attr("y", heightScale + 65)

      mainG.append("g")
        .append("text")
        .attr("class", "sourceCredit")
        .text("Original Shape Tweening code sample from: bl.ocks.org/mbostock/3081153.")
        .attr("x", widthScale*0.37)
        .attr("y", heightScale + 80)
    }// END of throwLegend()

    function throwAxes() {
      mainG.append("g")
        .attr("class", "axis xAxis init")
        .attr("transform", "translate(-12," + (heightScale + 10) + ")")
        .attr("opacity", 0)
        .call(xAxis.tickSize(-heightScale - 20));

      mainG.append("g")
        .attr("opacity", 0)
        .call(yAxis.tickSize(-widthScale))
        .attr("class", function(k){
          return "axis yAxis init rest"
        });

      var xTicks = d3.selectAll(".xAxis .tick");
      xTicks.attr("class", function(d, i){
        if (i % 2 === 0) {
          return "xAxis tick tickDashedLine"
        } else {
          return "xAxis tick noTickLine"
        }
      })

      var xTicksText = d3.selectAll(".xAxis .tick text");
      xTicksText.attr("y", function(d, i){
        if (i % 2 === 0) {
          return 5
        } else {
          return 20
        }
      })// end of xTicks
    }// end of throwAxes()

    function drawMap() {
      stateSvg = mainG.selectAll("svg")
        .data(datapoints)
        .enter().append("svg")
        .attr("x", 0)
        .attr("y", -90)

      stateShapes = stateSvg
        .append("path")
        .attr("class", function(d) {
          return d.State
        })
        .attr("d", function(d){
          return path(d)
        })
        .style("fill", function(d){
          return color(+d.Percent)
        })
        .style("stroke", "none")      
    }// END of drawMap()

    throwAxes()
    drawMap()
    throwLegend()

    // modified code from Mike Bostock's Shape Tweening: https://bl.ocks.org/mbostock/3081153
    function circle(coordinates, centroidX, stateName) {
      var circle = []
      var length = 0
      var lengths = [length]
      var polygon = d3.geom.polygon(coordinates)
      var p0 = coordinates[0]
      var p1,
          x,
          y,
          i = 0,
          n = coordinates.length;

      while (++i < n) {
        p1 = coordinates[i];
        x = p1[0] - p0[0];
        y = p1[1] - p0[1];
        lengths.push(length += 100);
        p0 = p1;
      }

      var area = polygon.area(),
          radius = 12,
          centroid = polygon.centroid(-1 / (6 * area)),
          angleOffset = -Math.PI / 2,
          angle,
          i = -1,
          k

      while (++i < n) {
        if (stateName === "DC") {
          k = 2 * 10000;
        } else {
          k = 12 * Math.PI / lengths[lengths.length - 1];
        }
        angle = angleOffset + lengths[i] * k;
        centroidXZero = centroid[0] + (radius * Math.cos(angle))// + 200
        centroidYZero = centroid[1] + (radius * Math.sin(angle))// + 200
        circle.push([
          centroidXZero,
          centroidYZero
        ]);
      }
      return circle;
    }// END of circle

    function createCircles() {
      function changeShape() {
        mainG.selectAll(".init")
          .transition()
          .duration(2500)
          .attr("class", "changed")
          .attr("opacity", 1)

        mainG.selectAll(".legendCircles")
          .transition()
          .duration(500)
          .attr("opacity", 0)
          
        mainG.selectAll(".legendTexts")
          .transition()
          .duration(500)
          .attr("opacity", 0)

        stateShapes
          .transition()
          .duration(2000)
          .style("stroke", "none")
          .attr("d", function(d){
            if (d.properties.name === "Hawaii") {
              var originalCoordsArray = d.geometry.coordinates
              var newCoordsArray = []

              for (var i = 0; i < originalCoordsArray.length; i++) {
                var originalCoordsArrayStep = originalCoordsArray[i][0]
                for (var j = 0; j < originalCoordsArrayStep.length; j++) {
                  newCoordsArray.push(originalCoordsArrayStep[j])
                }//END of nested for loop
              }//END of outer for loop

              newCoordsArray = newCoordsArray.slice(0,129)

              var coordinates0 = newCoordsArray.map(projection)
              var coordinates1 = circle(coordinates0, widthScale)

              var d1 = "M" + coordinates1.join("L") + "Z"

              return d1

            }
            else if (d.geometry.type === "MultiPolygon") {
              var originalCoordsArray = d.geometry.coordinates
              var newCoordsArray = []

              for (var i = 0; i < originalCoordsArray.length; i++) {
                var originalCoordsArrayStep = originalCoordsArray[i][0]
                for (var j = 0; j < originalCoordsArrayStep.length; j++) {
                  newCoordsArray.push(originalCoordsArrayStep[j])
                }//END of nested for loop
              }//END of outer for loop

              var coordinates0 = newCoordsArray.map(projection)
              var coordinates1 = circle(coordinates0, widthScale)

              var d1 = "M" + coordinates1.join("L") + "Z"

              return d1
            } else {
                var coordinates0 = d.geometry.coordinates[0].map(projection)
                var coordinates1 = circle(coordinates0, widthScale, d.Abbr)
                var d1 = "M" + coordinates1.join("L") + "Z"
                return d1
            }
          })
          .style("stroke", "none")
          .style("fill", function(d){
            return color(+d.Percent)
          })
      }// END of changeShape()

      changeShape()

      setTimeout(function changeX() {
          stateSvg
            .attr("x", function(d){
            })
            .transition()
            .duration(3000)
            .attr("x", function(d) {
              var currentPathX = document.getElementsByClassName(d.State)[0].getBoundingClientRect().x
              var toMovePathXScaled = xPositionScale(d.Abbr)

              if (d.geometry.type === "MultiPolygon") {
                return (toMovePathXScaled - currentPathX) + 105
              } else {
                return (toMovePathXScaled - currentPathX) + 105
              }
            })
            .attr("y", function(d) {
              var currentPathY = document.getElementsByClassName(d.State)[0].getBoundingClientRect().y
              var toMovePathYScaled = yPositionScale(+d.Pop)

              if (d.geometry.type === "MultiPolygon") {
                return (toMovePathYScaled - currentPathY) - 19
              } else {
                return (toMovePathYScaled - currentPathY) - 19
              }
            })
      }, 2150)
    
      d3.selectAll("#chart1-scatterplot").on('click', null)
      d3.selectAll("#chart1-map").on('click', updateMap)

    }// END of createCircle()

    function updateMap() {
      mainG.selectAll(".changed")
          .transition()
          .duration(500)
          .attr("class", "init")
          .attr("opacity", 0)

      mainG.selectAll(".legendCircles")
          .transition()
          .duration(2500)
          .attr("opacity", 1)
          
      mainG.selectAll(".legendTexts")
          .transition()
          .duration(2500)
          .attr("opacity", 1)

      stateSvg
        .transition()
        .duration(2000)
        .attr("x", 0)
        .attr("y", -90)

      stateShapes
        .style("stroke", "none")
        .transition()
        .duration(2000)
        .style("fill", function(d){
          return color(+d.Percent)
        })
        .attr("d", path)
        .style("stroke", "none")
        .attr("transform", "translate(0,0)")


      d3.selectAll("#chart1-scatterplot").on('click', null)      
      d3.selectAll("#chart1-map").on('click', null)
      d3.selectAll("#chart1-scatterplot").on('click', createCircles)
    }// END of updateMap()

    d3.select("#chart1-map")
      .on("click", updateMap)
    d3.select("#chart1-scatterplot")
      .on("click", createCircles)

  }//END of main ready function

})();