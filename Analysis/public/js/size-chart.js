var margin = { top: 20, right: 20, bottom: 50, left: 40 },
	width = 1150 - margin.left - margin.right,
	height = 450 - margin.top - margin.bottom;

var formatDecimalComma = d3.format(",.2f");

//setup scales for x and y axes
var xsAnn = d3
	.scaleLinear()
	.domain([-0.973, 7])
	.range([0, width]),

	ysAnn = d3
		.scaleLinear()
		.domain([-1, 31])
		.range([height, 0]);

//configure axes according to data
var xValue = function (d) {
	return d["RadiusJpt"];
},
	xScale = d3.scaleLinear().range([0, width]),
	xMap = function (d) {
		return xScale(xValue(d));
	},
	xAxis = d3.axisBottom(xScale).scale(xScale);

var yValue = function (d) {
	return d["PlanetaryMassJpt"];
},
	yScale = d3.scaleLinear().range([height, 0]),
	yMap = function (d) {
		return yScale(yValue(d));
	},
	yAxis = d3.axisLeft(yScale).scale(yScale);

//main SVG that hold the chart
var svg = d3
	.selectAll("#size-chart")
	.select("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//SVG group that holds the planet details
let info_group = svg
	.append("g")
	.attr("class", "info-group")
	.attr("transform", "translate(" + [width / 2, height / 2] + ")")
	.style("opacity", 0);

let planet_name = info_group
	.append("text")
	.attr("id", "planet-name")
	.attr("class", "info-text")
	.attr("y", 140)
	.attr("x", 0)
	.style("opacity", 1)
	.text("That's Kepler-9b")
	.attr("font-size", 30);

let planet_temp = info_group
	.append("text")
	.attr("id", "planet-temp")
	.attr("class", "info-text")
	.attr("y", 160)
	.text("with 3000°C temperature");

let planet_info = info_group
	.append("text")
	.attr("id", "planet-info")
	.attr("class", "info-text")
	.attr("y", 175)
	.attr("fill", "grey")
	.attr("font-size", 10)
	.text("with 3000°C temperature");

//that tiny circle that appears when you hover on planet
var hover = svg
	.append("g")
	.attr("class", "hover-circle")
	.append("circle")
	.attr("class", "hover-circle-item")
	.attr("cx", 10)
	.attr("cy", 10)
	.attr("r", 0)
	.attr("stroke", "#d80833")
	.attr("fill", "none")
	.attr("stroke-width", 3);

//bunch of helper functions
function normalize(val, max, min) {
	return (val - min) / (max - min);
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

function clamp(num, min, max) {
	return num <= min ? min : num >= max ? max : num;
}

//read from custom CSV with planets sorted by radius
d3.csv("./size-data/planets.csv", function (error, data) {
	var smallest = data[2771];
	//first 200 planets
	data = data.slice(0, 200);
	data.push(smallest);
	//sanitize data from string to int
	data.forEach(function (d) {
		d["RadiusJpt"] = +d["RadiusJpt"];
		d["PlanetaryMassJpt"] = Math.floor(+d["PlanetaryMassJpt"]);
		d["SurfaceTempK"] = +d["SurfaceTempK"];
	});
	//console.log(max);
	//console.log(data);

	xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
	yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1]);

	//color range that maps to temperature of planets, grey if temp data not avialable 
	var color = d3
		.scaleLinear()
		.domain([0, 3060])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#007AFF"), d3.rgb("#d80833")]);

	var xaxis = svg
		.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + 380 + ")")
		.call(xAxis);

	var yaxis = svg
		.append("g")
		.attr("class", "y-axis")
		.call(yAxis);

	//append generated x and y axis to SVG
	yaxis
		.append("text")
		.attr("y", 0)
		.attr("x", 75)
		.text("Planetary Mass(jpt)")
		.attr("font-size", 12)
		.attr("font-weight", "bold");

	xaxis
		.append("text")
		.attr("class", "chart-stats-axis-note")
		.attr("x", 1090 / 2)
		.attr("y", 30)
		.style("text-anchor", "middle")
		.text("Planetary Radius(jpt)")
		.attr("font-size", 12)
		.attr("font-weight", "bold");

	xaxis
		.append("text")
		.attr("class", "chart-xaxis-info")
		.attr("x", 0)
		.attr("y", 30)
		.attr("text-anchor", "start")
		.text("Smaller Planets")
		.attr("font-size", 12);

	xaxis
		.append("text")
		.attr("class", "chart-xaxis-info")
		.attr("y", 30)
		.attr("x", 1090)
		.attr("text-anchor", "end")
		.text("Bigger Planets")
		.attr("font-size", 12);

	d3.selectAll(".y-axis")
		.select("path")
		.remove();

	d3.selectAll("text").attr("fill", "#333333");

	//Make planets with csv data
	svg
		.selectAll(".dot")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "dot")
		.attr("stroke-width", 0)
		.attr("style", "fill: #d00; filter:url(#glow)")
		.attr("stroke", function (d) {
			//console.log(d);
			return d["SurfaceTempK"] === 0 ? "#c5c1cc" : color(d["SurfaceTempK"]);
		})
		.attr("r", function (d) {
			if (d["PlanetIdentifier"] !== "Kepler-37 b") {
				return d["RadiusJpt"] * 3;
			} else {
				return 40;
			}
		})
		.attr("opacity", function (d) {
			if (d["PlanetIdentifier"] !== "Kepler-37 b") {
				return d["SurfaceTempK"] === 0
					? 0.5
					: normalize(color(d["SurfaceTempK"], 0, 3060));
			} else {
				return 0;
			}
		})
		.attr("cx", xMap)
		.attr("cy", yMap)
		.style("fill", function (d) {
			var temp = d["SurfaceTempK"];
			return d["SurfaceTempK"] === 0
				? "#c5c1cc"
				: color(temp.map(0, 100, 0, 100));
		})
		.on("mouseover", function (d) {
			info_group
				.transition()
				.duration(200)
				.style("opacity", 1.9);
			planet_name.text("That's " + d.PlanetIdentifier);
			planet_temp.text(
				d.SurfaceTempK === 0
					? "Temperature data not Avialable"
					: "with " +
					Math.round((d.SurfaceTempK - 273.15) * 100) / 100 +
					"°C Surface Temperature"
			);
			planet_info.text(
				"Mass: " +
				(+d["PlanetaryMassJpt"] === 0
					? "data not avialable"
					: formatDecimalComma(1.898e27 * +d["PlanetaryMassJpt"]) + "kg") +
				"\u00A0\u00A0\u00A0\u00A0Radius: " +
				(+d["RadiusJpt"] === 0
					? "data not avialable"
					: formatDecimalComma(69911 * +d["RadiusJpt"]) + "km")
			);
			var mx = d3.select(this).attr("cx"),
				my = d3.select(this).attr("cy"),
				mr = d3.select(this).attr("r");

			//mouse easing and hovering
			d3.select(".hover-circle-item")
				.style("opacity", 1)
				.transition()
				.duration(100)
				.attr("cx", mx)
				.attr("cy", my)
				.duration(100)
				.transition()
				.duration(100)
				.attr(
					"r",
					d["PlanetIdentifier"] === "Kepler-37 b" ? +mr - 20 : +mr + 5
				);
		})
		.on("mouseout", function (d) {
			info_group
				.transition()
				.duration(500)
				.style("opacity", 0);
			d3.select(".hover-circle-item")
				.style("opacity", 0)
				.transition()
				.duration(100)
				.attr("r", 0);
		});
});

