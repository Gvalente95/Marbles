function linkDots(dotA, dotB, enforce = false)
{
	if (!enforce)
	{
		if (dotA.linkParent != null || !selDot || selDot == dotA)
			return;
		if (dotB != selDot && dotB.linkParent == null)
			return;
		if (dotB.linkChild && r_range(0, 1000))
			return;
		if (dotA.isLinkHead)
			return;
	}
	if (dotA.linkLine && enforce)
		deleteDotLinks(dotA);
	au.playGelSound(dotA, 1);
	dotA.linkParent = dotB;
	dotB.linkChild = dotA;
	dotA.offsetX = dotA.x - dotB.x;
	dotA.offsetY = dotA.y - dotB.y;
	const line = document.createElement("div");
	line.className = "link-line";
	if (r_range(0, 10) > 0)
		line.style.backgroundColor = dotA.style.backgroundColor;
	line.dotA = dotA;
	line.dotB = dotB;
	document.body.appendChild(line);
	dotA.linkLine = line;
	dotB.classList.add("linked");
	if (dotB == selDot || enforce) {
		dotB.isLinkHead = true;
		dotB.linkHead = dotB;
		linkHeads.push(dotB);
		dotA.linkHead = dotB;
	}
	else
		dotA.linkHead = dotB.linkHead;
}


function deleteDotLinks(dot)
{
	if (dot.linkChild) {
		const child = dot.linkChild;
		child.linkParent = null;
		if (child.linkChild) {
			child.isLinkHead = true;
			if (child.linkLine) {
				child.linkLine.remove();
				child.linkLine = null;
			}
			linkHeads.push(child);
			dot.linkChild = null;
		}
		else
			deleteDotLinks(dot.linkChild);
	}
	if (dot.linkParent) {
		const parent = dot.linkParent;
		parent.linkChild = null;
		if (!parent.linkParent) {
			parent.isLinkHead = false;
			deleteDotLinks(dot.linkParent);
		}
		else if (parent.linkLine) {
			parent.linkLine.remove();
			parent.linkLine = null;
		}
		dot.linkParent = null;
	}
	if (dot.linkLine)
		dot.linkLine.remove();
		dot.linkLine = null;
	const idx = linkHeads.indexOf(dot);
	if (idx !== -1) linkHeads.splice(idx, 1);
	dot.linkChild = null;
	dot.linkParent = null;
	dot.isLinkHead = false;
	dot.classList.remove("linked");
}

function updateLink(dot, linkParent = dot.linkParent) {
	if (!dot.linkLine || !linkParent) return;

	const x1 = dot.centerX;
	const y1 = dot.centerY;
	const x2 = linkParent.centerX;
	const y2 = linkParent.centerY;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const length = Math.sqrt(dx * dx + dy * dy);
	const angle = Math.atan2(dy, dx) * 180 / Math.PI;

	dot.linkLine.style.left = x1 + "px";
	dot.linkLine.style.top = y1 + "px";
	dot.linkLine.style.width = length + "px";
	dot.linkLine.style.transform = `rotate(${angle}deg)`;
	dot.velocityX += minmax(-10, 10, dx * stickStiff * (deltaTime * speed));
	dot.velocityY += minmax(-10, 10, dy * stickStiff * (deltaTime * speed));
	dot.velocityX *= .6;
	dot.velocityY *= .6;
	dot.style.left = dot.x + "px";
	dot.style.top = dot.y + "px";
}

function setNewLinkHead(newhead)
{
	let node = newhead.linkChild;
	while (node)
	{
		if (node.linkHead == newhead)
			return;
		const nextNode = node.linkChild;
		linkDots(node, newhead, true);
		node = nextNode;
	}
	node = newhead.linkParent;
	while (node)
	{
		if (node.linkHead == newhead)
			return;
		const nextNode = node.linkParent;
		linkDots(node, newhead, true);
		node = nextNode;
	}
}

function updateSelDot()
{
	if (selDot.inGel)
	{
		console.warn("YOPPP");	
		selDot.x += (mouseX - (selDot.x - selDot.radius)) * .1;
		selDot.y += (mouseY - (selDot.y - selDot.radius)) * .1;
	}
	else
	{
		selDot.x = mouseX - selDot.radius;
		selDot.y = mouseY - selDot.radius;
	}
	selDot.style.left = selDot.x + "px";
	selDot.style.top = selDot.y + "px";
	selDot.centerX = selDot.x + selDot.radius;
	selDot.centerY = selDot.y + selDot.radius;
	selDot.velocityX = 0;
	selDot.velocityY = 0;
}

