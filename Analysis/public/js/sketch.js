//some p5.js fun while doing this project

function System(
	eccentricity,
	orbitspeed,
	semimajoraxis,
	semiminoraxis,
	planetradius
) {
	this.delta = orbitspeed;
	this.angle = random(0, 360);
	this.ecc = eccentricity;
	this.major = semimajoraxis;
	this.minor = semiminoraxis;
	this.planetradius = planetradius;

	this.render = (rotation, highlight) => {
		noFill();
		strokeWeight(3);
		push();
		translate(width / 2, height / 2);
		angleMode(DEGREES);
		rotate(rotation);
		angleMode(RADIANS);
		this.orbrad =
			(this.major * (1 - this.ecc * this.ecc)) / 1 + this.ecc * cos(this.angle);
		stroke(51, 51, 51);
		ellipse(0, 0, this.minor * 2, this.orbrad * 2);
		stroke(0);
		this.planetx = 0 + sin(this.angle) * this.minor;
		this.planety = 0 + cos(this.angle) * this.orbrad;
		if (highlight) {
			noFill();
			stroke(51, 51, 51);
			size = map(sin(frameCount * 0.05), -1.0, 1.0, 50, 70);
			ellipse(this.planetx, this.planety, size, size);
		}
		fill(255);
		strokeWeight(4);
		stroke(255);
		fill(255);
		ellipse(this.planetx, this.planety, this.planetradius + 10);
		stroke(51, 51, 51);
		ellipse(this.planetx, this.planety, this.planetradius);
		fill(255);
		strokeWeight(6);
		stroke(51, 51, 51);
		ellipse(0, 0, 50);
		pop();
		this.angle += this.delta;
	};
}

function circ(x, y) {
	console.log("created");
	this.r = 0;
	this.x = x;
	this.y = y;
	this.a = 255;
	this.exp = function (final, spd) {
		this.r = lerp(this.r, final, spd);
		this.a = lerp(this.a, 0, spd / 2);
	};
	this.draw = function () {
		noFill();
		stroke(26, 0, 0, this.a / 6);
		strokeWeight(7);
		ellipse(this.x - 2, this.y - 2, this.r);
		stroke(54, 195, 224, this.a);
		strokeWeight(7);
		ellipse(this.x, this.y, this.r);
	};
}

function setup() {
	var canvas = createCanvas(600, 400);
	canvas.parent("#vis");
	sys1 = new System(0.5, 0.03, 175, 250, 30);
	sys2 = new System(0.6, 0.01, 140, 250, 25);
	smooth();
}

function draw() {
	background(255);
	sys1.render(0, false);
	sys2.render(-35, true);
	textSize(20);
	fill(51, 51, 51);
	let w = textWidth("COROT-7");
	stroke(51, 51, 51);
	rect(width / 2 - 44, height / 2 - 55, w + 20, 23, 5, 5, 5, 5);
	textFont("Ubuntu Mono");
	textAlign(CENTER);
	noStroke();
	fill(255);
	text("COROT-7", width / 2, height / 2 - 37);
	fill(55, 55, 55);
}
