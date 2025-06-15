function getDot(x, y, size, angle = f_range(0, 2 * Math.PI))
{
	const dot = document.createElement("div");
	dot.className = "dot";
	dot.x = x;
	dot.y = y;
	dot.startTime = Date.now();
	dot.lifetime = 0;
	dot.size = size;
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
	dot.style.left = dot.x + "px";
	dot.style.top = dot.y + "px";
	dot.style.zIndex = -10;
	au.playMarbleSound(dot, 3, true);
	document.body.appendChild(dot);
	return dot;
}

function init_box(x, y, width = 1, height = 1)
{
	const box = document.createElement("div");
	box.className = "box";
	box.x = x;
	box.y = y;
	box.style.left = x + "px";
	box.style.top = y + "px";
	box.velocityX = 0;
	box.velocityY = 0;
	box.mass = 1;
	box.size = 1;
	box.width = width;
	box.height = height;
	box.style.width = width + "px";
	box.style.height = height + "px";
	document.body.appendChild(box);
	return box;
}

function init_selDot()
{
	clickStartTime = performance.now();
	selDot = getDot(mouseX, mouseY, 0.1);
	selDot.style.left = mouseX - selDot.size / 2 + "px";
	selDot.style.top = mouseY - selDot.size / 2 + "px";
	isGrowingDot = true;
	scaleDotWhilePressed();
}

function initDots(list, startX, startY)
{
	const step = (Math.PI * 2) / amount;
	let angle = -Math.PI;
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
		list.push(getDot(startX, startY, size, angle));
		angle += step;
	}
}

window.onload = () => {
	initSliders();
	initButtons();
};
