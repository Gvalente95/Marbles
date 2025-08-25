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
	const viscosity = 0.8;
	const friction = Math.pow(1 - viscosity, depthRatio);
	dot.velocityX *= friction;
	dot.velocityY *= friction;
}

function concretizeDot(dot, box) {
	const dotLeft   = dot.newX;
	const dotRight  = dot.newX + dot.size;
	const dotTop    = dot.newY;
	const dotBottom = dot.newY + dot.size;

	const boxLeft   = box.x;
	const boxRight  = box.x + box.width;
	const boxTop    = box.y;
	const boxBottom = box.y + box.height;

	const overlapLeft   = dotRight - boxLeft;
	const overlapRight  = boxRight - dotLeft;
	const overlapTop    = dotBottom - boxTop;
	const overlapBottom = boxBottom - dotTop;

	let minOverlap = Infinity;
	let side = null;

	if (dot.newX > boxLeft && dot.newX + dot.size < boxRight && dot.newY > boxTop && dot.newY + dot.size < boxBottom)
	{
		const left = Math.abs(overlapLeft), right = Math.abs(overlapRight), top = Math.abs(overlapTop), bottom = Math.abs(overlapBottom);
		if (left < bottom || left < top || right < bottom || right < top)
		{
			let newX = left < right ? boxLeft - dot.size : boxRight;
			dot.newX = newX;
		}
		else
		{
			let newY = top < bottom ? boxTop - dot.size : boxBottom;
			dot.newY = newY;
		}
	}

	if (dotRight > boxLeft && dotLeft < boxLeft && overlapLeft < minOverlap) {
		minOverlap = overlapLeft;
		side = "left";
	}
	if (dotLeft < boxRight && dotRight > boxRight && overlapRight < minOverlap) {
		minOverlap = overlapRight;
		side = "right";
	}
	if (dotBottom > boxTop && dotTop < boxTop && overlapTop < minOverlap) {
		minOverlap = overlapTop;
		side = "top";
	}
	if (dotTop < boxBottom && dotBottom > boxBottom && overlapBottom < minOverlap) {
		minOverlap = overlapBottom;
		side = "bottom";
	}

	let isImpact = false;

	switch (side) {
		case "left":
			dot.velocityX *= -bounceFactor;
			dot.newX = box.x - dot.size;
			isImpact = Math.abs(dot.velocityX);
			break;
		case "right":
			dot.velocityX *= -bounceFactor;
			dot.newX = box.x + box.width;
			isImpact = Math.abs(dot.velocityX);
			break;
		case "top":
			dot.velocityY *= -bounceFactor;
			dot.newY = box.y - dot.size;
			isImpact = Math.abs(dot.velocityY);
			break;
		case "bottom":
			dot.velocityY *= -bounceFactor;
			dot.newY = box.y + box.height;
			isImpact = Math.abs(dot.velocityY);
			break;
	}

	if (isImpact > 1 && !menuBlock.active) {
		au.playBoxSound(dot, box);
		au.playMarbleSound(dot, Math.abs(dot.velocityX) + Math.abs(dot.velocityY));
	}
	if (Math.abs(box.velocityX) < .5 && Math.abs(box.velocityY) < .5)
		return;
	if (dot.newX < 0 || dot.newX > window.innerWidth - dot.size)
	{
		if (dot.velocityY == 0) dot.velocityY = .1;
		if (Math.abs(dot.velocityY) < 3) dot.velocityY *= 2;
		if (dot.velocityY < 0 && overlapBottom < overlapTop)
			dot.velocityY *= -1;
		if ((dot.velocityY < 0 && boxTop < dot.size) || (dot.velocityY > 0 && boxBottom > window.innerHeight - dot.size))
			dot.velocityY *= -1;
		dot.velocityY *= 1.5;
	}
	if (dot.newY < 0 || dot.newY > window.innerHeight - dot.size)
	{
		if (dot.velocityX == 0) dot.velocityY = .1;
		if (Math.abs(dot.velocityX) < 3) dot.velocityX *= 2;
		if (dot.velocityX < 0 && overlapRight < overlapLeft)
			dot.velocityX *= -1;
		if ((dot.velocityX < 0 && boxLeft < dot.size) || (dot.velocityX > 0 && boxRight > window.innerHeight - dot.size))
			dot.velocityY *= -1;
		dot.velocityX *= 1.5;
	}
}