function updateDots(dots) {
	if (selDot)
		updateSelDot();
	for (let i = 0; i < dots.length; i++) {
		const dot = dots[i];
		dot.centerX = dot.x + dot.radius;
		dot.centerY = dot.y + dot.radius;
		if (!dot.linkChild && !dot.linkParent && dot.linkLine)
			deleteDotLinks(dot);
		if (dot == selDot)
		{
			if (dot.linkParent)
				updateLink(dot);
			continue;
		}
		if (dot.linkParent)
		{
			if (stickStiff <= 0 || !selfCollision)
			{
				if (dot.linkLine)
					dot.linkLine.remove();
				dot.linkParent = null;
			}
			if (stickStiff == 1)
			{
				dot.x = dot.linkParent.x + minmax(-5, 5, dot.offsetX);
				dot.y = dot.linkParent.y + minmax(-5, 5, dot.offsetY);
				dot.style.left = dot.x + "px";
				dot.style.top = dot.y + "px";
				continue;
			}
		}
		dot.newX = dot.x + (dot.velocityX * dot.speed * (deltaTime * speed));
		dot.newY = dot.y + (dot.velocityY * dot.speed * (deltaTime * speed));
		dot.newCenterX = dot.x + dot.radius;
		dot.newCenterY = dot.y + dot.radius;
		dot.lifeTime = time - dot.startTime;
		if (dot.isLinkHead) {
			const baseAngle = Math.atan2(dot.velocityY, dot.velocityX);
			const timeFactor = time * 0.001;
			const wave = Math.sin(timeFactor + dot.id * 2) * 0.05; // Amplitude réduite
			const wiggle = (Math.random() - 0.5) * 0.01;
			dot.angle = baseAngle + wave + wiggle;
			const speed = Math.sqrt(dot.velocityX ** 2 + dot.velocityY ** 2) || 0.5;
			dot.velocityX = Math.cos(dot.angle) * speed;
			dot.velocityY = Math.sin(dot.angle) * speed;
			if (selDot && selDot == dot.linkParent)
			{
				dot.velocityX += mouseDX * .01;
				dot.velocityY += mouseDY *.01;
			}
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
		}
		else
		{
			dot.velocityY += yGravity * (deltaTime * speed);
			dot.velocityX += xGravity * (deltaTime * speed);
		}
		dot.velocityX *= 1 - xDrag * (deltaTime * speed);
		dot.velocityY *= 1 - yDrag * (deltaTime * speed);
		if (Math.abs(dot.velocityX) < 0.01) dot.velocityX = 0;
		if (Math.abs(dot.velocityY) < 0.01) dot.velocityY = 0;
		updateBorderCollision(dot);
		update_self_collisions(dot, i);
		update_box_collisions(dot);
		dot.x = dot.newX;
		dot.y = dot.newY;
		dot.style.left = dot.x + "px";
		dot.style.top = dot.y + "px";
		if (dot.linkParent)
			updateLink(dot, dot.linkParent);
	}
	dots_destroyed.forEach(d => {
		if (typeof d.onRemove === "function") d.onRemove();
		d.remove();
		dots.splice(dots.indexOf(d), 1);
	});
	dots_destroyed = [];
}

let lastTime = performance.now();
function update()
{
	time = Date.now();
	const now = performance.now() / 1000;
	deltaTime = (now - lastTime) / 1000;
	lastTime = now;
	updateDots(dots);
	requestAnimationFrame(update);
	if (now - dropTime > rate && (keys[" "] || (mousePressed && (keys["Shift"] || boxType == "box_none"))) && !isDraggingControls && !curBox && !selBox && !selDot) {
		initDots(dots, mouseX, mouseY);
		dropTime = now;
	}
	au.update();
	const ctrl_header = document.getElementById("controlsHeader")
	if (ctrl_header)
		ctrl_header.textContent = "CONTROLS";
	const ctrl = document.getElementById("controllLabel");
	if (ctrl)
		ctrl.textContent = "Dots: " + dots.length + "/ " + maxDots + " auQueue: " + au.audioQueue.length;
}
