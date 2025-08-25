function solveBoxCollisions(box, other)
{
	if (other === box || !boxesOverlap(box, other)) return (0);
	if (box.velocityX == 0 && box.velocityY == 0)
		return (0);
	if (other == tpa && tpb)
		return teleportDot(box, tpa, tpb, box.centerX, box.centerY);
	else if (other == tpb && tpa)
		return teleportDot(box, tpb, tpa, tpb.x + tpb.width / 2, tpb.y + tpb.height / 2);
	if (other.type === "Vortex")
	{
		if (box.lastColBox != other)
			au.playBoxSound(null, other, .5);
		box.velocityX += 2;
	}
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
		box.newX = box.newX <= 0 ? marg : window.innerWidth - box.width - marg;
		hasImpact++;
	}
	if (box.newY <= marg || box.newY >= window.innerHeight - box.height - marg)
	{
		if (Math.abs(box.velocityY) > 2)
			au.playBoxSound(null, box, .1);
		box.velocityY *= -(bounceFactor);
		box.newY = box.newY <= 0 ? marg : window.innerHeight - box.height - marg;
		hasImpact++;
	}
	return hasImpact;
}

function setBoxPos(box, newX, newY)
{
	box.x = newX;
	box.y = newY;
	box.centerX = box.x + box.width / 2;
	box.centerY = box.y + box.height / 2;
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
