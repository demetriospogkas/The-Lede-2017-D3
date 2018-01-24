(function() {
  d3.queue()
  .defer(d3.csv, "data/stocks_texts.csv")
  .await(ready);

  function ready(error, stockTexts) {

    var selectAllButtons = d3.selectAll(".buttons")

    var buttonsNodeList = selectAllButtons['_groups'][0]
    
    var successNumber = 0;
    var failNumber = 0;

    d3.selectAll(buttonsNodeList)
        .each(function(d, i){

          var buttonsDiv = d3.select(this)
          buttonsDiv
            .attr("class", "buttons buttons" + i)
            .style("background-color", "")

          var mainSvgW = 930
          var mainSvgH = 400
          var svgColorB = ""
          var svgOpacityB = 1
          var svgTextB = ""
          var svgTextOpacityB = 0
          var svgColorA = "white"
          var svgOpacityA = 0.85
          var svgTextOpacityA = 1

          var subSvg = buttonsDiv
                .append("svg")
                .attr("width", "110%")
                .attr("height", mainSvgH)
                .style("background-color", svgColorB)
                .style("position", "absolute")
                .style("margin-left", "-50%")
                .style("margin-top", "-480px")
                .attr("opacity", svgOpacityB)
                .attr("class", "subSvg" + i)

          var abvSvg = buttonsDiv
                .append("svg")
                .attr("width", "110%")
                .attr("height", mainSvgH)
                .style("background-color", svgColorB)
                .style("position", "absolute")
                .style("margin-left", "-50%")
                .style("margin-top", "-480px")
                .attr("opacity", svgOpacityB)
                .attr("class", "abvSvg" + i)

          var textOne = abvSvg
                .append("text")
                .attr("x", "50%")
                .attr("y", mainSvgH * 0.5)
                .text(svgTextB)
                .attr("opacity", svgTextOpacityB)
                .attr("class", "textElmnt" + i)

          var buttonsDivChldrn = this['children']

          d3.selectAll(buttonsDivChldrn)
              .each(function(d, j){

                var eachButton = d3.select(this)
                eachButton
                  .attr("class", this['className'] + " bttn" + i)

              })//END of j each
        
        var buttonSuccess;
        var buttonFails = [];
        d3.selectAll(".bttn" + i)
            .each(function(d, k){
              if (this['className'] === 'btn btn-secondary bttn' + i) {
                if (this['id'] === 'button-success') {
                  buttonSuccess = this
                } else if (this['id'] === 'button-fail'){
                  buttonFails.push(this)
                }//END of nested else-if
              }//END of if
            })//END of k each

        d3.select(buttonSuccess)
          .on("click", function(){
            clickedButton = this.childNodes[0].data
  
            var textToScreen;
            for (var l = 0; l < stockTexts.length; l++){
              if (stockTexts[l]['quote'] === clickedButton) {
                textToScreen = stockTexts[l]['quote_text']
                break;
              }
            }

            successNumber += 1

            d3.select(this).attr("class", "btn btn-secondary btn-success")
            d3.selectAll(buttonFails).on("click", null)
            d3.select(buttonSuccess).on("click", null)
            abvSvg
              .transition()
              .duration(300)
              .style("background-color", svgColorA)
              .attr("opacity", svgOpacityA)
            textOne
              .transition()
              .duration(300)
              .attr("opacity", svgTextOpacityA)
              .each(function(d){
                var textElement = d3.select(this)

                var words = textToScreen.split(/\s+/).reverse()
                console.log(words)
                var word
                var line = []
                var lineNumber = 0
                var lineHeight = 1.2 // ems
                var x = "47%"
                var y = 100
                console.log(y)
                var dy = parseFloat(textElement.attr("dy"))
                var tspan = textElement.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", lineHeight + "em")
                        
                while (word = words.pop()) {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > 300) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = textElement.append("tspan").attr("x", x).attr("y", y).attr("dy", (lineHeight += 1.5) + "em").text(word);
                  }
                }
              })//END of textOne.each
          })//END of selectButtonSuccess

        d3.selectAll(buttonFails)
          .on("click", function(){
            clickedButton = this.childNodes[0].data
  
            var textToScreen;
            for (var l = 0; l < stockTexts.length; l++){
              if (stockTexts[l]['quote'] === clickedButton) {
                textToScreen = stockTexts[l]['quote_text']
                break;
              }
            }

            failNumber += 1

            d3.select(this).attr("class", "btn btn-secondary btn-danger")
            d3.select(buttonSuccess).attr("class", "btn btn-secondary btn-success")
            d3.selectAll(buttonFails).on("click", null)
            d3.select(buttonSuccess).on("click", null)
            abvSvg
              .transition()
              .duration(300)
              .style("background-color", svgColorA).attr("opacity", svgOpacityA)
            textOne
              .transition()
              .duration(300)
              .attr("opacity", svgTextOpacityA)
              .each(function(d){
                var textElement = d3.select(this)
                console.log("text", this)

                var words = textToScreen.split(/\s+/).reverse()
                console.log(words)
                var word
                var line = []
                var lineNumber = 0
                var lineHeight = 1.2 // ems
                var x = "47%"
                var y = 100
                console.log(y)
                var dy = parseFloat(textElement.attr("dy"))
                var tspan = textElement.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", lineHeight + "em")
                        
                while (word = words.pop()) {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > 300) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = textElement.append("tspan").attr("x", x).attr("y", y).attr("dy", (lineHeight += 1.5) + "em").text(word);
                  }
                }
              })//END of textOne.each
          })//END of selectFailButton

    })//END of i each

    var controller = new ScrollMagic.Controller()
    var scene = new ScrollMagic.Scene({triggerElement: "#results", duration: 200})
                      .addTo(controller)
                      .on("enter leave", function (e) {
                        $("#successes").text(" " + successNumber + "   ");
                        $("#totals").text((successNumber + failNumber));
                      })

  }//END of ready(stockTexts)

})();