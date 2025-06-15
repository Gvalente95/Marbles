let time = 0;

function updateBorderCollision(dot, newX, newY) {
	const borderX = window.innerWidth;
	const borderY = window.innerHeight;
	const size = dot.size;

	if (newX < 0) {
		dot.hasTouchedBorder = true;
		au.playMarbleSound(dot, Math.abs(dot.velocityX));
		newX = 0;
		dot.velocityX *= -1;
	}
	else if (newX > borderX - size) {
		dot.hasTouchedBorder = true;
		au.playMarbleSound(dot, Math.abs(dot.velocityX));
		newX = borderX - size;
		dot.velocityX *= -1;
	}

	if (newY > borderY - size) {
		dot.hasTouchedBorder = true;
		au.playMarbleSound(dot, Math.abs(dot.velocityY));
		newY = borderY - size;
		dot.velocityY *= -bounceFactor;
		if (Math.abs(dot.velocityY) < 0.01) dot.velocityY = -0.5;
	}
	else if (newY < 0) {
		dot.hasTouchedBorder = true;
		au.playMarbleSound(dot, Math.abs(dot.velocityY));
		newY = 0;
		dot.velocityY *= -bounceFactor;
	}
	return [newX, newY];
}

function update_self_collisions(dot, newX, newY)
{
	const dots_amount = dots.length;
	if (!selfCollision)
		return;
	for (let j = 0; j < dots_amount; j++) {
		const other = dots[j];
		if (other == dot) continue;
		const dx = newX - other.x;
		const dy = newY - other.y;
		const distSq = dx * dx + dy * dy;
		const minDist = (dot.size + other.size) / 2;
		if (distSq < minDist * minDist)
			resolveCollision(dot, other);
	}
}

function update_box_collisions(dot, newX, newY)
{
	const boxes_amount = boxes.length;
	if (!boxes_amount)
		return;
	for (let b = 0; b < boxes_amount; b++)
	{
		const box = boxes[b];
		const radius = dot.size / 2;
		const dotCenterX = newX + radius;
		const dotCenterY = newY + radius;
		const closestX = Math.max(box.x, Math.min(dotCenterX, box.x + box.width));
		const closestY = Math.max(box.y, Math.min(dotCenterY, box.y + box.height));
		const dx = dotCenterX - closestX;
		const dy = dotCenterY - closestY;
		const distSq = dx * dx + dy * dy;
		if (distSq < radius * radius)
			resolveBoxCollision(dot, box);
	}
}

function updateDots(dots) {
	const dots_amount = dots.length;

	for (let i = 0; i < dots_amount; i++) {
		const dot = dots[i];
		let newX = dot.x + dot.velocityX;
		let newY = dot.y + dot.velocityY;

		dot.lifeTime = time - dot.startTime;
		dot.velocityY += yGravity;
		dot.velocityX += xGravity;
		dot.velocityX *= 1 - xDrag;
		dot.velocityY *= 1 - yDrag;
		let newP = updateBorderCollision(dot, newX, newY);
		newX = newP[0], newY = newP[1];
		update_self_collisions(dot, newX, newY);
		dot.x = newX;
		dot.y = newY;
		update_box_collisions(dot, newX, newY);
		dot.style.left = newX + "px";
		dot.style.top = newY + "px";
	}
}

function resolveBoxCollision(dot, box)
{
	const borderX = box.x;
	const borderY = box.y;
	const endX = box.x + box.width;
	const endY = box.y + box.height;
	const size = dot.size;

	if (dot.x + size < borderX || dot.x > endX || dot.y + size < borderY || dot.y > endY) {
		return;
	}
	const xDist = Math.abs(dot.x + size - borderX);
	const yDist = Math.abs(dot.y + size - borderY);
	if (xDist < yDist)
	{
		dot.x = dot.x < borderX + box.width / 2 ? borderX - size : endX;
		dot.hasTouchedBorder = true;
		au.playMarbleSound(dot, Math.abs(dot.velocityX));
		dot.velocityX *= -1;
		return;
	}
	if (yDist < xDist)
	{
		dot.y = dot.y < borderY + box.height / 2 ? borderY - size : endY;
		dot.hasTouchedBorder = true;
		au.playMarbleSound(dot, Math.abs(dot.velocityY));
		dot.velocityY *= -1;
	}
}

function resolveCollision(dotA, dotB) {
	const xDist = dotB.x - dotA.x;
	const yDist = dotB.y - dotA.y;
	const dist = Math.sqrt(xDist * xDist + yDist * yDist);
	const minDist = (dotA.size + dotB.size) / 2;

	if (dist === 0 || dist >= minDist) return;

	const overlap = minDist - dist;
	const dx = xDist / dist;
	const dy = yDist / dist;

	const totalMass = dotA.mass + dotB.mass;
	const pushA = (dotB.mass / totalMass) * overlap;
	const pushB = (dotA.mass / totalMass) * overlap;

	dotA.x -= dx * pushA;
	dotA.y -= dy * pushA;
	dotB.x += dx * pushB;
	dotB.y += dy * pushB;

	// Only resolve if moving toward each other
	const xVelocityDiff = dotA.velocityX - dotB.velocityX;
	const yVelocityDiff = dotA.velocityY - dotB.velocityY;

	if (xVelocityDiff * dx + yVelocityDiff * dy >= 0) {
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
		au.playMarbleSound(dotA, Math.abs(vFinal1.x) + Math.abs(vFinal1.y));
	}
}

function rotate(velocity, angle) {
	return {
		x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
		y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
	};
}

function update()
{
	time = Date.now();
	updateDots(dots);
	requestAnimationFrame(update);
	if (mousePressed && !curBox) {
		initDots(dots, mouseX, mouseY);
	}
	au.update();
	document.getElementById("amount").textContent = dots.length;
	document.getElementById("maxDots").textContent = maxDots;
}