function breakDot(dot, box)
{
	if (dot.radius < 10)
		return;
	const marge = 50;
	const revAngle = getRevAngle(dot.angle);
	const dotX = minmax(marge, window.innerWidth - marge, dot.x);
	const dotY = minmax(marge, window.innerHeight - marge, dot.y);
	let newDot = getDot(dotX, dotY, dot.size / 2, revAngle);
	deleteDot(dot);
	dots.push(newDot);
}

function teleportDot(dot, boxA, boxB, boxACenterX, boxACenterY) {
	let centerXDiff = dot.centerX - boxACenterX;
	let centerYDiff = dot.centerY - boxACenterY;
	let newPX = boxB.x + boxB.width / 2 - dot.radius;
	let newPY = boxB.y + boxB.height / 2 - dot.radius;
	dot.newX = minmax(boxB.x - dot.radius - 5, boxB.x + boxB.width + 5, newPX - (centerXDiff * (boxB.width / boxA.width)));
	dot.newY = minmax(boxB.y - dot.radius - 5, boxB.y + boxB.height + 5, newPY - (centerYDiff * (boxB.height / boxA.height)));
	dot.x = dot.newX;
	dot.y = dot.newY;
	dot.style.left = dot.newX + "px";
	dot.style.top = dot.newY + "px";
	dot.velocityX *= 0.8;
	dot.velocityY *= 0.8;
	au.playSound(au.click, 0.5);
	if (dot.isLinkHead)
		CollapseLink(dot);
	return 1;
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
	let attractSpeed = lerp(1, 2.5, boxNorm) * lerp(0.15, 0.35, massNorm);
	let orbitSpeed = lerp(4.5, 3.5, boxNorm) * lerp(.4, 0.35, massNorm);
	// if (box.width < 300)
	// {
	// 	orbitSpeed *= .3;
	// 	attractSpeed *= 2;
	// }
	console.warn(box.width);
	dot.velocityX += dirX * attractSpeed * deltaTime * speed;
	dot.velocityY += dirY * attractSpeed * deltaTime * speed;
	dot.velocityX += tangentX * orbitSpeed * deltaTime * speed;
	dot.velocityY += tangentY * orbitSpeed * deltaTime * speed;
	let drag = .75;
	dot.velocityX *= drag;
	dot.velocityY *= drag;
	dot.newX += (dot.newX - dot.x) * .9;
	dot.newY += (dot.newY - dot.y) * .9;
	if (!dot.inGel || r_range(0, 500) == 0)
	{
		dot.inGel = 1;
		au.playBoxSound(dot, box);
	}
}


function resolveBoxCollision(dot, box)
{
	// if (box.type === "Vortex") {
	// 	const dx = dot.x - box.x;
	// 	const dy = dot.y - box.y;
	// 	const distance = Math.sqrt(dx * dx + dy * dy);
	// 	if (distance > box.radius)
	// 		return 0;
	// }
	// else if (!dotInOverlap(dot, box))
	// 	return (0);
	const boxCenterX = box.x + box.width / 2;
	const boxCenterY = box.y + box.height / 2;
	if (box == tpa && tpb)
		return teleportDot(dot, tpa, tpb, boxCenterX, boxCenterY);
	else if (box == tpb && tpa)
		return teleportDot(dot, tpb, tpa, tpb.x + tpb.width / 2, tpb.y + tpb.height / 2);
	switch (box.className)
	{
		case "Gelatine": absorbDot(dot, box); break;
		case "Concrete": concretizeDot(dot, box); break;
		case "Vortex": orbitDot(dot, box, boxCenterX, boxCenterY);  break;
		case "Magnetite": breakDot(dot, box); break;
	}
	dot.lastColBox = box;
	return (1);
}

