(function() {
  var margin = { top: 20, left: 10, right: 20, bottom: 20}
  var height = 500 - margin.bottom
  var width = 700 - margin.right

svg = d3.select("#chart")
      .append("svg")
      .attr("height", height)
      .attr("width", width)
      .style("background-color", "")

svgG = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("background-color", "orange")

// http://jim-nielsen.com/teamcolors/
var nbaTeamsColours = d3.scaleOrdinal()
  .domain(['ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK', 'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS'])
  .range(['#E13A3E', '#008348', '#061922', '#1D1160', '#CE1141', '#860038', '#007DC5', '#4D90CD', '#ED174C', '#FDB927', '#CE1141', '#FFC633', '#ED174C', '#FDB927', '#0F586C', '#98002E', '#00471B', '#005083', '#002B5C', '#006BB6', '#007DC3', '#007DC5', '#ED174C', '#E56020', '#E03A3E', '#724C9F', '#BAC3C9', '#CE1141', '#002B5C', '#002B5C'])

var nbaDivsColours = d3.scaleOrdinal()
  .domain(['ATL', 'CNT', 'NW', 'PAC', 'SE', 'SW'])
  .range(['#d7191c','#fdae61','#e5e5ab','#abdda4','#2b83ba'])
var xPositionAllPl = d3.scaleLinear()
                    .domain([0, 486])
                    .range([0, width])
var yPositionAllPl = d3.scaleLinear()
          .domain([0, 270])
          .range([0, height])


var xPositionScatter = d3.scaleLinear()
        .domain([65, 90])
        .range([0, width])

var yPositionScatter = d3.scaleLinear()
        .domain([0, 15])
        .range([(height - 100), 0])

var averyW = 260 * 0.64
var averyH = 190 * 0.64
var averyX = width * 0.15
var averyY = height * 0.1
var averyCardX = width * 0.2 + 20
var averyCardY = height * 0.39

var avery = svg
      .append("image")
      .attr("xlink:href", "images/avery.png")
      .attr("x", averyX)
      .attr("y", averyY)
      .attr("width", averyW)
      .attr("height", averyH)
      .attr("opacity", 0)

var averyCard = svg
      .append("g")
      .attr("class", "averyCard")
      .attr("opacity", 0)
    averyCard
      .append("text")
      .text("BOS | 2016-7")
      .attr("opacity", 1)
      .attr("x", averyCardX)
      .attr("y", averyCardY)
    averyCard
      .append("text")
      .text("26yo | 6'4\"")
      .attr("opacity", 1)
      .attr("x", width * 0.2 + 16.5)
      .attr("y", height * 0.39 + (20 *1))
    averyCard
      .append("text")
      .text("6.1 RPG | 16.3 PPG | 55 GP")
      .attr("opacity", 1)
      .attr("x", (width * 0.1) + 7.5)
      .attr("y", height * 0.39  + (20 * 2))

var tallest = svg
      .append("g")
      .attr("class", "tallest")
      .attr("opacity", 0)
    tallest
      .append("text")
      .text("Whiteside (MIA)")
      .attr("x", 540 - 15)
      .attr("y", 30)
    tallest
      .append("text")
      .text("DeAndre Jordan (LAC)")
      .attr("x", 350 - 15)
      .attr("y", 35)
    tallest
      .append("text")
      .text("Porzingis (NYK)")
      .attr("x", 555 - 15)
      .attr("y", 202)
    tallest
      .append("text")
      .text("Gobert (UTA)")
      .attr("x", 565 - 15)
      .attr("y", 63)
    tallest
      .append("text")
      .text("Howard (ATL)")
      .attr("x", 402 - 15)
      .attr("y", 70)

var heightsAxis = svgG
      .append("g")
      .attr("class", "axes-heights")
      .attr("opacity", 0)
    heightsAxis
      .append("text")
      .text("5'10\"")
      .attr("x", xPositionScatter(70))
      .attr("y", height * 0.85)
    heightsAxis
      .append("text")
      .text("6'3\"")
      .attr("x", xPositionScatter(75))
      .attr("y", height * 0.85)
    heightsAxis
      .append("text")
      .text("6'8\"")
      .attr("x", xPositionScatter(80))
      .attr("y", height * 0.85)
    heightsAxis
      .append("text")
      .text("7'1\"")
      .attr("x", xPositionScatter(85))
      .attr("y", height * 0.85)

var rebsAxis = svgG
      .append("g")
      .attr("class", "axes-heights")
      .attr("opacity", 0)
    rebsAxis
      .append("text")
      .text("12 RPG")
      .attr("y", yPositionScatter(12))
      .attr("x", width * 0.9)
    rebsAxis
      .append("text")
      .text("8")
      .attr("y", yPositionScatter(8))
      .attr("x", width * 0.9)
    rebsAxis
      .append("text")
      .text("4")
      .attr("y", yPositionScatter(4))
      .attr("x", width * 0.9)
    rebsAxis
      .append("text")
      .text("0")
      .attr("y", yPositionScatter(0))
      .attr("x", width * 0.9)

var parseTime = d3.timeParse("%Y")


  d3.queue()
    .defer(d3.csv, "data/FINAL_All-Players_Divisions.csv")
    .defer(d3.csv, "data/Avery_2010-2017_Stats.csv", function(d) {
      d.datetime = parseTime(+d.Year)
      return d
    })
    .await(ready)

  function ready(error, everyplayer, averystats) {
    var playersByTeam = everyplayer.sort(function(x, y){
       return d3.ascending(x.TEAM_ABBREVIATION, y.TEAM_ABBREVIATION);
    })

    var allPlayers = svgG.selectAll("#all-players")
        .data(playersByTeam)
        .enter().append("circle")
        .attr("class", function(d) {
          return d.PLAYER_ID
        })
        .attr("id", function(d){
          return d.PLAYER_NAME + "-" + d.TEAM_ABBREVIATION
        })
        .attr("r", 7)
        .attr("fill", function(d) {
            return nbaTeamsColours(d.TEAM_ABBREVIATION)
          })
        .attr("opacity", 1)
        .attr("cx", function(d, i){
          // https://bocoup.com/blog/smoothly-animate-thousands-of-points-with-html5-canvas-and-d3
          return xPositionAllPl(15 * (i % 30))
        })
        .attr("cy", function(d, i){
          return yPositionAllPl(15 * Math.floor(i / 30))
        })

    var xPositionAvery = d3.scaleLinear()
            .domain(d3.extent(averystats, function(d) { 
              return d.datetime; 
            }))
            .range([20, width * 0.85])
    var yPositionAvery = d3.scaleLinear()
            .domain([0.5, 6.5])
            .range([(height - 100), 0])
    var rbsLine = d3.line()
            .x(function(d){
              return xPositionAvery(d.datetime)
            })
            .y(function(d){
              return yPositionAvery(d.REB)
            })
            .curve(d3.curveCardinal.tension(0.7))

    var averyRebsLine = svgG
          .append("g")
          .append("path")
          .datum(averystats)
          .attr("d", rbsLine)
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("opacity", 0)

    var averyRebsCircles = svgG
          .append("g")
          .selectAll(".avery-in-years")
          .data(averystats)
          .enter().append("circle")
          .attr("class", function(d) {
            return "avery-year-" + d.Year
          })
          .attr("cx", function(d) {
            return xPositionAvery(d.datetime)
          })
          .attr("cy", function(d) {
            return yPositionAvery(d.REB)
          })
          .attr("r", 7)
          .attr("opacity", 0)

    var averyRebsAxes = svgG
          .append("g")
          .attr("opacity", 0)
          .attr("class", "axes-heights")
        averyRebsAxes
          .append("text")
          .text("2010")
          .attr("x", xPositionAvery(parseTime(2010)) - 15)
          .attr("y", height * 0.9)
        averyRebsAxes
          .append("text")
          .text("2013")
          .attr("x", xPositionAvery(parseTime(2013)) - 15)
          .attr("y", height * 0.9)
        averyRebsAxes
          .append("text")
          .text("2017")
          .attr("x", xPositionAvery(parseTime(2017)) - 15)
          .attr("y", height * 0.9)
        averyRebsAxes
          .append("text")
          .text("6 RPG")
          .attr("x", width * 0.9)
          .attr("y", yPositionAvery(6))
        averyRebsAxes
          .append("text")
          .text("3")
          .attr("x", width * 0.9)
          .attr("y", yPositionAvery(3))
        averyRebsAxes
          .append("text")
          .text("0")
          .attr("x", width * 0.9)
          .attr("y", yPositionAvery(0))


    var averyDot = allPlayers
          .filter(function(d) {
            return d.PLAYER_NAME == "Avery Bradley"
          })

    var avery2016 = d3.select(".avery-year-2016")
          .remove()

    allPlayers
      .filter(function(d) {
        return +d.PLAYER_HEIGHT_INCHES >= 82 && +d.RPG >= 7
      })
      .raise()

    d3.select("#intermediate")
        .on('stepin', function(){
          allPlayers
            .transition()
            .duration(1500)
            .attr("cx", function(d, i){
            return xPositionAllPl(15 * (i % 30))
            })
        })

    d3.select("#with-pos")
        .on('stepin', function(){
          allPlayers
            .transition()
            .duration(1500)
            .attr("cx", function(d, i){
              if (d.POSITION === "N") {
                return 900
              } else {
                return xPositionAllPl(15 * (i % 30))
              }
            })
        })// END of stepin with-pos

    d3.select("#over-12-mpg")
        .on('stepin', function(){
          allPlayers
            .transition()
            .duration(1500)
            .attr("cx", function(d, i){
              if (+d.MPG < 12 || d.POSITION === "N") {
                return 900
              } else {
                return xPositionAllPl(15 * (i % 30))
              }
            })
            .attr("cy", function(d, i){
              return yPositionAllPl(15 * Math.floor(i / 30))
            })

          heightsAxis
            .transition()
            .duration(1500)
            .attr("opacity", 0)

          rebsAxis
            .transition()
            .duration(1500)
            .attr("opacity", 0)
        })// END of stepin over-12-mpg


    d3.select("#scatter")
        .on('stepin', function(){
          allPlayers
            .transition()
            .duration(1500)
            .attr("fill", function(d) {
              return nbaTeamsColours(d.TEAM_ABBREVIATION)
            })
            .attr("cx", function(d, i){
              if (+d.MPG < 12 || d.POSITION === "N") {
                return 900
              } else {
                return xPositionScatter(d.PLAYER_HEIGHT_INCHES)
              }
            })
            .attr("cy", function(d) {
              return yPositionScatter(+d.RPG)
            })


          tallest
            .transition()
            .duration(1500)
            .attr("opacity", 0)

          heightsAxis
            .transition()
            .duration(1500)
            .attr("opacity", 0.5)

          rebsAxis
            .transition()
            .duration(1500)
            .attr("opacity", 0.5)
        })// END of scatter



    function conference() {
       allPlayers
        .transition()
        .duration(1000)
        .attr("fill", function(d){
          if (d.CONFERENCE === "E") {
            return "#CE0B28"
          } else {
            return "#1D4289"
          }
        }) 
    }
    d3.select("#conference")
        .on('stepin', conference)

    function division() {
        allPlayers
          .transition()
          .duration(1000)            
          .attr("fill", function(d){
            return nbaDivsColours(d.DIVISION)
          })

        tallest
            .transition()
            .duration(1500)
            .attr("opacity", 0)

        rebsAxis
          .transition()
          .duration(1500)
          .attr("opacity", 0.5)
    }
    d3.select("#division")
        .on('stepin', division)



    d3.select("#scatter-highest")
        .on('stepin', function(){
          allPlayers
            .transition()
            .duration(1500)
            .attr("fill", function(d, i){
              if (+d.PLAYER_HEIGHT_INCHES >= 82 && +d.RPG >= 7) {
                return "#0B143B"
              } else {
                return "#e5e8e6"
              }
            })
            .attr("cy", function(d) {
              return yPositionScatter(+d.RPG)
            })

          tallest
            .transition()
            .duration(1500)
            .attr("opacity", 1)

          rebsAxis
            .transition()
            .duration(1500)
            .attr("opacity", 0)

        })// END of stepin scatter-highest


        d3.select("#scatter-russell")
          .on('stepin', function(){
            avery
              .transition()
              .duration(1000)
              .attr("opacity", 0)
            averyCard
              .transition()
              .duration(1000)
              .attr("opacity", 0)

            allPlayers
              .transition()
              .duration(1000)
              .attr("opacity", 1)
              .attr("fill", function(d, i){
                if (d.PLAYER_NAME === "Russell Westbrook") {
                  return "#0B143B"
                } else {
                  return "#e5e8e6"
                }
              })
              .attr("cy", function(d) {
                return yPositionScatter(+d.RPG)
              })

              tallest
                .transition()
                .duration(1500)
                .attr("opacity", 0)

              rebsAxis
                .transition()
                .duration(1500)
                .attr("opacity", 0.5)

        })// END of stepin scatter-russell

      d3.select("#scatter-shortest")
          .on('stepin', function(){
            allPlayers
              .transition()
              .duration(1000)
              .attr("fill", function(d, i){
                if (d.PLAYER_NAME === "Avery Bradley") {
                  return "#0B143B"
                } else {
                  return "#e5e8e6"
                }
              })
              .attr("cy", function(d) {
                return yPositionScatter(+d.RPG)
              })
              .attr("opacity", 1)

            rebsAxis
              .transition()
              .duration(1500)
              .attr("opacity", 0.5)

            heightsAxis
              .transition()
              .duration(1500)
              .attr("opacity", 0.5)

            avery
              .transition()
              .duration(1000)
              .attr("opacity", 1)
              .attr("x", averyX)
              .attr("y", averyY)

            averyCard
              .transition()
              .duration(1000)
              .attr("opacity", 1)
              .attr("transform", "translate(0,0)")


            averyRebsLine
              .transition()
              .duration(1500)
              .attr("opacity", 0)           

            averyRebsCircles
              .transition()
              .duration(1500)
              .attr("opacity", 0)

            averyRebsAxes
              .transition()
              .duration(1500)
              .attr("opacity", 0)

            averyDot
              .transition()
              .duration(1500)
              .attr("fill", "#0B143B")
              .attr("cx", xPositionScatter(averyDot['_groups'][0][0]['__data__'].PLAYER_HEIGHT_INCHES))
              .attr("cy", yPositionScatter(averyDot['_groups'][0][0]['__data__'].RPG))

          })// END of stepin scatter-shortest


      d3.select("#avery-history")
          .on("stepin", function(){

            allPlayers
              .transition()
              .duration(1500)
              .attr("opacity", 0)

            rebsAxis
              .transition()
              .duration(1500)
              .attr("opacity", 0)

            heightsAxis
              .transition()
              .duration(1500)
              .attr("opacity", 0)              

            averyRebsLine
              .transition()
              .duration(1500)
              .attr("opacity", 1)           

            averyRebsCircles
              .transition()
              .duration(1500)
              .attr("opacity", 1)

            averyRebsAxes
              .transition()
              .duration(1500)
              .attr("opacity", 0.5)

            averyDot
              .transition()
              .duration(1500)
              .attr("cx", xPositionAvery(parseTime(2016)))
              .attr("cy", yPositionAvery(averyDot['_groups'][0][0]['__data__'].RPG))

          })


  } // END of ready func

})();