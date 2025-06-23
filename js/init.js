function getDot(x, y, size, angle = f_range(0, 2 * Math.PI), isInBox = false, shape = null)
{
	const dot = document.createElement("div");
	dot.className = "dot";
	dot.x = x;
	dot.y = y;
	dot.startTime = Date.now();
	dot.lifetime = 0;
	dot.size = size;
	dot.radius = size / 2;
	dot.linkParent = null;
	dot.shape = shape;
	dot.linkChild = null;
	dot.linkHead = null;
	dot.linkLine = null;
	dot.isLinkHead = false;
	dot.id = r_range(0, 1000);
	dot.centerX = x + dot.radius;
	dot.destroy = false;
	dot.centerY = y + dot.radius;
	dot.mass = size * size;
	dot.hasTouchedBorder = false;
	dot.lastAudioBounce = dot.startTime;
	dot.style.width = size + "px";
	dot.style.height = size + "px";
	dot.angle = angle;
	dot.speed = 1;
	dot.velocityX = Math.cos(dot.angle) * dot.speed;
	dot.velocityY = Math.sin(dot.angle) * dot.speed;
	dot.style.backgroundColor = `rgb(${r_range(0, 255)}, ${r_range(0, 255)}, ${r_range(0, 255)})`;
	dot.baseColor = dot.style.backgroundColor;
	dot.style.left = dot.x + "px";
	dot.inGel = false;
	dot.style.top = dot.y + "px";
	dot.onmouseenter = function () {
	};
	dot.onRemove = function () {
		createDotImpact(dot);
		au.playGelSound(dot);
		console.warn("calling on remove");
		if (dot.linkLine)
			deleteDotLinks(dot);
	};
	const sizeGroup = dot.size <= 50 / 3 ? 0 : dot.size <= 50 * 2 / 3 ? 1 : 2;
	const groupIndex = (sizeGroup * 4) + Math.floor(r_range(0, 4));
	dot.auIndex = Math.min(au.bells.length - 1, au.bells.length - 1 - groupIndex);
	if (isInBox)
		au.playGelSound(dot);
	else
		au.playMarbleSound(dot, 3, true);
	document.body.appendChild(dot);
	return dot;
}

function initDots(list, startX, startY)
{
	const step = (Math.PI * 2) / amount;
	let angle = Math.PI;
	let isInBox = false;
	boxes.forEach(b => {
		if (elementsOverlap(b.x, b.y, b.width, b.height, startX, startY, 1, 1))
			isInBox = true;
	});
	const overdraw = (list.length + amount) - maxDots;
	if (overdraw > 0)
	{
		for (let i = 0; i < overdraw; i++)
		{
			dots[i].onRemove();
			dots[i].remove();
		}
		dots.splice(0, overdraw);
	}
	for (let i = 0; i < amount; i++)
	{
		const size = r_range(minSize, maxSize);
		const radius = size;
		const offsetX = Math.cos(angle) * radius;
		const offsetY = Math.sin(angle) * radius;
		list.push(getDot(startX + offsetX, startY + offsetY, size, angle, isInBox));
		angle += step;
	}
}

