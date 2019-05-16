var formatDecimalComma = d3.format(",.2f");

var width = 800,
  height = 800;

//setup scales
var rScale = d3
  .scaleLinear()
  .domain([3.5, 200])
  .range([7, 3]);

var x = d3.scaleLinear().range([0, width]),
  y = d3.scaleLinear().range([0, height]);

//the main SVG container
var distSVG = d3
  .select("#dist-chart")
  .attr("class", "column")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//configure x,y scales
var xAxisDist = d3
    .axisBottom(x)
    .ticks(((width + 2) / (height + 2)) * 10)
    .tickSize(height)
    .tickPadding(8 - height),
  yAxisDist = d3
    .axisRight(y)
    .ticks(10)
    .tickSize(width)
    .tickPadding(8 - width);

//append generated x,y scales to main SVG container
var gX = distSVG
    .append("g")
    .attr("class", "axis axis-x-dist")
    .call(xAxisDist),
  gY = distSVG
    .append("g")
    .attr("class", "axis axis-y-dist")
    .call(yAxisDist);

//this container holds all the planets
var planetCont = distSVG
  .append("g")
  .attr("transform", "translate(" + 0 + ", " + 0 + ")");

//A color range scale linearly prortional to temperature of planets
var colorDist = d3
  .scaleLinear()
  .domain([0, 400])
  .interpolate(d3.interpolateHcl)
  .range([d3.rgb("#007AFF"), d3.rgb("#d80833")]);

//Append Solar system as a reference point
planetCont
  .append("circle")
  .attr("r", 10)
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("style", "fill: #EA5A3E; filter:url(#sun-grad)")
  .attr("stroke", "#C12600")
  .attr("stroke-width", 2)
  .attr("stroke-opacity", 0.3);

var zoom_handler = d3.zoom().on("zoom", zoom_actions);

//remove and style axis ticks and borders
function reDraw() {
  d3.selectAll(".axis-x-dist")
    .selectAll(".tick")
    .select("text")
    .style("fill", "#9b9b9b");
  d3.selectAll(".axis-x-dist")
    .selectAll(".tick")
    .select("line")
    .style("stroke", "#dddddd");

  d3.selectAll(".axis-y-dist")
    .selectAll(".tick")
    .select("text")
    .style("fill", "#9b9b9b");
  d3.selectAll(".axis-y-dist")
    .selectAll(".tick")
    .select("line")
    .style("stroke", "#dddddd");

  gX.select(".domain").remove();
  gY.select(".domain").remove();
}

reDraw();

//this stuff will happend on every tick when zoomed by scoll or double clicked
function zoom_actions() {
  planetCont.attr("transform", d3.event.transform);
  gX.call(xAxisDist.scale(d3.event.transform.rescaleX(x)));
  gY.call(yAxisDist.scale(d3.event.transform.rescaleY(y)));
  reDraw();
}

zoom_handler(distSVG);

//gets the zoomed in coords with respenct to the object selected. got this from d3 community
getZoomedCoords = function(W, H, center, w, h, margin) {
  var k, kh, kw, x, y;
  kw = (W - margin) / w;
  kh = (H - margin) / h;
  k = d3.min([kw, kh]);
  x = W / 2 - center.x * k;
  y = H / 2 - center.y * k;
  return d3.zoomIdentity.translate(x, y).scale(k);
};

/*
acData holds System names and System data holds System name with properties
acData = [sysname1, sysnam2, sysname3, ....]
SystemData = 
{
	sysname1: 
	[
	{key-value pairs of planet1 params and its name corresponding to sysname1},
	{key-value pairs of planet2 params and its name corresponding to sysname1}
	.....
	],
	sysname2:
	[
	{key-value pairs of planet1 params and its name corresponding to sysname2},
	{key-value pairs of planet2 params and its name corresponding to sysname2}
	.....
	]
	.
	.
	.
	.
}
*/
var acData = [],
  SystemData = [];
