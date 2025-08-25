function updateShape(shape)
{
	shape.velocityX += xGravity * deltaTime * speed;
	shape.velocityY += yGravity * deltaTime * speed;
	if (shape.last)
		for (const dot of shape.dots)
			updateDot(dot);
}

function updateShapes()
{
	if (mouseStopped && selDot && selDot.shape)
		au.playRandomSound(au.stretchSounds, .1);
	for (const sh of shapes)
		updateShape(sh);
	if (curShape && mousePressed)
	{
		addToShape(curShape, mouseX, mouseY);
		if (curShape.dots.length > 10)
		{
			curShape.last = curShape.dots[curShape.dots.length - 1];
			curShape = null;
			mousePressed = false;
		}
	}
}

function updateMenu()
{
	console.warn("in menu");
		return true;
}

function updateFallingDots(now)
{
	const maxAllowed = 1000;
	if (menuBlock.started && menuBlock.active && dots.length < maxAllowed && now - menuDropTime > menuDropRate)
	{
		const size = 20 + Math.floor(now * .5);
		const newDot = getDot(menuDropX, 0, size, Math.PI / 2 + r_range(-0.001, 0.001));
		newDot.auIndex = (dots.length - 1) % 12;
		menuDropX += (size + 1) * menuDropDir;
		if (menuDropX > window.innerWidth - size || menuDropX < size)
		{
			menuDropDir *= -1;
			menuDropX += 0;
			menuDropX += (size + 1) * menuDropDir;
		}
		menuDropTime = now;
	}
}

let now = performance.now() / 1000;
function update()
{
	time = Date.now();
	const newNow = performance.now() / 1000;
	deltaTime = (newNow - now) / 1000;
	now = newNow;
	au.update(now);
	if (isPaused) { requestAnimationFrame(update); return; }
	updateFallingDots(now);
	updateBoxes();
	updateDots();
	requestAnimationFrame(update);
	updateShapes();
	if (!isDraggingControls && !curBox && !selBox && !selDot && !curShape && now - dropTime > rate && (keys[" "] || (mousePressed && (keys["Shift"] || boxType == "None")))) {
		initDots(dots, mouseX, mouseY);
		dropTime = now;
	}
	infoText.textContent = "Dots " + dotsAlive + "/" + maxDots + "\n" + " Sounds " + au.audioQueue.length;
	if (mouseStopped && selDot && selDot.shape)
		au.playRandomSound(au.stretchSounds, .1);
	mouseMoved = false;
}
