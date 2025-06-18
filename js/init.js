function getDot(x, y, size, angle = f_range(0, 2 * Math.PI), isInBox = false)
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
	dot.speed = 1 + Math.random() * 2;
	dot.velocityX = Math.cos(dot.angle) * dot.speed;
	dot.velocityY = Math.sin(dot.angle) * dot.speed;
	dot.style.backgroundColor = `rgb(${r_range(0, 255)}, ${r_range(0, 255)}, ${r_range(0, 255)})`;
	dot.baseColor = dot.style.backgroundColor;
	dot.style.left = dot.x + "px";
	dot.inGel = false;
	dot.style.top = dot.y + "px";
	dot.onmouseenter = function () {
		console.warn("GOT ONE!");
	};
	dot.onRemove = function () {
		createDotImpact(dot);
		au.playGelSound(dot);
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
		if (boxesOverlap(b.x, b.y, b.width, b.height, startX, startY, 1, 1))
			isInBox = true;
	});
	const overdraw = (list.length + amount) - maxDots;
	if (overdraw > 0)
	{
		for (let i = 0; i < overdraw; i++)
			dots[i].remove();
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
	box.width = width;
	box.height = height;
	box.active = false;
	box.style.display = "block";
	box.style.width = width + "px";
	box.style.height = height + "px";
	if (type == "box_teleport") {
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
		if (box === tpa) tpa = null;
		else if (box === tpb) tpb = null;
	};
	document.body.appendChild(box);
	return box;
}

window.onload = () => {
	initUi();
	update();
};