//read generated file by pandas python
d3.csv("./cartesian-data/cart.csv", function(error, data) {
  if (error) {
    console.error(error);
  }
  //build SystemData JSON
  groupBy(data, "SystemName", true, function(d) {
    SystemData = d;
  });
  //console.log(SystemData)

  //build acData array
  var data = groupBySpec(data, function(item) {
    if (!acData.includes(item.SystemName)) {
      acData.push(item.SystemName);
    }
    return [item.SystemName];
  });

  //form circles where its radius is proprtional to its z-cordinate in x,y plane with solar system as origin
  var planets = planetCont
    .append("g")
    .attr("class", "planet")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("fill", function(d) {
      return colorDist(+d[0].DistFromSunly);
    })
    //.attr("style", "filter:url(#glow)") //causing performance issues
    .attr("name", function(d) {
      return d[0].SystemName;
    })
    .attr("cx", function(d) {
      return 800 / 2 + +d[0].x * 10;
    })
    .attr("cy", function(d) {
      return 800 / 2 + +d[0].y * 10;
    })
    .attr("r", function(d) {
      return Math.abs(rScale(+d[0].DistFromSunly));
    })
    .on("click", function(d) {
      var transform = getZoomedCoords(
        800,
        800,
        { x: 800 / 2 + +d[0].x * 10, y: 800 / 2 + +d[0].y * 10 },
        Math.abs(rScale(+d[0].DistFromSunly)) + 100,
        Math.abs(rScale(+d[0].DistFromSunly)) + 100,
        800 / 10
      );
      distSVG
        .transition()
        .duration(10000)
        .call(zoom_handler.transform, transform);
      var attrName = d3.select(this).attr("name");
      drawSystem(attrName, SystemData[attrName]);
    });
  //default System
  drawSystem("TRAPPIST-1", SystemData["TRAPPIST-1"]);
});

//reset zoom function
function reset() {
  d3.select("#dist-chart")
    .select("svg")
    .transition()
    .duration(750)
    .call(zoom_handler.transform, d3.zoomIdentity);
}

//this function zooms to a particular planet
function zoomTo(planetName) {
  findPlanetbyHTML(planetName, distSVG, "circle", "name", function(d) {
    var transform = getZoomedCoords(
      800,
      800,
      { x: +d3.select(d).attr("cx"), y: +d3.select(d).attr("cy") },
      +d3.select(d).attr("r") + 100,
      +d3.select(d).attr("r") + 100,
      800 / 10
    );
    distSVG
      .transition()
      .duration(2000)
      .call(zoom_handler.transform, transform);
  });
}

//initialize autocomplente.js using data from acData
var ac = new autoComplete({
  selector: 'input[name="search"]',
  minChars: 1,
  source: function(term, suggest) {
    term = term.toLowerCase();
    var choices = acData;
    var matches = [];
    for (i = 0; i < choices.length; i++)
      if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
    suggest(matches);
  },
  offsetTop: 15
});

//this is just helper function that verifies if planet entered is in acData and prompts user
function locate() {
  let pname = document.getElementsByClassName("planet-name-input")[0].value;
  if (acData.includes(pname)) {
    zoomTo(pname);
    drawSystem(pname, SystemData[pname]);
  }
}

////////////////////////////////////////
//This is the System sim SVG container

var simWidth = 350,
  simHeight = 350;

//handles NaN and returns default value if NaN
function handleNaN(val, defaultVal) {
  return isNaN(val) || val == 0 ? defaultVal : val;
}

//orbital velocity of planet calculated using kepler's 3rd law and basic circular motion
//v = 2*pi*a/T
function calculateSpeed(period) {
  if (handleNaN(period, 0) == 0) {
    return 0.1;
  }
  a = (period ** 2) ** (1 / 3);
  return (2 * Math.PI * a) / period;
}

