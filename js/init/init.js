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
	box.inAnim = false;
	box.angle = 0;
	box.connectedBoxes = [];
	box.height = height;
	box.active = false;
	box.lastColBox = null;
	box.velocityX = 0;
	box.velocityY = 0;
	box.type = boxType;
	box.style.display = "block";
	box.style.width = width + "px";
	box.style.height = height + "px";
	box.radius = width / 2;
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
		playAnim(box,
				"spinVortex 4s linear infinite, pulseGlow 2.5s ease-in-out infinite",
				"spinVortexImpact 4s linear infinite, pulseGlow 2.5s ease-in-out", 700);
	// else
	// 	addRotator(box);
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

window.onload = () => {
	au = new AudioManager();
	au.active = true;
	au.canPlay = false;
	isMobile = isMobileDevice();
	if (isMobile)
	{
		au.maxQueue = 2;
		amount = 1;
		rate = 1;
		au.active = false;
		maxDots = 20;
	}
	setTimeout(() => { au.canPlay = true; }, 300);
	initUi();
	update();
};
