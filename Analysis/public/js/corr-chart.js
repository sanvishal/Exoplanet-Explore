var formatDecimalComma = d3.format(",.2f");

var corrMatrix = [
	[
		1,
		0.1919171038524972,
		0.5521815731913527,
		0.6369611775046112,
		0.1354050406299072,
		0.017389396273639685,
		0.4501175580195774,
		0.08551101482496948,
		-0.42956429436546095,
		0.46741998961889936,
		-0.4837309998967081
	],
	[
		0.1919171038524972,
		1,
		-0.06917672196274967,
		-0.058048938138319156,
		-0.128074094202061,
		0.4384352150043992,
		0.26898785655267377,
		0.22059557605241695,
		0.13183065328325314,
		0.13228186582685003,
		-0.2091295102763281
	],
	[
		0.5521815731913527,
		-0.06917672196274967,
		1,
		0.9859489922182816,
		-0.11502188986670846,
		-0.02151502231655824,
		0.45028921432291136,
		0.1545471294017457,
		-0.5277742415876492,
		0.5128076501574156,
		-0.3343087834735588
	],
	[
		0.6369611775046112,
		-0.058048938138319156,
		0.9859489922182816,
		1,
		-0.12361675498050827,
		-0.024964140307035743,
		0.49861392460590664,
		0.17436192508859233,
		-0.5850337818088522,
		0.5676888975129942,
		-0.36789201364830315
	],
	[
		0.1354050406299072,
		-0.128074094202061,
		-0.11502188986670846,
		-0.12361675498050827,
		1,
		-0.345376568565872,
		-0.08982199128063076,
		-0.09428570163059355,
		0.25833617682584353,
		-0.1192071361518772,
		0.08705275593017701
	],
	[
		0.017389396273639685,
		0.4384352150043992,
		-0.02151502231655824,
		-0.024964140307035743,
		-0.345376568565872,
		1,
		0.32824766037964814,
		0.21241059155493106,
		0.050735789254512983,
		0.24051529378721956,
		-0.17284316327966204
	],
	[
		0.4501175580195774,
		0.26898785655267377,
		0.45028921432291136,
		0.49861392460590664,
		-0.08982199128063076,
		0.32824766037964814,
		1,
		0.7976011012017875,
		-0.3372964581884007,
		0.8955953580032828,
		-0.6438003991705088
	],
	[
		0.08551101482496948,
		0.22059557605241695,
		0.1545471294017457,
		0.17436192508859233,
		-0.09428570163059355,
		0.21241059155493106,
		0.7976011012017875,
		1,
		-0.26184033191930434,
		0.6652630391370397,
		-0.29106173688651277
	],
	[
		-0.42956429436546095,
		0.13183065328325314,
		-0.5277742415876492,
		-0.5850337818088522,
		0.25833617682584353,
		0.050735789254512983,
		-0.3372964581884007,
		-0.26184033191930434,
		1,
		-0.5698921402113994,
		0.158401745059543
	],
	[
		0.46741998961889936,
		0.13228186582685003,
		0.5128076501574156,
		0.5676888975129942,
		-0.1192071361518772,
		0.24051529378721956,
		0.8955953580032828,
		0.6652630391370397,
		-0.5698921402113994,
		1,
		-0.6322334283990316
	],
	[
		-0.4837309998967081,
		-0.2091295102763281,
		-0.3343087834735588,
		-0.36789201364830315,
		0.08705275593017701,
		-0.17284316327966204,
		-0.6438003991705088,
		-0.29106173688651277,
		0.158401745059543,
		-0.6322334283990316,
		1
	]
];

var labels = [
	"PlanetaryMassJpt",
	"RadiusJpt",
	"PeriodDays",
	"SemiMajorAxisAU",
	"Eccentricity",
	"SurfaceTempK",
	"HostStarMassSlrMass",
	"HostStarRadiusSlrRad",
	"HostStarMetallicity",
	"HostStarTempK",
	"HostStarAgeGyr"
];

