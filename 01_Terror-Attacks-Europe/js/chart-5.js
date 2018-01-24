(function() {

  var margin = { top: 50, left: 50, right: 85, bottom: 0};
  var height = 600 - margin.top - margin.bottom;

  var svg_width = window.innerWidth;
  var width = svg_width/1.1 - margin.left - margin.right;
  
  var svg = d3.select("#chart-5")
      .append("svg")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(0,0)")

  var colorScale = d3.scaleOrdinal()
    .range(['#450303', '#6e0505', '#951f1f', '#d09b9b', '#ad5151', '#e7cdcd'])

  var continentScale = d3.scaleOrdinal()
    .range([width * 0.2,
            width * 0.4,
            width * 0.55, 
            width * 0.7,
            width * 0.8,
            width * 0.9])

  var yPositionScale = d3.scaleLinear()
    .domain([1,50])
    .range([height/2 - 30, height/2 + 30])
  var radiusScale = d3.scaleSqrt()
    .range([1,75])

  d3.queue()
    .defer(d3.csv, "csv/04_GTD-2013-2016_v04-AllCountries-Populations.csv")
    .await(ready)

  function ready(error, datapoints){

    var regions = d3.map(datapoints, function(d){
      return d.regions
    }).keys().sort()

    colorScale
      .domain(regions)
    continentScale
      .domain(['Africa & Middle East', 'Asia', 'Europe & Russia', 'South America', 'North & Central America', 'Australasia & Oceania'])


    var countries = datapoints.map(function(d){
      return d.country_txt
    })

    var killsPerPopMax = d3.max(datapoints, function(d){
      return +d.kills_per_pop
    })

    var killsPerPopMin = d3.min(datapoints, function(d){
      if (+d.kills_per_pop > 0) {
        return +d.kills_per_pop
      }
    })

    radiusScale
      .domain([killsPerPopMin, killsPerPopMax])

    var simulation = d3.forceSimulation()
      .force('x', d3.forceX(function(d){
        return continentScale(d.regions)
      }).strength(0.03))
      .force('y', d3.forceY(function(d){
        return height/2
      }).strength(0.03))
      .force('collide', d3.forceCollide(function(d){
        return radiusScale(+d.kills_per_pop)
      }))

    var circles = svg.selectAll(".country-circles")
      .data(datapoints)
      .enter().append("circle")
      .attr("class", "country-circles")
      .attr("r", function(d){
        return radiusScale(+d.kills_per_pop)
      })
      .attr("fill", function(d){
        return colorScale(d.regions)
      })
      .attr('stroke', '')

    simulation.nodes(datapoints)
      .on('tick', ticked5)


    datapoints.forEach(function(d){
      d.x = continentScale(d.regions)
      d.y = yPositionScale(countries.indexOf(d.country_txt))
    })

    function ticked5() {
      circles
        .attr("cx", function(d){
          return d.x
        })
        .attr("cy", function(d){
          return d.y
        })
    }



    var title = svg.append("text")
      .attr("class", 'text-title')
      .text('Africa, Middle East and Asia Are Terrorism\'s Battlegrounds')
      .attr('width', 10)
      .attr('x', width/1.8)
      .attr('y', 35)
      .attr('font-size', '23px')
      .attr('text-anchor', 'middle')

    var source = svg.append("text")
      .attr("class", 'text-source')
      .text('Total Fatalities and Wounded per 100,000 residents for Countries with at least 1 Victim for 2013-2016.')
      .attr('width', 10)
      .attr('x', width/1.8)
      .attr('y', height + margin.top + margin.bottom - 45)
      .attr('font-size', '14px')
      .attr("text-anchor", 'middle')
    var source2 = svg.append("text")
      .attr("class", 'text-source')
      .text('Source: Global Terrorism Database - University of Maryland. Populations 2016 Estimates from World Bank.')
      .attr('width', 10)
      .attr('x', width/1.8)
      .attr('y', height + margin.top + margin.bottom - 30)
      .attr('font-size', '14px')
      .attr("text-anchor", 'middle')
    var source3 = svg.append("text")
      .attr("class", 'text-source')
      .text('Taiwan 2017 Population Estimate from Republic of China\'s Statistical Bureau.')
      .attr('width', 10)
      .attr('x', width/1.8)
      .attr('y', height + margin.top + margin.bottom - 15)
      .attr('font-size', '14px')
      .attr("text-anchor", 'middle')

    
    var legendCountries = svg.selectAll(".legend-countries-text")
      .data(regions)
      .enter().append("text")
      .attr("class", "legend-countries-text")
      .attr("y", height - 80)
      .attr("text-anchor", "middle")
      .each(function (d, i) {
          var lines = wordwrap(d)
          for (var i = 0; i < lines.length; i++) {
            d3.select(this).append("tspan")
                .attr("dy",13)
                .attr("x",function(d) { 
                   return continentScale(d)
                 })
                .text( function() {
                  if ( lines.length > 1 && i===0){
                    return lines[i] + " &"
                  } else {
                    return lines[i]
                  }
                })
          }
        })

    function wordwrap(text) {
      var lines=text.split("& ")
      return lines
    }


  }

})();