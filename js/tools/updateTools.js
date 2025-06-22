function toLocalSpace(dot, box) {
	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;
	const angle = -(box.angle || 0); // negate to go into local space

	const dx = dot.newX + dot.size / 2 - cx;
	const dy = dot.newY + dot.size / 2 - cy;

	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	return {
		x: dx * cos - dy * sin + box.width / 2,
		y: dx * sin + dy * cos + box.height / 2
	};
}

function moveDot(dot, x, y)
{
	dot.newX = x;
	dot.newY = y;
	dot.x = x;
	dot.y = y;
	dot.style.left = x + "px";
	dot.style.top = y + "px";
	dot.centerX = dot.x + dot.radius;
	dot.centerY = dot.y + dot.radius;
}

function moveElement(element, x, y)
{
	element.x = x;
	element.y = y;
	element.style.left = element.x + "px";
	element.style.top = element.y + "px";
}

function applyGravity(element, mySpeed = 1)
{
	element.velocityY += yGravity * mySpeed * (deltaTime * speed);
	element.velocityX += xGravity * mySpeed * (deltaTime * speed);
}

function applyDrag(element, x = xDrag, y = yDrag)
{
	element.velocityX *= 1 - x;
	element.velocityY *= 1 - y;
	if (Math.abs(element.velocityX) < 0.01) element.velocityX = 0;
	if (Math.abs(element.velocityY) < 0.01) element.velocityY = 0;
}

function setVelocity(element, x, y)
{
	element.velocityX = x;
	element.velocityY = y;
}