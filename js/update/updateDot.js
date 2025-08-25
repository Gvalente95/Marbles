function updateSelDot()
{
	let newX, newY;
	if (selDot.inGel) {
		newX = selDot.x + (mouseX - (selDot.x - selDot.radius)) * .1;
		newY = selDot.y + (mouseY - (selDot.y - selDot.radius)) * .1;}
	else {
		newX = mouseX - selDot.radius;
		newY = mouseY - selDot.radius;}
	moveDot(selDot, newX, newY);
	selDot.velocityX = 0;
	selDot.velocityY = 0;
	let node = selDot;
	let pullFactor = 1;
	const visited = new Set();
	while (node) {
		if (node.shape)
			return;
		const parent = node.linkParent;
		if (parent && !visited.has(parent)) {
			visited.add(parent);
			const dx = parent.x + (node.x - parent.x * pullFactor);
			const dy = parent.y + (node.y - parent.y * pullFactor);
			moveDot(parent, dx, dy);
			node = parent;
			pullFactor *= 0.5;
		}else{
			node.x += pullFactor * 0.5;
			node.y += pullFactor * 0.5;
			break;
		}
	}
}

function updateDot(dot, i)
{
	dot.centerX = dot.x + dot.radius;
	dot.centerY = dot.y + dot.radius;
	if (!dot.linkChild && !dot.linkParent && dot.linkLine)
		deleteDotLinks(dot);
	if (dot == selDot)
	{
		if (dot.linkParent)
			updateLink(dot);
		return;
	}
	if (dot.linkParent)
	{
		if (stickStiff <= 0)
			deleteDotLinks(dot);
		else if (stickStiff == 1)
		{
			moveDot(dot, dot.linkParent.x + minmax(-5, 5, dot.offsetX),
				dot.linkParent.y + minmax(-5, 5, dot.offsetY));
			return;
		}
		updateLink(dot, dot.linkParent);
	}
	dot.newX = dot.x + (dot.velocityX * dot.speed * (deltaTime * speed));
	dot.newY = dot.y + (dot.velocityY * dot.speed * (deltaTime * speed));
	dot.newCenterX = dot.x + dot.radius;
	dot.newCenterY = dot.y + dot.radius;
	dot.lifetime = time - dot.startTime;
	if (dot.isLinkHead) {
		const baseAngle = Math.atan2(dot.velocityY, dot.velocityX);
		const timeFactor = time * 0.001;
		const wave = Math.sin(timeFactor + dot.id * 2) * 0.05; // Amplitude réduite
		const wiggle = (Math.random() - 0.5) * 0.01;
		dot.angle = baseAngle + wave + wiggle;
		const speed = Math.sqrt(dot.velocityX ** 2 + dot.velocityY ** 2) || 0.5;
		dot.velocityX = Math.cos(dot.angle) * speed;
		dot.velocityY = Math.sin(dot.angle) * speed;
		const margin = 80;
		const repelStrength = 1;
		if (dot.newX < margin)
			dot.velocityX += repelStrength * (1 - dot.x / margin);
		else if (dot.newX > window.innerWidth - margin)
			dot.velocityX -= repelStrength * (1 - (window.innerWidth - dot.x) / margin);
		if (dot.newY < margin)
			dot.velocityY += repelStrength * (1 - dot.y / margin);
		else if (dot.newY > window.innerHeight - margin)
			dot.velocityY -= repelStrength * (1 - (window.innerHeight - dot.y) / margin);
		applyGravity(dot, 1, .05);
	}
	else if (!dot.shape || dot.shape.first != dot)
		applyGravity(dot);
	let impact = 0;
	impact += updateBorderCollision(dot);
	impact += update_self_collisions(dot, i);
	let boxImpacts = update_box_collisions(dot);
	if (!boxImpacts)
		lastColBox = null;
	impact += boxImpacts;
	if (impact && dot.lifetime > 1000)
		applyDrag(dot);
	dot.x = dot.newX;
	dot.y = dot.newY;
	dot.style.left = dot.x + "px";
	dot.style.top = dot.y + "px";
	if (highLightType == 1)
		dot.style.backgroundColor = getVelocityColor(dot);
}

function getVelocityColor(d)
{
	let intensity = 12;
	let xVel = Math.abs(d.velocityX);
	let yVel = Math.abs(d.velocityY);
	let xClamped = minmax(0, 255, xVel * intensity);
	let yClamped = minmax(0, 255, yVel * intensity);
	return `rgb(${yClamped}, ${xClamped}, ${yClamped})`;
}

function updateDots() {
	if (selDot)
		updateSelDot();
	let di;
	for (di = 0; di < dots.length; di++)
	{
		if (!dots[di].active)
			break;
		updateDot(dots[di], di);
	}
	dotsAlive = di;
	for (let i = 0;  i < dots_destroyed.length; i++)
		deleteDot(dots_destroyed[i]);
	dots_destroyed = [];
	dots.sort((a, b) => b.active - a.active);
}

function getDotAtPos(x, y, radius = 20, list = dots, shape_index = 0) {
	const sd = selDot;
	if (sd && elementsOverlap(sd.x, sd.y, sd.size, sd.size, x, y, radius * 10, radius * 10))
		return selDot;
	let closest = null;
	let closestDiff = Infinity;
	for (let i = 0; i < list.length; i++) {
		const d = list[i];
		if (!d.active) break;
		if (!elementsOverlap(d.x, d.y, d.size, d.size, x, y, radius, radius))
			continue;
		let diff = Math.abs(x - d.x) + Math.abs(y - d.y);
		if (diff > closestDiff) continue;
		closestDiff = diff;
		closest = d;
	}
	if (!closest && shapes && shapes[shape_index])
		return getDotAtPos(x, y, radius, shapes[shape_index].dots, shape_index + 1);
	return closest;
}

function repelDots(pos, strength = 60)
{
	let radStrength = 200;
	au.playSound(au.click);
	createGelRipple(null, pos[0], pos[1], radStrength, .25, "rgba(255, 255, 255, 0.23)");
	for (const d of dots)
	{
		let distX = (d.x + d.radius) - pos[0];
		let distY = (d.y + d.radius) - pos[1];
        let distance = Math.sqrt(distX * distX + distY * distY);
		if (distance > radStrength || distance < 0.0001)
			continue;
		let angleRad = Math.atan2(distY, distX);
		let normDist = 1 - (distance / radStrength);
		d.velocityX = strength * normDist * Math.cos(angleRad);
		d.velocityY = strength * normDist * Math.sin(angleRad);
	}
}
