function absorbDot(dot, box)
{
	if (!dot.inGel)
	{
		if (dot.velocityX > .1 || dot.velocityY > .1)
			au.playGelSound(dot);
		dot.velocityX *= .25;
		dot.velocityY *= .25;
		dot.newX += (dot.x - dot.newX) * .1;
		dot.newY += (dot.y - dot.newY) * .1;
		dot.inGel = true;
		return;
	}
	const boxTop = box.y;
	const boxBottom = box.y + box.height;
	const dotTop = dot.y;
	const dotBottom = dot.y + dot.size;
	const immersedTop = Math.max(dotTop, boxTop);
	const immersedBottom = Math.min(dotBottom, boxBottom);
	const immersedHeight = Math.max(0, immersedBottom - immersedTop);
	const depthRatio = Math.min(1, immersedHeight / dot.size);
	const viscosity = 0.91;
	const friction = Math.pow(1 - viscosity, depthRatio);
	dot.velocityX *= friction;
	dot.velocityY *= friction;
}

function magnetizeDot(dot, box)
{
	
}

function concretizeDot(dot, box)
{
	const dl = Math.abs(dot.centerX - box.x);
	const dr = Math.abs(dot.centerX - (box.x + box.width));
	const dt = Math.abs(dot.centerY - box.y);
	const db = Math.abs(dot.centerY - (box.y + box.height));
	const md = Math.min(dl, dr, dt, db);
	let sides = [];
	if (Math.abs(dl - md) < .1) sides.push("left");
	if (Math.abs(dr - md) < .1) sides.push("right");
	if (Math.abs(dt - md) < .1) sides.push("top");
	if (Math.abs(db - md) < .1) sides.push("bottom");
	au.playMarbleSound(dot, Math.abs(dot.velocityX) + Math.abs(dot.velocityY));
	if (sides.includes("left") || sides.includes("right")) {
		dot.velocityX *= -bounceFactor;
		if (sides.includes("left") && dot.newX + dot.size > box.x)
			dot.newX = box.x - dot.size;
		if (sides.includes("right") && dot.newX < box.x + box.width)
			dot.newX = box.x + box.width;
	}
	if (sides.includes("top") || sides.includes("bottom")) {
		dot.velocityY *= -bounceFactor;
		if (sides.includes("top") && dot.newY + dot.size > box.y)
			dot.newY = box.y - dot.size;
		if (sides.includes("bottom") && dot.newY < box.y + box.height)
			dot.newY = box.y + box.height;
	}
}

function teleportDot(dot, boxA, boxB, boxACenterX, boxACenterY)
{
	let centerXDiff = dot.centerX - boxACenterX;
	let centerYDiff = dot.centerY - boxACenterY;
	let newPX = boxB.x + boxB.width / 2 - dot.radius;
	let newPY = boxB.y + boxB.height / 2 - dot.radius;
	dot.newX = minmax(boxB.x - dot.radius - 5, boxB.x + boxB.width + 5, newPX - (centerXDiff * 1.2 * (boxA.width / boxB.width)));
	dot.newY = minmax(boxB.y - dot.radius - 5, boxB.y + boxB.height + 5, newPY - (centerYDiff * 1.2 * (boxA.height / boxB.height)));
	dot.style.left = dot.x + "px";
	dot.style.top = dot.y + "px";
	dot.velocityX *= .5;
	dot.velocityY *= .5;
	return true;
}

function orbitDot(dot, box, boxCenterX, boxCenterY)
{
	const angleToBox = Math.atan2(boxCenterY - dot.centerY, boxCenterX - dot.centerX);

	const dirX = Math.cos(angleToBox);
	const dirY = Math.sin(angleToBox);
	const tangentX = -dirY;
	const tangentY = dirX;
	const massNorm = dot.mass / (maxSize * maxSize);
	const boxArea = box.width * box.height;
	const maxBoxArea = (window.innerWidth / 2) * (window.innerHeight / 2);
	const boxNorm = boxArea / maxBoxArea;
	const attractSpeed = lerp(1, 5, boxNorm) * lerp(0.5, 2, massNorm);
	const orbitSpeed = lerp(1.5, 0.4, boxNorm) * lerp(2, 0.7, massNorm);
	dot.velocityX += dirX * attractSpeed * deltaTime * speed;
	dot.velocityY += dirY * attractSpeed * deltaTime * speed;
	dot.velocityX += tangentX * orbitSpeed * deltaTime * speed;
	dot.velocityY += tangentY * orbitSpeed * deltaTime * speed;
	dot.velocityX *= .7;
	dot.velocityY *= .7;
	dot.newX += (dot.newX - dot.x) * .9;
	dot.newY += (dot.newY - dot.y) * .9;
}

function resolveBoxCollision(dot, box)
{
	if (!boxesOverlap(dot.newX, dot.newY, dot.size, dot.size, box.x, box.y, box.width, box.height))
		return false;
	const boxCenterX = box.x + box.width / 2;
	const boxCenterY = box.y + box.height / 2;
	if (box == tpa && tpb)
		return teleportDot(dot, tpa, tpb, boxCenterX, boxCenterY);
	else if (box == tpb && tpa)
		return teleportDot(dot, tpb, tpa, tpb.x + tpb.width / 2, tpb.y + tpb.height / 2);
	switch (box.className)
	{
		case "box_gelatine":
			absorbDot(dot, box);
			break;
		case "box_concrete":
			concretizeDot(dot, box);
			break;
		case "box_vortex": orbitDot(dot, box, boxCenterX, boxCenterY);  break;
		case "box_magnetite":
			break;
	}
	return true;
}

