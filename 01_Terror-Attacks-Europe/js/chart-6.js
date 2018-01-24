(function(){
  
  var margin = { top: 35, left: 20, right: 50, bottom: 15},
  height = 400 - margin.top - margin.bottom,
  width = 360 - margin.left - margin.right;

  var container = d3.select("#chart-6")
    .style("margin-left", "")
    .style("margin-right", "")
    .style("background-color", "")

  var xPositionScale = d3.scaleLinear()
    .range([0, width])
  var yPositionScale = d3.scaleLinear()
    .range([height, 0])

  var colorScale = d3.scaleOrdinal()
    .range(['#450303', '#6e0505', '#951f1f', '#d09b9b', '#ad5151', '#e7cdcd'])
  

  d3.queue()
    .defer(d3.csv, "csv/04_GTD-2013-2016_v05-AllCountries-per-Population-13-16.csv")
    .await(ready)

  function ready(error, datapoints) {
    var casualties2013Max = d3.max(datapoints, function(d){
      return ((+d.nkill_2013 + +d.nwound_2013) / d.population_2016) * 100000
    })

    var casualties2016Max = d3.max(datapoints, function(d){
      return ((+d.nkill_2016 + +d.nwound_2016) / d.population_2016) * 100000
    })

    var casualtiesMax
    if (casualties2013Max >= casualties2016Max) {
      casualtiesMax = casualties2013Max
    } else {
      casualtiesMax = casualties2016Max
    }

    var killsPerPopMax = d3.max(datapoints, function(d){
      return +d.kills_per_pop
    })

    yPositionScale
      .domain([0, casualtiesMax])


    var regions = d3.map(datapoints, function(d){
          return d.regions
        }).keys().sort()

    colorScale
      .domain(regions)

    var nested = d3.nest()
      .key(function(d) {
        return d.regions; 
      })
      .entries(datapoints)
      .sort(function(a, b){
         return d3.ascending(a.key, b.key); 
     })

    container.selectAll("svg")
      .data(nested)
      .enter().append("svg")
      .attr("class", function(d){
        return "svg-class-" + d.key.split(' ')[0]
      })
      .style("background-color", "")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", function(d){
        if ( d.key === 'Africa & Middle East') {
          return width*0.57
        } else if ( d.key === 'South America') {
          return width*0.53
        } else {
          return width*0.5
        }
      })
      .append("g")
      .attr("transform", function(d){
        if ( d.key === 'Africa & Middle East' ) {
          return "translate(0,0)"
        } else {
          return "translate(-15,0)"
        }
      })
      .style("background-color", "red")
      .each(function(d){
        var g = d3.select(this)

        g.append("rect")
          .attr("transform", "translate(0,5)")
          .attr("fill", function(d){
            return colorScale(d.key)
          })
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width - width*0.4 + 10)
          .attr("height", 20)


        g.append("text")
          .attr("class", "multiples-title")
          .text(d.key)
          .attr("x", width*0.3)
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .attr("fill", function(d){
            return "white"
          })
          .attr("stroke-width", 10)

        var gNested = g.append("g")
          .attr("transform", "translate(0,0)")

        var tickValuesArray = Array.apply(10, {length: 8}).map(function(value, index){
          return 0 + index * 10;
        });

        var gridLines = -(margin.right + width/2.8 - margin.left)

        if (d.key === 'Africa & Middle East'){
          var yAxisLeft = d3.axisLeft(yPositionScale).tickSize(gridLines)
          .tickValues(tickValuesArray)
        } else {
          var yAxisLeft = d3.axisLeft(yPositionScale).tickSize(gridLines).tickValues(1)
        }

        gNested.append("g")
          .attr("class", "axis-y-axis-left")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(yAxisLeft);


        if (d.key === 'South America'){
          var yAxisRight = d3.axisRight(yPositionScale).tickSize(gridLines)
          .tickValues(tickValuesArray)
        } else {
          var yAxisRight = d3.axisRight(yPositionScale).tickSize(gridLines)
          .tickValues(tickValuesArray)
        }

        var yAxisRightxPosition = margin.right + width/2.8
        gNested.append("g")
          .attr("class", "axis-y-axis-right")
          .attr("transform", "translate(" + yAxisRightxPosition + "," + margin.top + ")")
          .call(yAxisRight)
          .attr("opacity", "")



        gNested.selectAll(".circle-victims-2013")
          .data(d.values)
          .enter().append("circle")
          .attr("class", function(k){
            return "circle-victims-2013 " + k.country_txt
          })
          .attr("r", 3)
          .attr("fill", function(k){
            var casualties2013 = ((+k.nkill_2013 + +k.nwound_2013) / k.population_2016) * 100000
            var casualties2016 = ((+k.nkill_2016 + +k.nwound_2016) / k.population_2016) * 100000
            var casualtiesDiffColor

            if (casualties2016 === casualties2013) {
              casualtiesDiffColor = '#f4d03f'
            } else if (casualties2016 > casualties2013) {
              casualtiesDiffColor = '#ec7063'
            } else if (casualties2016 < casualties2013) {
              casualtiesDiffColor = '#52be80'
            }

            return casualtiesDiffColor
          })
          .attr("cx", margin.left)
          .attr("cy", function(k){
            var casualties2013 = ((+k.nkill_2013 + +k.nwound_2013) / k.population_2016) * 100000
            return yPositionScale(casualties2013) + margin.top
          })


        gNested.selectAll(".circle-victims-2016")
          .data(d.values)
          .enter().append("circle")
          .attr("class", function(k){
            return "circle-victims-2016 " + k.country_txt
          })
          .attr("r", 3)
          .attr("fill", function(k){
            var casualties2013 = ((+k.nkill_2013 + +k.nwound_2013) / k.population_2016) * 100000
            var casualties2016 = ((+k.nkill_2016 + +k.nwound_2016) / k.population_2016) * 100000
            var casualtiesDiffColor

            if (casualties2016 === casualties2013) {
              casualtiesDiffColor = '#f4d03f'
            } else if (casualties2016 > casualties2013) {
              casualtiesDiffColor = '#ec7063'
            } else if (casualties2016 < casualties2013) {
              casualtiesDiffColor = '#52be80'
            }

            return casualtiesDiffColor
          })
          .attr("cx", margin.right + width/2.8)
          .attr("cy", function(k){
            var casualties2016 = ((+k.nkill_2016 + +k.nwound_2016) / k.population_2016) * 100000
            return yPositionScale(casualties2016) + margin.top
          })




        gNested.selectAll("line-victims-diff")
          .data(d.values)
          .enter().append("line")
          .attr("class", function(k){
            return "line-victims-diff " + k.country_txt
          })
          .attr("x1", margin.left)
          .attr("y1", function(k){
            var casualties2013 = ((+k.nkill_2013 + +k.nwound_2013) / k.population_2016) * 100000
            return yPositionScale(casualties2013) + margin.top
          })
          .attr("x2", margin.right + width/2.8)
          .attr("y2", function(k){
            var casualties2016 = ((+k.nkill_2016 + +k.nwound_2016) / k.population_2016) * 100000
            return yPositionScale(casualties2016) + margin.top
          })
          .attr("stroke", function(k){
            var casualties2013 = ((+k.nkill_2013 + +k.nwound_2013) / k.population_2016) * 100000
            var casualties2016 = ((+k.nkill_2016 + +k.nwound_2016) / k.population_2016) * 100000
            var casualtiesDiffColor

            if (casualties2016 === casualties2013) {
              casualtiesDiffColor = '#f4d03f'
            } else if (casualties2016 > casualties2013) {
              casualtiesDiffColor = '#ec7063'
            } else if (casualties2016 < casualties2013) {
              casualtiesDiffColor = '#52be80'
            }

            return casualtiesDiffColor
          })


      })


  }
  
})();