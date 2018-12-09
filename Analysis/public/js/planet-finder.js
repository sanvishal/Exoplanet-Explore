var masterData;
var findPlanetByName;

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
});

var findPlanetbyHTML = (key, parent, child, attr, callback) => {
	parent.selectAll(child).each(function() {
		if (key === d3.select(this).attr(attr)) {
			callback(this);
		}
	});
};

//https://stackoverflow.com/questions/38575721/grouping-json-by-values
var groupBy = (data, key, onlyData, callback) => {
	if (!onlyData) {
		callback(
			data.reduce(function(rv, x) {
				(rv[x[key]] = rv[x[key]] || []).push(x);
				return rv;
			}, {})
		);
	} else {
		callback(
			data.reduce(function(rv, x) {
				(rv[x[key]] = rv[x[key]] || []).push(x);
				return rv;
			}, {})
		);
	}
};

function groupBySpec(array, f) {
	var groups = {};
	array.forEach(function(o) {
		var group = JSON.stringify(f(o));
		groups[group] = groups[group] || [];
		groups[group].push(o);
	});
	return Object.keys(groups).map(function(group) {
		return groups[group];
	});
}

var removeDups = ele => ele.filter((v, i) => ele.indexOf(v) === i);
