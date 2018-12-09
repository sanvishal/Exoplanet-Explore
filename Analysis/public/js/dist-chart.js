var width = 800,
	height = 800;

var rScale = d3
	.scaleLinear()
	.domain([3.5, 200])
	.range([7, 3]);

var distSVG = d3
	.select("#dist-chart")
	.attr("class", "column")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

var x = d3.scaleLinear()
	.range([0, width]),

	y = d3.scaleLinear()
		.range([0, height]),

	xAxisDist = d3.axisBottom(x)
		.ticks((width + 2) / (height + 2) * 10)
		.tickSize(height)
		.tickPadding(8 - height),

	yAxisDist = d3.axisRight(y)
		.ticks(10)
		.tickSize(width)
		.tickPadding(8 - width);

var gX = distSVG.append("g")
	.attr("class", "axis axis-x-dist")
	.call(xAxisDist),
	gY = distSVG.append("g")
		.attr("class", "axis axis-y-dist")
		.call(yAxisDist);

var planetCont = distSVG
	.append("g")
	.attr("transform", "translate(" + 0 + ", " + 0 + ")");

var colorDist = d3
	.scaleLinear()
	.domain([0, 400])
	.interpolate(d3.interpolateHcl)
	.range([d3.rgb("#007AFF"), d3.rgb("#d80833")]);

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

function reDraw() {
	d3.selectAll(".axis-x-dist").selectAll(".tick").select("text").style("fill", "#9b9b9b")
	d3.selectAll(".axis-x-dist").selectAll(".tick").select("line").style("stroke", "#dddddd")

	d3.selectAll(".axis-y-dist").selectAll(".tick").select("text").style("fill", "#9b9b9b")
	d3.selectAll(".axis-y-dist").selectAll(".tick").select("line").style("stroke", "#dddddd")

	gX.select(".domain").remove()
	gY.select(".domain").remove()
}

reDraw()

function zoom_actions() {
	planetCont.attr("transform", d3.event.transform);
	gX.call(xAxisDist.scale(d3.event.transform.rescaleX(x)));
	gY.call(yAxisDist.scale(d3.event.transform.rescaleY(y)));

	reDraw()
}

zoom_handler(distSVG);

getZoomedCoords = function (W, H, center, w, h, margin) {
	var k, kh, kw, x, y;
	kw = (W - margin) / w;
	kh = (H - margin) / h;
	k = d3.min([kw, kh]);
	x = W / 2 - center.x * k;
	y = H / 2 - center.y * k;
	return d3.zoomIdentity.translate(x, y).scale(k);
};

function toLoad(action) {
	d3.selectAll(".loaders").classed("is-loading", action);
}

var acData = []; var SystemData = [];
d3.csv("./cartesian-data/cart.csv", function (error, data) {
	if (error) {
		console.error(error);
	}

	groupBy(data, "SystemName", true, function (d) {
		SystemData = d
	})
	//console.log(SystemData)

	var data = groupBySpec(data, function (item) {
		if (!acData.includes(item.SystemName)) {
			acData.push(item.SystemName);
		}
		return [item.SystemName];
	});

	var planets = planetCont
		.append("g")
		.attr("class", "planet")
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("fill", function (d) {
			return colorDist(+d[0].DistFromSunly);
		})
		//.attr("style", "filter:url(#glow)")
		.attr("name", function (d) {
			return d[0].SystemName;
		})
		.attr("cx", function (d) {
			return 800 / 2 + +d[0].x * 10;
		})
		.attr("cy", function (d) {
			return 800 / 2 + +d[0].y * 10;
		})
		.attr("r", function (d) {
			return Math.abs(rScale(+d[0].DistFromSunly));
		})
		.on("click", function (d) {
			toLoad(true);
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
				.duration(2000)
				.call(zoom_handler.transform, transform)
				.on("end", function () {
					toLoad(false);
				});
		});
	var name = "Kepler-16 (AB)"
	drawSystem(name, SystemData[name])
});

function reset() {
	toLoad(true);
	d3.select("#dist-chart")
		.select("svg")
		.transition()
		.duration(750)
		.call(zoom_handler.transform, d3.zoomIdentity)
		.on("end", function () {
			toLoad(false);
		});
}

function zoomTo(planetName) {
	toLoad(true);
	findPlanetbyHTML(planetName, distSVG, "circle", "name", function (d) {
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
			.call(zoom_handler.transform, transform)
			.on("end", function () {
				toLoad(false);
			});
	});
}

var ac = new autoComplete({
	selector: 'input[name="search"]',
	minChars: 1,
	source: function (term, suggest) {
		term = term.toLowerCase();
		var choices = acData;
		var matches = [];
		for (i = 0; i < choices.length; i++)
			if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
		suggest(matches);
	},
	offsetTop: 15
});

function locate() {
	let pname = document.getElementsByClassName("planet-name-input")[0].value;
	if (acData.includes(pname)) {
		zoomTo(pname);
		drawSystem(pname, SystemData[pname])
	}
}

////////////////////////////////////

var simWidth = 450, simHeight = 450;

function handleNaN(val, defaultVal) {
	return isNaN(val) || val == 0 ? defaultVal : val
}

