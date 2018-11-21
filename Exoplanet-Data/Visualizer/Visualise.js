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

	this.render = rotation => {
		noFill();
		strokeWeight(3);
		push();
		translate(width / 2, height / 2);
		rotate(rotation);
		this.orbrad =
			(this.major * (1 - this.ecc * this.ecc)) / 1 + this.ecc * cos(this.angle);
		stroke(150)
		ellipse(0, 0, this.minor * 2, this.orbrad * 2);
		stroke(0)
		this.planetx = 0 + sin(this.angle) * this.minor;
		this.planety = 0 + cos(this.angle) * this.orbrad;
		fill(255);
		strokeWeight(4)
		stroke(255)
		fill(255)
		ellipse(this.planetx, this.planety, this.planetradius + 10);
		stroke(0)
		ellipse(this.planetx, this.planety, this.planetradius);
		fill(255);
		strokeWeight(6)
		ellipse(0, 0, 50);
		pop();
		this.angle += this.delta;
	};
}

function setup() {
	createCanvas(500, 500);
	sys1 = new System(0.8, 0.03, 200, 200, 30);
	sys2 = new System(0.6, 0.01, 100, 200, 25);
	smooth();
}

function draw() {
	background(255);
	sys1.render();
	sys2.render(10);
}