//The annotation bubbles data
const annotationData = [
	{
		className: "largest",
		note: {
			title: "The Largest",
			label:
				"HD 100546 b is the largest planet ever recorded, it's radius is about" +
				" 6 times jupier's radius(about 419466km)",
			wrap: 300
		},
		data: { radius: 6, mass: Math.floor(17.5) },
		type: d3.annotationCalloutCircle,
		dy: 50,
		dx: -100,
		subject: {
			radius: 45,
			radiusPadding: 5
		}
	},
	{
		className: "Heaviest",
		note: {
			title: "The Heaviest",
			label:
				"2M 2206-20 b has mass about 30 times that of Jupiter, which is about 5.6961e28kg",
			wrap: 200
		},
		data: { radius: 1.3, mass: 30 },
		type: d3.annotationCalloutCircle,
		dy: 50,
		dx: 150,
		subject: {
			radius: 10,
			radiusPadding: 5
		}
	}
];

const annotationDataCustom = [
	{
		className: "smallest",
		note: {
			title: "The Smallest",
			label:
				"Kepler-37 b is the smallest planet ever recorded, with mass 0.00875" +
				" times jupier's mass and radius 0.027 times jupiter radius",
			wrap: 200
		},
		data: { radius: 0.027, mass: 0.00875 },
		dy: -100,
		dx: 30,
		subject: {
			radius: 10,
			radiusPadding: 5
		}
	}
];

//setup d3 annotation type
const type = d3.annotationCustomType(d3.annotationCalloutCircle, {
	className: "custom",
	connector: { type: "elbow" },
	note: {
		lineType: "horizontal",
		align: "middle"
	}
});

//setup d3 annotation bubble
const makeAnnotations = d3
	.annotation()
	.accessors({
		x: d => xsAnn(d.radius),
		y: d => ysAnn(d.mass)
	})
	.annotations(annotationData);

const makeAnnotationsCustom = d3
	.annotation()
	.type(type)
	.accessors({
		x: d => xsAnn(d.radius),
		y: d => ysAnn(d.mass)
	})
	.annotations(annotationDataCustom);

//group all the annotations into a <g>
svg
	.append("g")
	.attr("class", "annotation-group")
	.call(makeAnnotations);

svg
	.append("g")
	.attr("class", "annotation-group")
	.call(makeAnnotationsCustom);

//Scale that tells about temperature gradiant
var defs = d3.selectAll("defs");

var gradientLegend = svg
	.append("g")
	.attr("class", "legend-temp")
	.attr("transform", "translate(" + (width - 150) + ", " + 10 + ")");

var gradient = defs
	.append("linearGradient")
	.attr("id", "svgGradient")
	.attr("x1", "0%")
	.attr("x2", "100%")
	.attr("y1", "0%")
	.attr("y2", "0%");

gradient
	.append("stop")
	.attr("class", "start")
	.attr("offset", "0%")
	.attr("stop-color", "#007AFF")
	.attr("stop-opacity", 1);

gradient
	.append("stop")
	.attr("class", "end")
	.attr("offset", "100%")
	.attr("stop-color", "#d80833")
	.attr("stop-opacity", 1);

var gradientLine = gradientLegend
	.append("rect")
	.attr("x", 10)
	.attr("y", 10)
	.attr("width", 100)
	.attr("height", 10)
	.attr("fill", "url(#svgGradient)");

gradientLegend
	.selectAll(".gradient-legend-text")
	.data(["0°C", "3000°C"])
	.enter()
	.append("text")
	.attr("class", "gradient-legend-text")
	.attr("x", (d, i) => (i === 0 ? 15 : gradientLine.attr("width")))
	.attr("y", 35)
	.style("text-anchor", "middle")
	.attr("font-size", 10)
	.text(d => d);

//styling the annotation bubbles
window.onload = function () {
	d3.selectAll(".annotation-note-label").attr("fill", "grey");
	d3.selectAll(".annotation-group")
		.selectAll("path")
		.attr("stroke", "grey");
};