function drawSystem(planetName, SystemData) {

	d3.select("#planet-sim").select("svg").remove();

	var sim = d3.select("#planet-sim").append("svg")
		.attr("width", simWidth).attr("height", simHeight);

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
		.range([5, 10])

	var radScale = d3
		.scaleLinear()
		.domain([0, 5])
		.range([5, 10]);

	var speedScale = d3
		.scaleLinear()
		.domain([0, 1000])
		.range([1, 0]);

	var distScale = d3
		.scaleLinear()
		.domain([0, 5])
		.range([0, simWidth / 2])

	var isSmallSystem = false;

	var distScaleLow = d3.scaleLinear().domain([0, 1]).range([0, simWidth / 2])

	var distScalehz = d3.scaleLinear().domain([0, 30]).range([0, simWidth / 2])

	d3.csv("./given-data/oec.csv", function (error, data) {
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
		var starTemp, starRad, luminosity, absLuminosity, hzRadin, hzRadout, type
		SystemData.forEach(planet => {
			findPlanetByName(planet.PlanetIdentifier, masterData, function (d) {
				starTemp = +d.HostStarTempK, starRad = +d.HostStarRadiusSlrRad * 696000, type = +d.TypeFlag
				if (+d.SemiMajorAxisAU < 0.1) {
					isSmallSystem = true;
					planets.push({ color: tempColor(+d.SurfaceTempK), rad: radScale(+d.RadiusJpt), dist: distScaleLow(+d.SemiMajorAxisAU * 5), speed: speedScale(+d.PeriodDays / 4), angle: Math.random() * 360 })
				} else {

					planets.push({ color: tempColor(+d.SurfaceTempK), rad: radScale(+d.RadiusJpt), dist: distScale(+d.SemiMajorAxisAU * 5), speed: speedScale(+d.PeriodDays / 4), angle: Math.random() * 360 })
				}
			})
		});

		if (!starTemp == 0 && !starRad == 0) {
			luminosity = ((starRad / 695700) ** 2) * ((starTemp / 5778) ** 4)
			absLuminosity = Math.log10(luminosity) * -2.5
			hzRadin = (absLuminosity / 1.1) ** 0.5
			hzRadout = (absLuminosity / 0.53) ** 0.5
			console.log(isSmallSystem)

			sim
				.append("g")
				.attr("class", "habitable-zone")
				.append("circle")
				.attr("r", isSmallSystem ? distScalehz(hzRadin) : distScale(hzRadin))
				.attr("fill", "none").attr("stroke", "#75b401").attr("opacity", 0.3)
				.attr("stroke-width",
					isSmallSystem ? distScalehz(Math.abs(hzRadin - hzRadout)) : distScale(Math.abs(hzRadin - hzRadout)))
				.attr("cx", simWidth / 2)
				.attr("cy", simHeight / 2)

		}

		sim.append("circle").attr("r", handleNaN(radScale(starRad / 696000), 15)).attr("cx", simWidth / 2)
			.attr("cy", simHeight / 2).attr("class", "host")
			.attr("style", "fill: #FFA500; filter:url(#sun-grad)")

		switch (type) {
			case 1: var t = sim.append("text").attr("x", 100).attr("y", 100)
				t.append("tspan").attr("x", 100).attr("dy", "1.2em").text("This is a P-Type Binary System.")
				t.append("tspan").attr("x", 60).attr("dy", "1.2em").text("Research says that 50-60% Binary Systems")
				t.append("tspan").attr("x", 40).attr("dy", "1.2em").text("support habitable zone in selected orbital ranges.");
				t.append("tspan").attr("x", 60).attr("dy", "1.2em").text("(ps..the model might not be accurate :/)"); break;

			case 2: var t = sim.append("text").attr("x", 100).attr("y", 100)
				t.append("tspan").attr("x", 100).attr("dy", "1.2em").text("This is a S-Type Binary System.")
				t.append("tspan").attr("x", 60).attr("dy", "1.2em").text("Research says that 50-60% Binary Systems")
				t.append("tspan").attr("x", 40).attr("dy", "1.2em").text("support habitable zone in selected orbital ranges.");
				t.append("tspan").attr("x", 60).attr("dy", "1.2em").text("(ps..the model might not be accurate :/)"); break;

			case 3: var t = sim.append("text").attr("x", 100).attr("y", 100)
				t.append("tspan").attr("x", 100).attr("dy", "1.2em").text("404 not found :(")
				t.append("tspan").attr("x", 60).attr("dy", "1.2em").text("This might be a orphan star or")
				t.append("tspan").attr("x", 40).attr("dy", "1.2em").text("data maynot be avialable.")
				t.append("tspan").attr("x", 60).attr("dy", "1.2em").text("(ps..the model might not be accurate :/)"); break;
		}

		var simCont = sim.append("g")
			.attr("transform", "translate(" + simWidth / 2 + "," + simHeight / 2 + ")")

		simCont.selectAll("g.planet").data(planets).enter().append("g")
			.attr("class", "planet").each(function (d, i) {
				d3.select(this).append("circle").attr("class", "planet-sim-orbit").attr("fill", "none").attr("stroke", "#dddddd")
					.attr("r", handleNaN(+d.dist, handleNaN(i, 1) * 10));
				d3.select(this).append("circle").attr("r", handleNaN(+d.rad, 5)).attr("cx", handleNaN(d.dist, handleNaN(i, 1) * 10))
					.attr("cy", 0).attr("class", "planet-sim-planet").attr("style", "fill: " + d.color + "; filter:url(#glow)")
			});

		d3.timer(function () {
			var delta = (Date.now() - timeInit);
			sim.selectAll(".planet").attr("transform", function (d) {
				return "rotate(" + (d.angle + delta * (d.speed / 100)) % 360 + ")";
			});
		});
	});
}