function update_box_collisions(dot)
{
	const boxes_amount = boxes.length;
	if (!boxes_amount)
		return;
	let hasBoxCollisions = false;
	for (let b = 0; b < boxes_amount; b++)
	{
		const box = boxes[b];
		const dotCenterX = dot.newX + dot.radius;
		const dotCenterY = dot.newY + dot.radius;
		const closestX = Math.max(box.x, Math.min(dotCenterX, box.x + box.width));
		const closestY = Math.max(box.y, Math.min(dotCenterY, box.y + box.height));
		const dx = dotCenterX - closestX;
		const dy = dotCenterY - closestY;
		const distSq = dx * dx + dy * dy;
		if (distSq < dot.radius * dot.radius)
			hasBoxCollisions = resolveBoxCollision(dot, box);
	}
	if (!hasBoxCollisions)
		dot.inGel = false;
}

function resolveSelfCollision(dotA, dotB) {
	let xDist = dotB.x - dotA.x;
	let yDist = dotB.y - dotA.y;
	let dist = Math.sqrt(xDist * xDist + yDist * yDist);
	const minDist = (dotA.size + dotB.size) / 2 + 0.1;

	linkDots(dotA, dotB);
	linkDots(dotB, dotA);
	if (dist === 0) {
		const angle = Math.random() * 2 * Math.PI;
		xDist = Math.cos(angle);
		yDist = Math.sin(angle);
		dist = 1e-6;
	} else if (dist >= minDist)
		return;
	const overlap = minDist - dist;
	const totalMass = dotA.mass + dotB.mass;
	const pushA = (dotB.mass / totalMass) * overlap;
	const pushB = (dotA.mass / totalMass) * overlap;

	dotA.newX -= xDist * (pushA / dist);
	dotA.newY -= yDist * (pushA / dist);
	dotB.x    += xDist * (pushB / dist);
	dotB.y    += yDist * (pushB / dist);
	const xVelocityDiff = dotA.velocityX - dotB.velocityX;
	const yVelocityDiff = dotA.velocityY - dotB.velocityY;

	if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
		const angle = -Math.atan2(yDist, xDist);
		const u1 = rotate({ x: dotA.velocityX, y: dotA.velocityY }, angle);
		const u2 = rotate({ x: dotB.velocityX, y: dotB.velocityY }, angle);
		const m1 = dotA.mass;
		const m2 = dotB.mass;

		const v1 = {
			x: (u1.x * (m1 - m2) + 2 * m2 * u2.x) / (m1 + m2),
			y: u1.y
		};
		const v2 = {
			x: (u2.x * (m2 - m1) + 2 * m1 * u1.x) / (m1 + m2),
			y: u2.y
		};

		const vFinal1 = rotate(v1, -angle);
		const vFinal2 = rotate(v2, -angle);
		dotA.velocityX = vFinal1.x;
		dotA.velocityY = vFinal1.y;
		dotB.velocityX = vFinal2.x;
		dotB.velocityY = vFinal2.y;
		let sum = Math.abs(vFinal1.x + Math.abs(vFinal1.y));
		if (sum > 4)
			au.playMarbleSound(dotA, sum);
	}
}

function update_self_collisions(dot, i)
{
	if (!selfCollision)
		return;
	if (dot.isLinkHead)
		return;
	for (let j = i + 1; j < dots.length; j++) {
		const other = dots[j];
		if (other == dot) continue;
		const dx = dot.newX - other.x;
		const dy = dot.newY - other.y;
		const distSq = dx * dx + dy * dy;
		const minDist = (dot.size + other.size) / 2;
		if (distSq < minDist * minDist)
			resolveSelfCollision(dot, other);
	}
}

function updateBorderCollision(dot) {
	const borderX = window.innerWidth;
	const borderY = window.innerHeight;
	const size = dot.size;
	const minTreshold = 2;

	let valueUsed = 0;
	if (dot.newX < 0) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityX);
		dot.newX = 0 + (xGravity > 0 ? 1 : 0);
		dot.velocityX *= -.999;
		if (valueUsed < minTreshold)
			dot.velocityX = 0;
	}
	else if (dot.newX > borderX - size) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityX);
		dot.newX = borderX - size - (xGravity < 0 ? 1 : 0);
		dot.velocityX *= -.999;
		if (valueUsed < minTreshold)
			dot.velocityX = 0;
	}
	if (dot.newY > borderY - size) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityY);
		dot.newY = borderY - size - (yGravity < 0 ? 1 : 0);
		dot.velocityY *= -Math.max(.1, bounceFactor);
		dot.velocityY *= .999;
		if (valueUsed < minTreshold)
			dot.velocityY = 0;
	}
	else if (dot.newY < 0) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityY);
		dot.newY = 0 + (yGravity > 0 ? 1 : 0);
		dot.velocityY *= -Math.max(.1, bounceFactor);
		dot.velocityY *= .999;
		if (valueUsed < minTreshold)
			dot.velocityY = 0;
	}
	if (valueUsed > 2)
		au.playMarbleSound(dot, valueUsed);
}
