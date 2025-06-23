addEventListener('mousedown', (event) => {
	mouseX = event.clientX;
	mouseY = event.clientY;
	if (event.target.tagName === 'INPUT' ||
		event.target.tagName === 'BUTTON' ||
		event.target.closest('.control-content')) return;
	mousePressed = true;
	if (isDraggingControls || isResizing)
		return;
	if (!curShape && keys["Shift"])
		curShape = initShape(mouseX, mouseY);
	if (!selBox && !curBox && !curShape)
		selDot = getDotAtPos(mouseX, mouseY, 100);
	if (!curBox && !selBox && !selDot && !curShape)
	{
		if (boxType == "Teleport" && (tpa || tpb))
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
		else if (boxType != "None")
			curBox = init_box(mouseX, mouseY);
	}
	dropTime = 0;
});

addEventListener('mouseup', (event) => {
	mousePressed = false;
	document.body.style.cursor = "default";
	if (curShape)
	{
		curShape.last = curShape.dots[curShape.dots.length - 1];
		curShape = null;
	}
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
	{
		setVelocity(selBox, mouseDX * .5, mouseDY * .5);
		selBox = null;
	}
	if (selDot)
	{
		if (!selDot.shape)
		{
			selDot.velocityX = mouseDX;
			selDot.velocityY = mouseDY;
		}
		selDot = null;
	}
});

let mouseStopped = false;
let mouseStopTimeout;
addEventListener('mousemove', (event) => {
	mouseDX = event.clientX - mouseX;
	mouseDY = event.clientY - mouseY;
	mouseX = event.clientX;
	mouseY = event.clientY;

	mouseStopped = false;
	clearTimeout(mouseStopTimeout);
	mouseStopTimeout = setTimeout(() => { mouseStopped = true;}, 20);
	if (selBox && !rotating)
	{
		selBox.velocityX = 0;
		selBox.velocityY = 0;
		setBoxPos(selBox, minmax(0, window.innerWidth - selBox.width, selBox.x + mouseDX), minmax(0, window.innerHeight - selBox.height, selBox.y + mouseDY));
		selBox.connectedBoxes.forEach(cb => {if (cb != selBox) moveElement(cb, cb.x + mouseDX, cb.y + mouseDY);});
		document.body.style.cursor = "grab";
	}
	if (curBox)
	{
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
		if (curBox.className == "Vortex")
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
	}
});

function deleteDot(dot)
{
	dots_destroyed.push(dot);
}

addEventListener('keydown', (e) => {
	keys[e.key] = true;
	if (menuBlock.active || e.key == "e")
		switchMenuMode();
	if (e.key === "Backspace")
	{
		const dot = getDotAtPos(mouseX, mouseY, 80);
		const box = getBoxAtPos(mouseX, mouseY, 20);
		if (dot)
			deleteDot(dot);
		else if (box)
		{
			if (typeof box.onRemove === "function") box.onRemove();
			boxes.splice(boxes.indexOf(box), 1);
			box.remove();
		}
	}
	else if (e.key === "x")
		deleteDots();
	else if (e.key === "b")
		deleteBoxes();
	else if (e.key === "Tab")
	{
		e.preventDefault();
		toggle_minimize_controls();
	}
	else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
		let newIndex = (activeBoxIndex + (e.key === "ArrowLeft" ? -1 : 1) + boxButtons.length) % boxButtons.length;
		switchBoxButton(newIndex)
		au.playSound(au.click);
	}
});

addEventListener('keyup', (e) => {
	keys[e.key] = false;
});

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
let isPaused = false;
window.addEventListener("blur", () => {
	hasInteracted = false;
	isPaused = true;
});

window.addEventListener("focus", () => {
	isPaused = false;
	au.active = false;
	setTimeout(() => {
		au.active = true;
	}, 5000);
});

function simulateMouseEvent(touchEvent, mouseEventType) {
    const touch = touchEvent.changedTouches[0];
    const simulatedEvent = new MouseEvent(mouseEventType, {
        bubbles: true,
        cancelable: true,
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        button: 0
    });
    touch.target.dispatchEvent(simulatedEvent);
}

document.addEventListener("touchstart", e => simulateMouseEvent(e, "mousedown"), true);
document.addEventListener("touchmove",  e => simulateMouseEvent(e, "mousemove"), true);
document.addEventListener("touchend",   e => simulateMouseEvent(e, "mouseup"),   true);