//A modular d3 functin that takes in planetname and its SystemData and spits out a SVG container with a planet sim
function drawSystem(planetName, SystemData) {
  d3.select("#planet-sim")
    .select("svg")
    .remove();

  var sim = d3
    .select("#planet-sim")
    .append("svg")
    .attr("width", simWidth)
    .attr("height", simHeight);

  var timeInit = Date.now();

  var planets = [];

  var tempColor = d3
    .scaleLinear()
    .domain([0, 3060])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#007AFF"), d3.rgb("#d80833")]);

  var radScale = d3
    .scaleLinear()
    .domain([0, 5])
    .range([5, 10]);

  var speedScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0.3, 3]);

  var distScale = d3
    .scaleLinear()
    .domain([0, 5])
    .range([0, simWidth / 2])
    .clamp(true);

  //this is a smallsystem flag, small systems are hard to simulate hance they have seperate scales.
  var isSmallSystem = false,
    distSun;

  var distScaleLow = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, simWidth / 2]);

  var distScalehz = d3
    .scaleLinear()
    .domain([0, 30])
    .range([0, simWidth / 2]);

  //read data from main given csv to find more about a planet and to calculate habitable zone
  d3.csv("./given-data/oec.csv", function(error, data) {
    if (error) {
      console.error(error);
    }

    masterData = data;
    findPlanetByName = (planetName, data, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].PlanetIdentifier === planetName) {
          callback(data[i]);
          return;
        }
      }
      callback("not found");
    };
    var starTemp,
      starRad,
      luminosity,
      absLuminosity,
      hzRadin,
      hzRadout,
      type,
      discMethod,
      hzCalculated = false;
    SystemData.forEach(planet => {
      findPlanetByName(planet.PlanetIdentifier, masterData, function(d) {
        (discMethod = d.DiscoveryMethod),
          (distSun = +d.DistFromSunParsec),
          (starTemp = +d.HostStarTempK),
          (starRad = +d.HostStarRadiusSlrRad * 696000),
          (type = +d.TypeFlag);
        if (+d.SemiMajorAxisAU < 0.1) {
          isSmallSystem = true;
          planets.push({
            color: tempColor(+d.SurfaceTempK),
            rad: radScale(+d.RadiusJpt),
            dist: distScaleLow(+d.SemiMajorAxisAU * 5) + 10,
            speed: speedScale(calculateSpeed(+d.PeriodDays)),
            angle: Math.random() * 360
          });
        } else {
          planets.push({
            color: tempColor(+d.SurfaceTempK),
            rad: radScale(+d.RadiusJpt),
            dist: distScale(+d.SemiMajorAxisAU * 5),
            speed: speedScale(calculateSpeed(+d.PeriodDays)),
            angle: Math.random() * 360
          });
        }
      });
    });

    //only calculaye hz if data is given else don't since its expensive
    if (!+starTemp == 0 && !+starRad == 0) {
      //calculate habitable zome (heavy computation ahead)
      hzCalculated = true;
      luminosity = (starRad / 695700) ** 2 * (starTemp / 5778) ** 4;
      absLuminosity = Math.log10(luminosity) * -2.5;
      hzRadin = (absLuminosity / 1.1) ** 0.5;
      hzRadout = (absLuminosity / 0.53) ** 0.5;

      sim
        .append("g")
        .attr("class", "habitable-zone")
        .append("circle")
        .attr(
          "r",
          handleNaN(
            isSmallSystem ? distScalehz(hzRadin) + 10 : distScale(hzRadin),
            0
          )
        )
        .attr("fill", "none")
        .attr("stroke", "#75b401")
        .attr("opacity", 0.3)
        .attr(
          "stroke-width",
          handleNaN(
            isSmallSystem
              ? distScalehz(Math.abs(hzRadin - hzRadout)) + 10
              : distScale(Math.abs(hzRadin - hzRadout))
          ),
          0
        )
        .attr("cx", simWidth / 2)
        .attr("cy", simHeight / 2);
    }

    //append host star to sim
    sim
      .append("circle")
      .attr("r", handleNaN(radScale(starRad / 696000), 15))
      .attr("cx", simWidth / 2)
      .attr("cy", simHeight / 2)
      .attr("class", "host")
      .attr("style", "fill: #FFA500; filter:url(#sun-grad)");

    //consider all edge cases like S,P binary and orphan stars, since their models tend to be mostly inaccurate
    switch (type) {
      case 1:
        var t = sim
          .append("text")
          .attr("x", 100)
          .attr("y", 100)
          .attr("opacity", 0.5);
        t.append("tspan")
          .attr("x", 70)
          .attr("dy", "1.2em")
          .text("This is a P-Type Binary System.");
        t.append("tspan")
          .attr("x", 30)
          .attr("dy", "1.2em")
          .text("Research says that 50-60% Binary Systems");
        t.append("tspan")
          .attr("x", 10)
          .attr("dy", "1.2em")
          .text("support habitable zone in selected orbital ranges.");
        t.append("tspan")
          .attr("x", 30)
          .attr("dy", "1.2em")
          .text("(ps..the model might not be accurate :/)");
        break;

      case 2:
        var t = sim
          .append("text")
          .attr("x", 100)
          .attr("y", 100)
          .attr("opacity", 0.5);
        t.append("tspan")
          .attr("x", 70)
          .attr("dy", "1.2em")
          .text("This is a S-Type Binary System.");
        t.append("tspan")
          .attr("x", 30)
          .attr("dy", "1.2em")
          .text("Research says that 50-60% Binary Systems");
        t.append("tspan")
          .attr("x", 10)
          .attr("dy", "1.2em")
          .text("support habitable zone in selected orbital ranges.");
        t.append("tspan")
          .attr("x", 30)
          .attr("dy", "1.2em")
          .text("(ps..the model might not be accurate :/)");
        break;

      case 3:
        var t = sim
          .append("text")
          .attr("x", 100)
          .attr("y", 100)
          .attr("opacity", 0.5);
        t.append("tspan")
          .attr("x", 70)
          .attr("dy", "1.2em")
          .text("404 not found :(");
        t.append("tspan")
          .attr("x", 30)
          .attr("dy", "1.2em")
          .text("This might be a orphan star or");
        t.append("tspan")
          .attr("x", 10)
          .attr("dy", "1.2em")
          .text("data maynot be avialable.");
        t.append("tspan")
          .attr("x", 30)
          .attr("dy", "1.2em")
          .text("(ps..the model might not be accurate :/)");
        break;
    }

    var simCont = sim
      .append("g")
      .attr(
        "transform",
        "translate(" + simWidth / 2 + "," + simHeight / 2 + ")"
      );

    //append planets to sim and do some easing on the orbits
    simCont
      .selectAll("g.planet")
      .data(planets)
      .enter()
      .append("g")
      .attr("class", "planet")
      .each(function(d, i) {
        d3.select(this)
          .append("circle")
          .attr("class", "planet-sim-orbit")
          .attr("fill", "none")
          .attr("stroke", "#dddddd")
          .transition()
          .duration(600)
          .ease(d3.easeCubicInOut)
          .attr("r", handleNaN(+d.dist, handleNaN(i, 1) * 10));
        d3.select(this)
          .append("circle")
          .transition()
          .ease(d3.easeCubicInOut)
          .duration(600)
          .attr("r", handleNaN(+d.rad, 5))
          .attr("cx", handleNaN(d.dist, handleNaN(i, 1) * 10))
          .attr("cy", 0)
          .attr("class", "planet-sim-planet")
          .attr("style", "fill: " + d.color + "; filter:url(#glow)");
      });

    //revolve around host star
    d3.timer(function() {
      var delta = Date.now() - timeInit;
      sim.selectAll(".planet").attr("transform", function(d) {
        return "rotate(" + ((d.angle + delta * (d.speed / 100)) % 360) + ")";
      });
    });

    //////////////////////update planet-info
    let planetInfo = d3.select(".info-list"),
      planetArr = [];
    SystemData.forEach(element => {
      planetArr.push(element.PlanetIdentifier);
    });
    d3.select("#system-info")
      .select("#system-name")
      .text(planetName);
    planetInfo
      .select("#planets-no")
      .html(
        "It has<span class = 'highlight'> " +
          SystemData.length +
          " </span>orbiting planets"
      );
    planetInfo.select("#planets-list").text(planetArr.join(", "));
    planetInfo
      .select("#distance-sun")
      .html(
        handleNaN(distSun, 0) == 0
          ? "Distance from sun data not available"
          : "It is<span class = 'highlight'> " +
              distSun +
              "</span> parsecs from Sun, It would take " +
              3.262 * distSun +
              " years to get here if travelled at speed of light."
      );
    planetInfo
      .select("#disc-method")
      .html(
        "Discovered by <span class = 'highlight'>" +
          (discMethod == "RV" ? "Radial Velocity" : discMethod) +
          "</span> method"
      );
    planetInfo
      .select("#hz")
      .html(
        hzCalculated
          ? "Habitable Zone calculated(green patch)"
          : "Habitable Zone not calculated, insufficient data available :("
      );
  });
}