function update_box_collisions(dot)
{
	const boxes_amount = boxes.length;
	if (!boxes_amount)
		return 0;
	let hasBoxCollisions = 0;
	for (let b = 0; b < boxes_amount; b++)
	{
		const box = boxes[b];
		const dotCenterX = dot.newX + dot.radius;
		const dotCenterY = dot.newY + dot.radius;
		const closestX = Math.max(box.x, Math.min(dotCenterX, box.x + box.width));
		const closestY = Math.max(box.y, Math.min(dotCenterY, box.y + box.height));
		if (box.type === "Vortex") {
				const boxCenterX = box.x + box.width / 2;
				const boxCenterY = box.y + box.height / 2;
				const dx = dotCenterX - boxCenterX;
				const dy = dotCenterY - boxCenterY;
				const distanceSquared = dx * dx + dy * dy;
				const vortexRadius = box.width / 2;
					const totalRadius = dot.radius + vortexRadius;
				if (distanceSquared <= totalRadius * totalRadius)
					hasBoxCollisions += resolveBoxCollision(dot, box);
		}
		else
		{
			const dx = dotCenterX - closestX;
			const dy = dotCenterY - closestY;
			const distSq = dx * dx + dy * dy;
			if (distSq < dot.radius * dot.radius)
				hasBoxCollisions += resolveBoxCollision(dot, box);
		}
	}
	if (!hasBoxCollisions)
		dot.inGel = false;
	return hasBoxCollisions;
}

function resolveSelfCollision(dotA, dotB) {
	if (dotB.isLinkHead)
		return (0);
	let xDist = dotB.x - dotA.x;
	let yDist = dotB.y - dotA.y;
	let dist = Math.sqrt(xDist * xDist + yDist * yDist);
	const minDist = (dotA.size + dotB.size) / 2 + 0.1;

	linkDots(dotA, dotB);
	linkDots(dotB, dotA);
	// if (dist === 0) {
	// 	const angle = Math.random() * 2 * Math.PI;
	// 	xDist = Math.cos(angle);
	// 	yDist = Math.sin(angle);
	// 	dist = 1e-6;
	// } else if (dist >= minDist)
	// 	return;
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
		if (!dotA.lastColBox || dotA.lastColBox.type == "Vortex")
			return (1);
		let sum = Math.abs(vFinal1.x + Math.abs(vFinal1.y));
		if (sum > 4)
			au.playMarbleSound(dotA, sum);
	}
	return (1);
}

function update_self_collisions(dot, i, list = dots, shapeIndex = 0)
{
	if (!selfCollision)
		return (0);
	// if (dot.isLinkHead)
	// 	return;
	let hasCollisions = 0;
	for (let j = i + 1; j < list.length; j++) {
		const other = list[j];
		if (!other.active) break;
		if (other == dot) continue;
		const dx = dot.newX - other.x;
		const dy = dot.newY - other.y;
		const distSq = dx * dx + dy * dy;
		const minDist = (dot.size + other.size) / 2;
		if (distSq < minDist * minDist)
			hasCollisions += resolveSelfCollision(dot, other);
	}
	if (shapes[shapeIndex])
		hasCollisions += update_self_collisions(dot, i, shapes[shapeIndex].dots, shapeIndex + 1);
	return hasCollisions;
}

function updateBorderCollision(dot) {
	const borderX = window.innerWidth;
	const borderY = window.innerHeight;
	const size = dot.size;
	const minTreshold = 2;
	let	hasImpact = 0;

	let valueUsed = 0;
	if (dot.newX < 0) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityX);
		dot.newX = 0 + (xGravity > 0 ? 1 : 0);
		dot.velocityX *= -.999;
		hasImpact = 1;
		if (valueUsed < minTreshold)
			dot.velocityX = 0;
	}
	else if (dot.newX > borderX - size) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityX);
		dot.newX = borderX - size - (xGravity < 0 ? 1 : 0);
		dot.velocityX *= -.999;
		hasImpact = 1;
		if (valueUsed < minTreshold)
			dot.velocityX = 0;
	}
	if (dot.newY > borderY - size) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityY);
		dot.newY = borderY - size - (yGravity < 0 ? 1 : 0);
		dot.velocityY *= -Math.max(.1, bounceFactor);
		dot.velocityY *= .999;
		hasImpact = 1;
		if (valueUsed < minTreshold)
			dot.velocityY = 0;
	}
	else if (dot.newY < 0) {
		dot.hasTouchedBorder = true;
		valueUsed = Math.abs(dot.velocityY);
		dot.newY = 0 + (yGravity > 0 ? 1 : 0);
		dot.velocityY *= -Math.max(.1, bounceFactor);
		dot.velocityY *= .999;
		hasImpact = 1;
		if (valueUsed < minTreshold)
			dot.velocityY = 0;
	}
	if (valueUsed > 2 && !dot.shape)
		au.playMarbleSound(dot, valueUsed);
	return hasImpact;
}
