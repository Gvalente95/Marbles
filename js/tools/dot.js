function resizeDot(d, newRad)
{
	const diff = d.radius - newRad;
	d.size = newRad * 2;
	d.style.width = d.size + "px";
	d.style.height = d.size + "px";
	d.x += d.radius - newRad;
	d.y += d.radius - newRad;
	d.newX += diff;
	d.newY += diff;
	d.style.left = d.x + "px";
	d.style.top = d.y + "px";
	d.centerX = d.x + newRad;
	d.centerY = d.y + newRad;
	d.radius = newRad;
	d.mass = d.size * d.size;
	const sizeGroup = d.size <= 50 / 3 ? 0 : d.size <= 50 * 2 / 3 ? 1 : 2;
	const groupIndex = (sizeGroup * 4) + Math.floor(r_range(0, 4));
	d.auIndex = Math.min(au.bells.length - 1, au.bells.length - 1 - groupIndex);
}

function resizeDots() { for (const d of dots) if (d.radius < minSize / 2 || d.radius > maxSize / 2) resizeDot(d, d.radius < minSize / 2 ? minSize / 2 : maxSize / 2);}

function getVelocityColor(d)
{
	let intensity = 12;
	let xVel = Math.abs(d.velocityX);
	let yVel = Math.abs(d.velocityY);
	let xClamped = minmax(0, 255, xVel * intensity);
	let yClamped = minmax(0, 255, yVel * intensity);
	return `rgb(${yClamped}, ${xClamped}, ${yClamped})`;
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

function addLinkLine(child, parent)
{
	const line = document.createElement("div");
	line.className = "link-line";
	line.dotA = child;
	line.dotB = parent;
	line.baseDX = -1;
	line.baseDY = -1;
	document.body.appendChild(line);
	child.linkParent = parent;
	child.hasLink = true;
	if (parent)
	{
		parent.linkChild = child;
		parent.hasLink = true;
		child.offsetX = child.x - parent.x;
		child.offsetY = child.y - parent.y;
		line.baseDX = child.x - parent.x;
		line.baseDY = child.y - parent.y;
	}
	return line;
}
