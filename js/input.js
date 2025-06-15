addEventListener('mousedown', (event) => {
	if (event.target.tagName === 'INPUT' ||
		event.target.tagName === 'BUTTON' ||
		event.target.closest('.ui')) return;
	mouseX = event.clientX;
	mouseY = event.clientY;
	mousePressed = true;
	if (keys["shift"] && !curBox)
		curBox = init_box(mouseX, mouseY);
});

addEventListener('mouseup', (event) => {
	mousePressed = false;
	if (curBox)
	{
		boxes.push(curBox);
		curBox = null;
	}
});

addEventListener('mousemove', (event) => {
	mouseX = event.clientX;
	mouseY = event.clientY;

	if (!curBox) return;

	let x1 = curBox.x;
	let y1 = curBox.y;
	let x2 = mouseX;
	let y2 = mouseY;

	const left = Math.min(x1, x2);
	const top = Math.min(y1, y2);
	const width = Math.abs(x2 - x1);
	const height = Math.abs(y2 - y1);
	curBox.style.left = left + "px";
	curBox.style.top = top + "px";
	curBox.width = width;
	curBox.height = height;
	curBox.style.width = width + "px";
	curBox.style.height = height + "px";
});

addEventListener('keydown', (e) => {
	keys[e.key.toLowerCase()] = true;
	if (e.code === 'Space')
		init_selDot();
	if (e.key == 'x')
		deleteDots();
});

addEventListener('keyup', (e) => {
	keys[e.key.toLowerCase()] = false;
	if (e.code === 'Space')
		isGrowingDot = false;
});

function scaleDotWhilePressed() {
	if (!selDot) return;
	if (!isGrowingDot)
	{
		dots.push(selDot);
		return;
	}
	const timeClick = performance.now() - clickStartTime;
	const scaledSize = Math.max(5, Math.min(timeClick * 0.1, 500));
	const prvSize = selDot.size;
	const diffRadius = Math.abs(prvSize - scaledSize) / 2;
	selDot.size = scaledSize;
	selDot.x -= diffRadius;
	selDot.y -= diffRadius;
	selDot.style.left = selDot.x + "px";
	selDot.style.top = selDot.y + "px";
	selDot.style.width = scaledSize + "px";
	selDot.style.height = scaledSize + "px";
	requestAnimationFrame(scaleDotWhilePressed);
}

addEventListener('touchstart', (event) => {
	const touch = event.touches[0];
	mouseX = touch.clientX;
	mouseY = touch.clientY;
	mousePressed = true;
	if (keys["shift"] && !curBox)
		curBox = init_box(mouseX, mouseY);
}, { passive: false });

addEventListener('touchend', () => {
	mousePressed = false;
	if (curBox) {
		boxes.push(curBox);
		curBox = null;
	}
}, { passive: false });

addEventListener('touchmove', (event) => {
	const touch = event.touches[0];
	mouseX = touch.clientX;
	mouseY = touch.clientY;

	if (!curBox) return;

	let x1 = curBox.x;
	let y1 = curBox.y;
	let x2 = mouseX;
	let y2 = mouseY;

	const left = Math.min(x1, x2);
	const top = Math.min(y1, y2);
	const width = Math.abs(x2 - x1);
	const height = Math.abs(y2 - y1);
	curBox.style.left = left + "px";
	curBox.style.top = top + "px";
	curBox.width = width;
	curBox.height = height;
	curBox.style.width = width + "px";
	curBox.style.height = height + "px";
}, { passive: false });