function init_box(x, y, width = 1, height = 1, type = boxType)
{
	const box = document.createElement("div");
	box.className = type;
	box.x = x;
	box.y = y;
	box.style.left = x + "px";
	box.style.top = y + "px";
	box.screws = [];
	box.width = width;
	box.angle = 0;
	box.connectedBoxes = [];
	box.height = height;
	box.tranf
	addRotator(box);
	box.active = false;
	box.velocityX = 0;
	box.velocityY = 0;
	box.style.display = "block";
	box.style.width = width + "px";
	box.style.height = height + "px";
	if (type == "Teleport") {
		let newClr;
		if (!tpa) { newClr = "green"; tpa = box;}
		else if (!tpb){ tpb = box; newClr = "red";}
		else if (prvTpClr == "red"){ newClr = "green"; tpa.remove(); tpa = box;}
		else{ tpb.remove(); tpb = box; newClr = "red";	}
		prvTpClr = newClr;
		box.style.backgroundColor = newClr;
	}
	box.onRemove = function ()
	{
		box.connectedBoxes.forEach(b => {
			b.connectedBoxes.splice(b.connectedBoxes.indexOf(box));
			b.screws.forEach(s => { if (s.other == box) s.remove(); });
		});
		if (box === tpa) tpa = null;
		else if (box === tpb) tpb = null;
	};
	document.body.appendChild(box);
	if (box.type == "Vortex")
	{
		const circle = document.createElement("div");
		circle.className = "dot";
		circle.style.x = 10 + "px";
		circle.style.y = 10 + "px";
		box.appendChild(circle);
	}
	else
		addResizers(box);
	box.addEventListener("mousedown", (e) => {
		if (selBox || selDot || isResizing)
			return;
		e.preventDefault();
		if (prvBox)
			prvBox.style.zIndex = 100;
		box.style.zIndex = 101;
		selBox = box;
	});
	box.addEventListener("mouseup", (e) => {
		prvBox = box;
	});
	box.addEventListener("mousemove", () => {
		document.body.style.cursor = selBox ? "grab" : "pointer";});
	box.addEventListener("mouseleave", () => {
	document.body.style.cursor = "default";});
	return box;
}

function initShape(x, y)
{
	const newShape = document.createElement("div");
	newShape.x = x;
	newShape.y = y;
	newShape.style.left = x;
	newShape.style.top = y;
	newShape.dots = [];
	newShape.style.position = "absolute";
	newShape.first = null;
	newShape.velocityX = 0;
	newShape.velocityY = 0;
	newShape.last = null;
	document.body.appendChild(newShape);
	newShape.first = addToShape(newShape, x, y, true);
	shapes.push(newShape);
	au.playRandomSound(au.stretchSounds, .1);
	return newShape;
}

function addToShape(shape, x, y, isFirst = false, closeShape = false)
{
	const firstDot = shape.dots[0];
	let isLast = closeShape ? true : firstDot && shape.dots.length > 30 && (Math.abs(x - firstDot.x) < 10 && Math.abs(y - firstDot.y) < 10);
	if (isLast && !closeShape)
		mousePressed = false;
	const prevDot = isFirst ? null : isLast ? firstDot : shape.dots[shape.dots.length - 1];
	const newDot = getDot(x, y, 50, 0, false, shape);
	newDot.speed = lineSpeed;
	newDot.velocityX = 0;
	newDot.velocityY = 0;
	newDot.linkParent = null;
	newDot.style.position = "absolute";
	newDot.linkChild = null;
	newDot.style.display = "none";
	shape.appendChild(newDot);
	shape.dots.push(newDot);
	if (!prevDot)
		return newDot;
	newDot.linkLine = addLinkLine(newDot, prevDot);
	updateLink(newDot, prevDot);
	newDot.linkParent = prevDot;
	prevDot.linkChild = newDot;
	if (isLast)
	{
		shape.last = newDot;
		if (shape == curShape)
			curShape = null;
	}
	return newDot;
}

function addLinkLine(child, parent)
{
	const line = document.createElement("div");
	line.className = "link-line";
	line.dotA = child;
	line.dotB = parent;
	line.baseDX = -1;
	line.baseDY = -1;
	child.linkParent = parent;
	if (parent)
	{
		parent.linkChild = child;
		child.offsetX = child.x - parent.x;
		child.offsetY = child.y - parent.y;
		line.baseDX = child.x - parent.x;
		line.baseDY = child.y - parent.y;
	}
	document.body.appendChild(line);
	return line;
}

window.onload = () => {
	au = new AudioManager();
	au.active = false;
	au.canPlay = false;
	isMobile = isMobileDevice();
	// isMobile = 1;
	if (isMobile || 1)
	{
		maxDots = 100;
		selfCollision = false;
		au.active = false;
	}
	setTimeout(() => { au.active = true; au.canPlay = true;}, 300);
	initUi();
	update();
};

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}