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

function zoom_actions() {
	planetCont.attr("transform", d3.event.transform);
}

zoom_handler(distSVG);

getZoomedCoords = function(W, H, center, w, h, margin) {
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

var acData = [];
d3.csv("./cartesian-data/cart.csv", function(error, data) {
	if (error) {
		console.error(error);
	}

	var data = groupBySpec(data, function(item) {
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
		.attr("fill", function(d) {
			return colorDist(+d[0].DistFromSunly);
		})
		//.attr("style", "filter:url(#glow)")
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
				.on("end", function() {
					toLoad(false);
				});
		});
});

function reset() {
	toLoad(true);
	d3.select("#dist-chart")
		.select("svg")
		.transition()
		.duration(750)
		.call(zoom_handler.transform, d3.zoomIdentity)
		.on("end", function() {
			toLoad(false);
		});
}

function zoomTo(planetName) {
	toLoad(true);
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
			.call(zoom_handler.transform, transform)
			.on("end", function() {
				toLoad(false);
			});
	});
}

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

function locate() {
	let pname = document.getElementsByClassName("planet-name-input")[0].value;
	if (acData.includes(pname)) {
		zoomTo(pname);
	}
}
