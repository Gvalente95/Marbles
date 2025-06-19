addEventListener('mousedown', (event) => {
	mouseX = event.clientX;
	mouseY = event.clientY;
	if (event.target.tagName === 'INPUT' ||
		event.target.tagName === 'BUTTON' ||
		event.target.closest('.control-content')) return;
	mousePressed = true;
	if (isDraggingControls || isResizing)
		return;
	if (!selBox && !curBox)
	{
		selDot = getDotAtPos(mouseX, mouseY);
		if (selDot && selDot.linkLine)
			setNewLinkHead(selDot);
	}
	if (!curBox && !selBox && !selDot)
	{
		if (boxType == "box_teleport" && (tpa || tpb))
		{
			if (tpa && tpb)
			{
				initDots(dots, mouseX, mouseY);
				return;
			}
			const other = tpa ? tpa : tpb;
			curBox = init_box(mouseX, mouseY, other.width, other.height);
			boxes.push(curBox);
			curBox = null;
		}
		else if (boxType != "box_none")
			curBox = init_box(mouseX, mouseY);
	}
	dropTime = 0;
});

addEventListener('mouseup', (event) => {
	mousePressed = false;
	document.body.style.cursor = "default";
	if (curBox)
	{
		if (curBox.width < 10 || curBox.height < 10)
		{
			curBox.onRemove();
			curBox.remove();
			initDots(dots, mouseX, mouseY);
		}
		else
		{
			boxes.push(curBox);
			curBox.x = parseInt(curBox.style.left);
			curBox.y = parseInt(curBox.style.top);	
		}
		curBox = null;
	}
	if (selBox)
		selBox = null;
	if (selDot)
	{
		selDot.velocityX = mouseDX;
		selDot.velocityY = mouseDY;
		selDot = null;
	}
});

addEventListener('mousemove', (event) => {
	mouseDX = event.clientX - mouseX;
	mouseDY = event.clientY - mouseY;
	mouseX = event.clientX;
	mouseY = event.clientY;

	if (selBox)
	{
		document.body.style.cursor = "grab";
		selBox.x += mouseDX;
		selBox.y += mouseDY;
		selBox.style.left = selBox.x + "px";
		selBox.style.top = selBox.y + "px";
	}
	if (!curBox) return;
	document.body.style.cursor = "move";
	let x1 = curBox.x;
	let y1 = curBox.y;
	let x2 = mouseX;
	let y2 = mouseY;
	if (r_range(0, 10) == 0)
		au.playBoxSound(null, curBox, minmax(0, 1, Math.abs(mouseDX + mouseDY) / 10));
	const left = Math.min(x1, x2);
	const top = Math.min(y1, y2);
	let width = Math.abs(x2 - x1);
	let height = Math.abs(y2 - y1);
	if (curBox.className == "box_vortex")
	{
		if (width > height) height = width * r_range(.95, 1.05);
		else width = height * r_range(.95, 1.05);
	}
	curBox.style.left = left + "px";
	curBox.style.top = top + "px";
	curBox.width = width;
	curBox.height = height;
	curBox.style.width = width + "px";
	curBox.style.height = height + "px";
});

addEventListener('keydown', (e) => {
	keys[e.key] = true;
	if (e.key === "Backspace")
	{
		const dot = getDotAtPos(mouseX, mouseY, 80);
		const box = getBoxAtPos(mouseX, mouseY, 20);
		if (dot)
			dots_destroyed.push(dot);
		else if (box)
		{
			if (typeof box.onRemove === "function") box.onRemove();
			boxes.splice(boxes.indexOf(box), 1);
			box.remove();
		}
	}
	else if (e.code === "x")
		deleteDots();
	else if (e.key === "b")
		deleteBoxes();
	else if (e.key === "Tab")
	{
		e.preventDefault();
		toggle_minimize_controls();
	}
	else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
		boxButtons[activeBoxIndex].style.backgroundColor = "rgba(0, 0, 0, 0.1)";
		activeBoxIndex = (activeBoxIndex + (keys["shift"] ? -1 : 1) + boxButtons.length) % boxButtons.length;
		boxButtons[activeBoxIndex].style.backgroundColor = "rgba(0, 255, 0, .8)";
		boxType = boxButtons[activeBoxIndex].className;
		au.playSound(au.click);
	}
});

addEventListener('keyup', (e) => {
	keys[e.key] = false;
});

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
	event.preventDefault();
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

window.addEventListener("wheel", (event) =>
{
	dots.forEach(dot =>
	{
		dot.velocityY += -event.deltaY * .005;
		dot.velocityX += -event.deltaX * .005;
	});	
});

let prevSpd;
let prevGravX;
let prevGravY;
window.addEventListener("blur", () => {
	prevSpd = speed;
	speed = 0;
	prevGravX = xGravity;
	prevGravY = yGravity;
	xGravity = 0;
	yGravity = 0;
});

window.addEventListener("focus", () => {
	setTimeout(() => {
		speed = prevSpd;
		xGravity = prevGravX;
		yGravity = prevGravY;	
	}, 50)
	dots.forEach(d => {
		d.velocityX = 0;
		d.velocityY = 0;
	});
});

window.addEventListener("gesturechange", (e) => {
	console.log("Rotation:", e.rotation); // in degrees
	console.log("Scale:", e.scale);
});