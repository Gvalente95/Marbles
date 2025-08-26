
function orbitBox(boxA, boxB)
{
	const angleToBox = Math.atan2(boxB.centerY - boxA.centerY, boxB.centerX - boxA.centerX);
	const dirX = Math.cos(angleToBox);
	const dirY = Math.sin(angleToBox);
	const tangentX = -dirY;
	const tangentY = dirX;
	const massNorm = boxA.mass / (maxSize * maxSize);
	const boxArea = boxB.width * boxB.height;
	const maxBoxArea = (window.innerWidth / 2) * (window.innerHeight / 2);
	const boxNorm = boxArea / maxBoxArea;
	let attractSpeed = lerp(8, 10, boxNorm) * lerp(0.15, 0.35, massNorm);
	let orbitSpeed = lerp(4.5, 3.5, boxNorm) * lerp(.4, 0.35, massNorm);
	boxA.velocityX += dirX * attractSpeed * deltaTime * speed;
	boxA.velocityY += dirY * attractSpeed * deltaTime * speed;
	boxA.velocityX += tangentX * orbitSpeed * deltaTime * speed;
	boxA.velocityY += tangentY * orbitSpeed * deltaTime * speed;
	// let drag = .75;
	// boxA.velocityX *= drag;
	// boxA.velocityY *= drag;
	boxA.newX += (boxA.newX - boxA.x) * .9;
	boxA.newY += (boxA.newY - boxA.y) * .9;
	if (boxA.lastColBox != boxB)
	{
		if (boxA.lastColBox != boxB && !boxB.inAnim)
			playAnim(boxB,
				"spinVortex 4s linear infinite, pulseGlow 2.5s ease-in-out infinite",
				"spinVortexImpact 4s linear infinite, pulseGlow 2.5s ease-in-out infinite",
				4000,
			);
		au.playBoxSound(null, boxB);
	}
}

function solveBoxCollisions(box, other)
{
	if (other === box || !boxesOverlap(box, other)) return (0);
	if (box.velocityX == 0 && box.velocityY == 0)
		return (0);
	if (other == tpa)
		return teleportDot(box, tpa, tpb, box.centerX, box.centerY);
	else if (other == tpb)
		return teleportDot(box, tpb, tpa, tpb.x + tpb.width / 2, tpb.y + tpb.height / 2);
	if (other.type === "Vortex")
		orbitBox(box, other);
	else if (other.type === "Gelatine")
	{
		if (box.lastColBox != other)
			au.playBoxSound(null, other, .5);
		box.velocityX *= .5;
		box.velocityY *= .5;
	}
	else if (other.type === "Concrete")
	{
		const ax1 = box.newX, ay1 = box.newY;
		const ax2 = box.newX + box.width, ay2 = box.newY + box.height;
		const bx1 = other.newX, by1 = other.newY;
		const bx2 = other.newX + other.width, by2 = other.newY + other.height;
		const overlapX = Math.min(ax2, bx2) - Math.max(ax1, bx1);
		const overlapY = Math.min(ay2, by2) - Math.max(ay1, by1);
		const momA = Math.abs(box.velocityX) + Math.abs(box.velocityY);
		const momB = Math.abs(other.velocityX) + Math.abs(other.velocityY);
		const moveBox = momA >= momB ? box : other;
		const staticBox = moveBox === box ? other : box;

		if (overlapX < overlapY) {
			if (moveBox.newX < staticBox.newX) moveBox.newX -= overlapX;
			else moveBox.newX += overlapX;
		} else {
			if (moveBox.newY < staticBox.newY) moveBox.newY -= overlapY;
			else moveBox.newY += overlapY;
		}
		if (Math.abs(moveBox.velocityX) > 5 || Math.abs(moveBox.velocityY) > 5)
			au.playBoxSound(null, moveBox, .5);
		moveBox.velocityX = 0;
		moveBox.velocityY = 0;
	}
	box.lastColBox = other;
	return (1);
}

function getNewBoxPos(box)
{
	let hasImpact = 0;

	box.newX = box.x + (box.velocityX * 1 * (deltaTime * speed));
	box.newY = box.y + (box.velocityY * 1 * (deltaTime * speed));
	const marg = 4;
	if (box.newX <= marg || box.newX >= window.innerWidth - box.width - marg)
	{
		if (Math.abs(box.velocityX) > 2)
			au.playBoxSound(null, box, .1);
		box.velocityX *= -(bounceFactor);
		box.newX = box.newX <= marg ? marg : window.innerWidth - box.width - marg;
		hasImpact++;
	}
	if (box.newY <= marg || box.newY >= window.innerHeight - box.height - marg)
	{
		if (Math.abs(box.velocityY) > 2)
			au.playBoxSound(null, box, .1);
		box.velocityY *= -(bounceFactor);
		box.newY = box.newY <= marg ? marg : window.innerHeight - box.height - marg;
		hasImpact++;
	}
	return hasImpact;
}

function setBoxPos(box, newX, newY)
{
	box.x = newX;
	box.y = newY;
	box.style.left = box.x + "px";
	box.style.top = box.y + "px";
}

function updateBoxes()
{
	for (let i = 0; i < boxes.length; i++)
	{
		const box = boxes[i];
		if (box.type != "Concrete" || box.connectedBoxes.length != 0)
			continue;
		if (box != selBox)
			applyGravity(box, 3);
		box.centerX = box.x + box.width / 2;
		box.centerY = box.y + box.height / 2;
		let impactLen = 0;
		impactLen += getNewBoxPos(box);
		for (let j = 0; j < boxes.length; j++)
			impactLen += solveBoxCollisions(box, boxes[j]);
		if (box == selBox)
			return;
		setBoxPos(box, box.newX, box.newY);
		if (impactLen > 0)
			applyDrag(box, .2, .2);
		else
			box.lastColBox = null;
	}
}
