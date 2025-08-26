function getDot(x, y, size, angle = f_range(0, 2 * Math.PI), isInBox = false, shape = null)
{
	let dot = getDotFromPool();
	const isNew = (dot == null);
	if (isNew)
	{
		dot = document.createElement("div");
		document.body.appendChild(dot);
		dots.push(dot);
		dot.onRemove = function () {
			createDotImpact(dot);
			au.playGelSound(dot);
			if (dot.linkLine)
				deleteDotLinks(dot);
		};
	}
	dot.active = true;
	dot.className = "dot";
	dot.x = x;
	dot.y = y;
	dot.startTime = Date.now();
	dot.lifetime = 0;
	dot.size = size;
	dot.canTp = true;
	dot.radius = size / 2;
	dot.lastColBox = null;
	dot.shape = shape;
	dot.hasLink = false;
	dot.isLinkHead = false;
	dot.linkParent = null;
	dot.linkChild = null;
	dot.linkHead = null;
	dot.linkLine = null;
	dot.id = r_range(0, 1000);
	dot.centerX = x + dot.radius;
	dot.centerY = y + dot.radius;
	dot.destroy = false;
	dot.mass = size * size;
	dot.width = size;
	dot.height = size;
	dot.hasTouchedBorder = false;
	dot.lastAudioBounce = dot.startTime;
	dot.style.width = size + "px";
	dot.style.height = size + "px";
	dot.angle = angle;
	dot.speed = 1;
	dot.velocityX = Math.cos(dot.angle) * dot.speed;
	dot.velocityY = Math.sin(dot.angle) * dot.speed;
	if (highLightType)
		dot.style.backgroundColor = "black";
	else
		dot.style.backgroundColor = `rgb(${r_range(0, 255)}, ${r_range(0, 255)}, ${r_range(0, 255)})`;
	dot.baseColor = dot.style.backgroundColor;
	dot.style.left = dot.x + "px";
	dot.inGel = false;
	dot.style.top = dot.y + "px";
	dot.style.display = "block";
	const sizeGroup = dot.size <= 50 / 3 ? 0 : dot.size <= 50 * 2 / 3 ? 1 : 2;
	const groupIndex = (sizeGroup * 4) + Math.floor(r_range(0, 4));
	dot.auIndex = Math.min(au.bells.length - 1, au.bells.length - 1 - groupIndex);
	if (isInBox)
		au.playGelSound(dot);
	else
		au.playMarbleSound(dot, 3, true);
	return dot;
}

function getDotFromPool() {
	for (let i = dots.length - 1; i >= 0; i--)
		if (!dots[i].active)
			return dots[i];
	return null;
}

function initDots(list, startX, startY) {
	const step = (Math.PI * 2) / amount;
	let angle = Math.PI;
	let isInBox = false;

	for (const b of boxes) {
		if (elementsOverlap(b.x, b.y, b.width, b.height, startX, startY, 1, 1)) {
			isInBox = true;
			break;
		}
	}

	if (list === dots) {
		const overdraw = (dots.length + amount) - maxDots;
		for (let i = 0; i < overdraw; i++) {
			deleteDot(dots[i]);
		}
	}

	for (let i = 0; i < amount; i++) {
		const size = r_range(minSize, maxSize);
		const radius = size;
		const offsetX = Math.cos(angle) * radius;
		const offsetY = Math.sin(angle) * radius;
		const dot = getDot(startX + offsetX, startY + offsetY, size, angle, isInBox);
		angle += step;
	}
}