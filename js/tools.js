function deleteDots()
{
	for (const d of dots)
	{
		if (typeof d.onRemove === "function") d.onRemove();
		d.remove();
	}
	linkHeads = [];
	dots = [];
}

function deleteBoxes() {
	for (const box of boxes) {
		if (typeof box.onRemove === "function") box.onRemove();
		box.remove();
	}
	boxes = [];
}

function reset()
{
	deleteDots();
	deleteBoxes();
}

function boxesOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
	return ax < bx + bw && ax + aw > bx &&
	       ay < by + bh && ay + ah > by;
}

function setAlphaColor(rgb, alpha = 0.1) {
	const match = rgb.match(/\d+/g);
	if (!match) return `rgba(117, 166, 187, ${alpha})`;
	const [r, g, b] = match;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createDotImpact(dot) {
	let x = dot.newX + dot.velocityX * 2 + dot.radius;
	let y = dot.newY + dot.velocityY * 2 + dot.radius;
	const color = setAlphaColor(dot.baseColor || dot.style.backgroundColor, 0.3);
	createGelRipple(null, x, y, dot.radius * 2, .5, color);
}

function createGelRipple(box, x, y, radius = 20, dur = .5, color = "rgba(60, 141, 175, 0.41)") {
	const ripple = document.createElement("div");
	ripple.style.position = "absolute";
	ripple.style.width = radius + "px";
	ripple.style.height = radius + "px";
	ripple.style.left = x - radius / 2 + "px";
	ripple.style.top = y - radius / 2 + "px";
	ripple.style.borderRadius = "50%";
	ripple.style.background = color;
	ripple.style.transform = "scale(1)";
	ripple.style.animation = `gelRipple ${dur}s ease-out`;
	ripple.style.zIndex = 2;
	if (box)
		box.appendChild(ripple);
	else
		document.body.appendChild(ripple);
	ripple.addEventListener("animationend", () => ripple.remove());
}

function getBoxAtPos(x, y, radius = 20)
{
	const len = boxes.length;
	for (let i = len - 1; i >= 0; i--)
	{
		const b = boxes[i];
		if (boxesOverlap(b.x, b.y, b.width, b.height, x, y, radius, radius))
			return b;
	}
	return null;
}

function getDotAtPos(x, y, radius = 20, list = dots, shape_index = 0) {
	const sd = selDot;
	if (sd && boxesOverlap(sd.x, sd.y, sd.size, sd.size, x, y, radius * 10, radius * 10))
		return selDot;
	let closest = null;
	let closestDiff = Infinity;
	for (let i = 0; i < list.length; i++) {
		const d = list[i];
		if (!boxesOverlap(d.x, d.y, d.size, d.size, x, y, radius, radius))
			continue;
		let diff = Math.abs(x - d.x) + Math.abs(y - d.y);
		if (diff > closestDiff)
			continue;
		closestDiff = diff;
		closest = d;
	}
	if (!closest && shapes && shapes[shape_index])
		return getDotAtPos(x, y, radius, shapes[shape_index].dots, shape_index + 1);
	return closest;
}
