(function() {

  
  var margin = { top: 15, left: 450, right: 450, bottom: 5}
  var height = 610 - margin.top - margin.bottom
  var width = window.innerWidth - margin.left - margin.right

  var container = d3.select("#chart-1")
    .style("margin-left", "-25%")
    .style("margin-right", "")
    .style("background-color", "")


  var svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top - margin.bottom) + ")")

  var parseTime = d3.timeParse("%Y")

  var stack = d3.stack()
    .keys([
      "Null",
      "Certain conditions originating in the perinatal period",
      "Complications of pregnancy childbirth and the puerperium",
      "Congenital anomalies",
      "Diseases of the blood and bloodforming organs",
      "Diseases of the circulatory system",
      "Diseases of the digestive system",
      "Diseases of the genitourinary system",
      "Diseases of the musculoskeletal system and connective tissue",
      "Diseases of the nervous system and sense organs",
      "Diseases of the respiratory system",
      "Diseases of the skin and subcutaneous organs",
      "Endocrine nutritional and metabolic diseases and immunity disorders",
      "Infectious and parasitic diseases",
      "Injury and poisoning",
      "Mental illness",
      "Neoplasms",
      "Residual codes unclassified all E codes",
      "Symptoms signs and illdefined conditions"
      ])
    .order(d3.stackOrderInsideOut)
    .offset(d3.stackOffsetWiggle);

  d3.queue()
    .defer(d3.csv, "csv/blended-account_Expenditures-Blended_Second_pivoted_real.csv", function(d){
      d.datetime = parseTime(d.Year)
      return d
    })
    .await(ready)

  function ready(error, datapoints){

    var series = stack(datapoints);

    var xPositionScale = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(datapoints, function(d){
        return d.datetime; 
        })
      )

    var yPositionScale = d3.scaleLinear()
      .domain([-700, d3.max(series, function(layer) { 
        return d3.max(layer, function(d){ 
          return +d[0] + +d[1];
        }); 
      }) + 200])
      .range([height, 0])


    var area = d3.area()
      .x(function(d) {
        if (xPositionScale(d.data.datetime) === xPositionScale(parseTime(2014))) {
          return xPositionScale(d.data.datetime) + 1.5;
        } else {
          return xPositionScale(d.data.datetime);
        }
      })
      .y0(function(d) { 
        return yPositionScale(d[0] * 2); 
      })
      .y1(function(d) {
       return yPositionScale(d[1] * 2); 
      })
      .curve(d3.curveCardinal);

   var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%Y"))
                  .tickSize(-(height - 30)).tickValues([parseTime(2000), parseTime(2005), parseTime(2009), parseTime(2014)])
      
    svg.append("g")
      .attr("class", "axis-x-axis")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(xAxis);

    d3.selectAll(".tick text")
      .attr("transform", "translate(0,10)")


    var color = d3.scaleOrdinal()
          .range(['#c9bbb6', '#A1887F', '#CFD8DC', '#B0BEC5', '#3E2723', '#795548', '#607D8B', '#37474F', '#546E7A', '#4E342E', '#90A4AE', '#5D4037', '#8D6E63', '#6D4C41', '#78909C', '#455A64', '#BCAAA4', '#263238'])

    svg.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("class", function(d){
          return d.key
        })
        .attr("d", area)
        .style("fill", function(d) { 
          return color(d); 
        })
        .on("mouseenter", function(d){
          var element = d3.select(this)

          svg.selectAll("path")
            .style("fill", function(k){
              if (k.key === element['_groups'][0][0]['classList']['value']){
                return color(k)
              } else {
                return color(k)
              }
            })
            .attr("opacity", function(k){
              if (k.key === element['_groups'][0][0]['classList']['value']){
                return 1
              } else {
                return 0.3
              }
            })

          svg.selectAll(".hover-deseases-text")
            .attr("class", "hover-deseases-text-hovered")
            .style("font", "Arial")
            .text(function(k){
              return element['_groups'][0][0]['classList']
            })

          svg.selectAll(".hover-amounts-text")
            .attr("class", "hover-amounts-text-hovered")
            .text(function(k){
              var dataArray = element['_groups'][0][0]['__data__']
              var totalSum = 0

              for (i = 0; i < dataArray.length; i++) { 
                  totalSum += +dataArray[i]['data'][d.key]
              }
              return "$ " + d3.format(",.2f")(totalSum)
            })

        })
        .on("mouseout", function(d){
          var element = d3.select(this)

          svg.selectAll("path")
            .style("fill", function(k){
              if (k.key === element['_groups'][0][0]['classList']['value']){
                return color(k)
              } else {
                return color(k)
              }
            })
            .attr("opacity", function(k){
              if (k.key === element['_groups'][0][0]['classList']['value']){
                return 1
              } else {
                return 1
              }
            })

          svg.selectAll(".hover-deseases-text-hovered")
            .attr("class", "hover-deseases-text")
            .text("hover over chart for details")
          svg.selectAll(".hover-amounts-text-hovered")
            .attr("class", "hover-amounts-text")
            .text("hover over chart for details")
            

        })


    svg.append("text")
      .attr("class", "points-first")
      .attr("x", -15)
      .attr("y", 494)
      .text("0")

    svg.append("text")
      .attr("class", "points-second")
      .attr("x", -70)
      .attr("y", 97)
      .text("$1,379 bn")

    svg.append("text")
      .attr("class", "points-third")
      .attr("x", width + 8)
      .attr("y", 34)
      .text("$1,800 bn")


    svg.append("text")
      .attr("class", "points-fourth")
      .attr("x", width + 8)
      .attr("y", height - 40)
      .text("0")

    


    svg.append("g")
      .attr("class", "hover-title")
      .attr("transform", "translate(" + (width + 150) + "," + (height * 0.06) + ")")
      .append("text")
      .each(function(d){
        var textElement = d3.select(this)

        var paragraph = "Between 2000 and 2014, United States has spent over $28.8 tn in health services (if adjusted for inflation; $26.9 tn in nominal values), according to data from the Bureau of Economic Analysis. BEA\'s dataset breaks down by disease over $23.8 tn spent on medical services (the rest has been spent on dental services, nursing homes, medical products and equipment). The total amount spent in health and treatment services might indicate which type of diseases have been on the rise."

        var words = paragraph.split(/\s+/).reverse()
        var word
        var line = []
        var lineNumber = 0
        var lineHeight = 1.2 // ems
        var y = textElement.attr("y")
        var dy = parseFloat(textElement.attr("dy"))
        var tspan = textElement.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + "em")
        
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > 300) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = textElement.append("tspan").attr("x", 0).attr("y", y).attr("dy", + lineHeight + "em").text(word);
          }
        }

      })


    svg.append("g")
      .attr("class", "hover-deseases")
      .attr("transform", "translate(" + (width + 150) + "," + (height * 0.55) + ")")
      .append("text")
      .attr("class", "hover-deseases-type")
      .text("Type of Disease:")
      
    svg.select(".hover-deseases")
      .append("text")
      .attr("transform", "translate(0," + (20) + ")")
      .attr("class", "hover-deseases-text")
      .text("hover over chart for details")


    svg.append("g")
      .attr("class", "hover-amounts")
      .attr("transform", "translate(" + (width + 150) + "," + (height * 0.65) + ")")
      .append("text")
      .attr("class", "hover-amounts-type")
      .text("Total Amount (bn, 2000-2014):")
      
    svg.select(".hover-amounts")
      .append("text")
      .attr("transform", "translate(0," + (20) + ")")
      .attr("class", "hover-amounts-text")
      .text("hover over chart for details")


    svg.append("g")
      .attr("class", "source")
      .attr("transform", "translate(" + (width + 150) + "," + (height * 0.75) + ")")
      .append("text")
      .text("Source:")

   svg.append("g")
        .attr("transform", "translate(" + (width + 150) + "," + (height * 0.75) + ")")
        .attr("class", "source-link")
        .style("fill", "gray")
        .append("text")
        .each(function(d){
        var textElement = d3.select(this)
        
        var paragraph = "U.S. Bureau of Economic Analysis - Health Care Satellite Account"

        var words = paragraph.split(/\s+/).reverse()
        var word
        var line = []
        var lineNumber = 0
        var lineHeight = 1.2 // ems
        var y = textElement.attr("y")
        var dy = parseFloat(textElement.attr("dy"))
        var tspan = textElement.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + "em")
        
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > 300) {
            line.pop();
            tspan.text(line.join(" ")).on("click", function() { window.open("https://www.bea.gov/national/health_care_satellite_account.htm?demetriospogkas.com"); });
            line = [word];
            tspan = textElement.append("tspan").attr("x", 0).attr("y", y).attr("dy", + lineHeight + "em").text(word).on("click", function() { window.open("https://www.bea.gov/national/health_care_satellite_account.htm"); });
          }
        }

      })

  }

})();