function Matrix(options) {
	var margin = { top: 50, right: 50, bottom: 200, left: 200 },
		width = 350,
		height = 350,
		data = options.data,
		container = options.container,
		labelsData = options.labels,
		startColor = options.start_color,
		endColor = options.end_color,
		scatterData = options.scatterData;

	var widthLegend = 100;

	if (!data) {
		throw new Error("Please pass data");
	}

	if (!Array.isArray(data) || !data.length || !Array.isArray(data[0])) {
		throw new Error("It should be a 2-D array");
	}

	var maxValue = d3.max(data, function(layer) {
		return d3.max(layer, function(d) {
			return d;
		});
	});
	var minValue = d3.min(data, function(layer) {
		return d3.min(layer, function(d) {
			return d;
		});
	});

	var numrows = data.length;
	var numcols = data[0].length;

	var corrSVG = d3
		.select(container)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var indSVG = d3
		.select("#indicator")
		.append("svg")
		.attr("width", 400)
		.attr("height", 100);

	var indicatorText = indSVG
		.append("text")
		.attr("x", 20)
		.attr("y", 50);

	var perc = indicatorText
		.append("tspan")
		.attr("class", "perc")
		.attr("x", 0)
		.text("Hover on Graph")
		.attr("font-size", 50);

	var corrText = indicatorText
		.append("tspan")
		.attr("class", "corr-text")
		.attr("x", 0)
		.attr("dy", "1.2em")
		.attr("font-size", 20)
		.text("Correlation")
		.style("fill", "grey");

	var corrBetw = indicatorText
		.append("tspan")
		.attr("class", "corr-betw")
		.attr("x", 0)
		.attr("dy", "1.2em")
		.attr("font-size", 15)
		.text("between x and y")
		.style("fill", "grey");

	var indLinex = corrSVG
		.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 100)
		.attr("y2", 100)
		.attr("stroke-width", 2)
		.attr("stroke-dasharray", 3)
		.attr("stroke", "#de2f53")
		.attr("opacity", 0);

	var indLiney = corrSVG
		.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 100)
		.attr("y2", 100)
		.attr("stroke-width", 2)
		.attr("stroke-dasharray", 3)
		.attr("stroke", "#de2f53")
		.attr("opacity", 0);

	var x = d3
		.scaleBand()
		.domain(d3.range(numcols))
		.range([0, width]);

	var y = d3
		.scaleBand()
		.domain(d3.range(numrows))
		.range([0, height]);

	var indicator = corrSVG
		.append("circle")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", 6)
		.attr("fill", "none")
		.attr("stroke", "#de2f53")
		.attr("stroke-width", 3.5)
		.attr("opacity", 0);

	var colorMap = d3
		.scaleLinear()
		.domain([minValue, maxValue])
		.range([startColor, endColor]);

	var row = corrSVG
		.selectAll(".row")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "row")
		.attr("transform", function(d, i) {
			return "translate(0," + y(i) + ")";
		})
		.attr("data-id", function(d, i) {
			return i;
		});

	var cell = row
		.selectAll(".cell")
		.data(function(d) {
			return d;
		})
		.enter()
		.append("g")
		.attr("class", "cell")
		.attr("transform", function(d, i) {
			var t = x(i);
			return "translate(" + t + ", 0)";
		})
		.attr("data-id", function(d, i) {
			return i;
		})
		.on("mouseover", function() {
			var tthis = d3.select(this).attr("transform"),
				translatethis = tthis
					.substring(tthis.indexOf("(") + 1, tthis.indexOf(")"))
					.split(","),
				x = +translatethis[0];
			var tparent = d3.select(this.parentNode).attr("transform"),
				translateparent = tparent
					.substring(tparent.indexOf("(") + 1, tparent.indexOf(")"))
					.split(","),
				y = +translateparent[1];

			indicator
				.attr("opacity", 1)
				.transition()
				.duration(100)
				.attr("r", 15)
				.attr("cx", x)
				.attr("cy", y);

			var coeff = d3.select(this).data()[0];
			perc.text(
				coeff < 0
					? formatDecimalComma(coeff * -1 * 100) + "%"
					: formatDecimalComma(coeff * 100) + "%"
			);
			corrText.text(
				coeff < 0 ? "Negative Correlation" : "Positive Correlation"
			);

			var dataThis = +d3.select(this).attr("data-id"),
				dataParent = +d3.select(this.parentNode).attr("data-id");
			corrBetw.text(
				"between " + labelsData[dataThis] + " and " + labelsData[dataParent]
			);

			indLinex
				.attr("opacity", 0.3)
				.attr("x1", -16)
				.attr("y1", y)
				.attr("x2", x)
				.attr("y2", y);

			indLiney
				.attr("opacity", 0.3)
				.attr("x1", x)
				.attr("y1", y)
				.attr("x2", x)
				.attr("y2", height - 15);

			Scatter(dataParent, dataThis, scatterData);
		});

	cell.append("circle").attr("r", function(d) {
		return clamp((x.bandwidth() * d) / 1.5, 5, x.bandwidth() / 3);
	});

	row
		.selectAll(".cell")
		.data(function(d, i) {
			return data[i];
		})
		.style("fill", colorMap);

	var labels = corrSVG.append("g").attr("class", "labels");

	var columnLabels = labels
		.selectAll(".column-label")
		.data(labelsData)
		.enter()
		.append("g")
		.attr("class", "column-label")
		.attr("transform", function(d, i) {
			return "translate(" + (x(i) - 16) + "," + (height - 16) + ")";
		})
		.style("fill", "grey")
		.style("opacity", 0.7);

	columnLabels
		.append("line")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.attr("x1", x.bandwidth() / 2)
		.attr("x2", x.bandwidth() / 2)
		.attr("y1", 0)
		.attr("y2", 5)
		.style("fill", "grey")
		.style("opacity", 0.7);

	columnLabels
		.append("text")
		.attr("x", 0)
		.attr("y", y.bandwidth() / 2)
		.attr("dy", ".82em")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-60)")
		.text(function(d, i) {
			return d;
		});

	var rowLabels = labels
		.selectAll(".row-label")
		.data(labelsData)
		.enter()
		.append("g")
		.attr("class", "row-label")
		.attr("transform", function(d, i) {
			return "translate(" + "-16" + "," + (y(i) - 16) + ")";
		})
		.style("fill", "grey")
		.style("opacity", 0.7);

	rowLabels
		.append("line")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.attr("x1", 0)
		.attr("x2", -5)
		.attr("y1", y.bandwidth() / 2)
		.attr("y2", y.bandwidth() / 2)
		.style("fill", "grey")
		.style("opacity", 0.7);

	rowLabels
		.append("text")
		.attr("x", -8)
		.attr("y", y.bandwidth() / 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "end")
		.text(function(d, i) {
			return d;
		});
}

