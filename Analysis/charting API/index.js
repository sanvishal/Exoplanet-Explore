function Controller(data) {
	this.initialize = callback => {
		this.data = data;
	};

	this.getOne = (param, callback, start = 0, end = this.data.length) => {
		result = [];
		for (i = start; i < end; i++) {
			result.push(this.data[i][param]);
		}
		callback(result);
	};

	this.getPair = (
		param1,
		param2,
		callback,
		start = 0,
		end = this.data.length
	) => {
		var pair1 = [],
			pair2 = [];
		for (i = start; i < end; i++) {
			pair1.push(this.data[i][param1]);
			pair2.push(this.data[i][param2]);
		}
		callback([pair1, pair2]);
	};

	this.getMany = (params, callback, start = 0, end = this.data.length) => {
		result = [];
		console.log(params);
		for (i = 0; i < params.length; i++) {
			result.push([]);
			for (j = start; j < end; j++) {
				result[i].push(this.data[j][params[i]]);
			}
		}
		callback(result);
	};
}

function DrawChart(type, axes) {
	/*
		params:-
			type(String): bar, line, sector, pie
			axes(Array): Refer legend()
		Draws a Chart/graph in a canvas element
	*/

	let barChart = new Chart(chart, {
		type: type,
		data: {
			labels: axes[0],
			datasets: [
				{
					label: "Label1",
					data: axes[1],
					borderColor: "#333333",
					hoverBorderWidth: 10
				},
				{
					label: "Label2",
					data: axes[2],
					borderColor: "#ffffff",
					hoverBorderWidth: 10
				}
			]
		},
		options: {
			scales: {
				xAxes: [
					{
						ticks: {
							autoSkip: false
						},
						display: true
					}
				],
				yAxes: [
					{
						display: true,
						ticks: {
							beginAtZero: false,
							steps: 10,
							stepValue: 5,
							max: 10000
						}
					}
				]
			},
			title: {
				display: true,
				text: "Analysis"
			}
		}
	});
}

var data,
	db,
	isLoaded = false;

//https://stackoverflow.com/a/34579496
function readJSON(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText);
		}
	};
	rawFile.send(null);
}

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 18;

let chart = document.getElementById("chart").getContext("2d");

readJSON("../Exoplanet-Data/processed-json/planets.json", response => {
	data = JSON.parse(response);
	db = new Controller(data);
	db.initialize();
	isLoaded = true;

	db.getMany(
		["Host Name", "Effective Temperature [K]", "Stellar Radius [Solar radii]"],
		response => {
			for (i = 0; i < response[2].length; i++) {
				response[2][i] *= 300;
			}
			DrawChart("line", [response[0], response[1], response[2]]);
		},
		0,
		20
	);
});