var scatterSVG = d3.select("#scatter-chart");

function Scatter(col, row, scatterData) {
	scatterSVG.html("");

	var datacol = [],
		datarow = [],
		data = [];

	for (let i = 0; i < scatterData.length; i++) {
		for (entry in scatterData[i]) {
			if (entry === labels[col]) {
				datacol.push(+scatterData[i][entry]);
			}
			if (entry === labels[row]) {
				datarow.push(+scatterData[i][entry]);
			}
		}
	}

	for (let i = 0; i < datacol.length; i++) {
		data.push([datacol[i], datarow[i]]);
	}

	var margin = { top: 20, right: 15, bottom: 60, left: 60 },
		width = 550 - margin.left - margin.right,
		height = 350 - margin.top - margin.bottom;

	var colorMap = d3
		.scaleLinear()
		.domain([
			d3.min(data, function(d) {
				return d[0];
			}),
			d3.max(data, function(d) {
				return d[0];
			})
		])
		.range(["#77A1D3", "#DE2F53"]);

	scatterSVG = scatterSVG
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom);

	var x = d3
		.scaleLinear()
		.domain([
			d3.min(data, function(d) {
				return d[0];
			}),
			d3.max(data, function(d) {
				return d[0];
			})
		])
		.range([0, width]);

	var y = d3
		.scaleLinear()
		.domain([
			d3.min(data, function(d) {
				return d[1];
			}),
			d3.max(data, function(d) {
				return d[1];
			})
		])
		.range([height, 0]);

	var scatterCont = scatterSVG
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "scatter-cont");

	var xAxis = d3.axisBottom().scale(x);

	scatterCont
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.attr("class", "x-axis")
		.call(xAxis);

	var yAxis = d3.axisLeft().scale(y);

	scatterCont
		.append("g")
		.attr("transform", "translate(0,0)")
		.attr("class", "y-axis")
		.call(yAxis);

	//x-axis label
	scatterCont
		.append("text")
		.attr(
			"transform",
			"translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
		)
		.style("text-anchor", "middle")
		.attr("font-size", 12)
		.text(labels[col]);

	//y-axis label
	scatterCont
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - height / 2)
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.attr("font-size", 12)
		.text(labels[row]);

	scatterCont.selectAll("text").attr("fill", "grey");
	scatterCont
		.selectAll("line")
		.attr("fill", "grey")
		.attr("stroke", "grey");

	scatterCont
		.select(".x-axis")
		.selectAll("path")
		.remove();
	scatterCont
		.select(".y-axis")
		.selectAll("path")
		.remove();

	var dots = scatterCont.append("g");

	dots
		.selectAll("scatter-dots")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d, i) {
			return x(d[0]);
		})
		.attr("cy", function(d) {
			return y(d[1]);
		})
		.attr("r", 3)
		.attr("fill", function(d) {
			return colorMap(d[0]);
		});
}

d3.queue()
	.defer(d3.csv, "./corr-data/corr.csv")
	.defer(d3.csv, "./corr-data/scatter.csv")
	.await(function(err, corr, scatter) {
		if (err) console.log(err);
		/*for (let i = 0; i < corr.length; i++) {
		var temp = [];
		for (key in corr[i]) {
			if (typeof +corr[i][key] == "number") {
				temp.push(+corr[i][key]);
			}
		}
		corrMatrix.push(temp.slice(1, temp.length));
	}*/

		Matrix({
			container: "#corr-chart",
			data: corrMatrix,
			labels: labels,
			start_color: "#77A1D3",
			end_color: "#E684AE",
			scatterData: scatter
		});

		Scatter(0, 1, scatter);
	});
