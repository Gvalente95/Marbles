function linkDots(dotA, dotB, enforce = false)
{
	if (!enforce)
	{
		if (dotA.linkParent != null || !selDot || selDot == dotA)
			return;
		if (dotB != selDot && dotB.linkParent == null)
			return;
		if (dotB.linkChild && r_range(0, 1000))
			return;
		if (dotA.isLinkHead)
			return;
	}
	// if (dotA.linkLine && enforce)
	// 	deleteDotLinks(dotA);
	au.playGelSound(dotA, 1);
	dotA.linkParent = dotB;
	dotB.linkChild = dotA;
	dotA.offsetX = dotA.x - dotB.x;
	dotA.offsetY = dotA.y - dotB.y;
	const line = document.createElement("div");
	line.className = "link-line";
	if (r_range(0, 10) > 0)
		line.style.backgroundColor = dotA.style.backgroundColor;
	line.dotA = dotA;
	line.dotB = dotB;
	document.body.appendChild(line);
	dotA.linkLine = line;
	if (dotB.isLinkHead || r_range(0, 20) == 0)
		dotB.classList.add("linked");
	if (dotB == selDot || enforce) {
		dotB.isLinkHead = true;
		dotB.linkHead = dotB;
		linkHeads.push(dotB);
		dotA.linkHead = dotB;
	}
	else
		dotA.linkHead = dotB.linkHead;
}

function deleteDotLinks(dot)
{
	console.warn("removing link line");
	if (dot.linkChild) {
		const child = dot.linkChild;
		child.linkParent = null;
		if (child.linkChild) {
			child.isLinkHead = true;
			if (child.linkLine) {
				child.linkLine.remove();
				child.linkLine = null;
			}
			linkHeads.push(child);
			dot.linkChild = null;
		}
		else
			deleteDotLinks(dot.linkChild);
	}
	if (dot.linkParent) {
		const parent = dot.linkParent;
		parent.linkChild = null;
		if (!parent.linkParent) {
			parent.isLinkHead = false;
			deleteDotLinks(dot.linkParent);
		}
		else if (parent.linkLine) {
			parent.linkLine.remove();
			parent.linkLine = null;
		}
		dot.linkParent = null;
	}
	if (dot.linkLine)
		dot.linkLine.remove();
	dot.linkLine = null;
	const idx = linkHeads.indexOf(dot);
	if (idx !== -1) linkHeads.splice(idx, 1);
	dot.linkChild = null;
	dot.linkParent = null;
	dot.isLinkHead = false;
	dot.classList.remove("linked");
}

function updateLink(dot, linkParent = dot.linkParent) {
	if (!dot.linkLine || !linkParent) return;

	const x1 = dot.centerX;
	const y1 = dot.centerY;
	const x2 = linkParent.centerX;
	const y2 = linkParent.centerY;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const currentLen = Math.sqrt(dx * dx + dy * dy);
	const angle = Math.atan2(dy, dx) * 180 / Math.PI;

	dot.linkLine.style.left = x1 + "px";
	dot.linkLine.style.top = y1 + "px";
	dot.linkLine.style.width = currentLen + "px";
	dot.linkLine.style.transform = `rotate(${angle}deg)`;

	if (!dot.shape) {
		dot.velocityX += minmax(-10, 10, dx * stickStiff * (deltaTime * speed));
		dot.velocityY += minmax(-10, 10, dy * stickStiff * (deltaTime * speed));
		dot.velocityX *= 0.6;
		dot.velocityY *= 0.6;
		return;
	}
	const baseDX = dot.linkLine.baseDX;
	const baseDY = dot.linkLine.baseDY;
	const baseLen = Math.sqrt(baseDX ** 2 + baseDY ** 2);
	const elasticTolerance = 20; // pixels
	const stretch = currentLen - baseLen;
	if (Math.abs(stretch) < elasticTolerance)
		return;
	const nx = dx / currentLen;
	const ny = dy / currentLen;
	const force = stretch * .01 * (deltaTime * speed);
	dot.velocityX += minmax(-10, 10, nx * force);
	dot.velocityY += minmax(-10, 10, ny * force);
	dot.velocityX *= 0.8;
	dot.velocityY *= 0.8;
}

function setNewLinkHead(newhead)
{
	let node = newhead.linkChild;
	while (node)
	{
		if (node.linkHead == newhead)
			return;
		const nextNode = node.linkChild;
		linkDots(node, newhead, true);
		node = nextNode;
	}
	node = newhead.linkParent;
	while (node)
	{
		if (node.linkHead == newhead)
			return;
		const nextNode = node.linkParent;
		linkDots(node, newhead, true);
		node = nextNode;
	}
}

function CollapseLink(dot)
{
	let node = dot.linkChild;
	while (node)
	{
		const nextNode = node.linkChild;
		node.x = dot.x;
		node.y = dot.y;
		console.warn("YO");
		node = nextNode;
	}
	node = dot.linkParent;
	while (node)
	{
		const nextNode = node.linkParent;
		node.x = dot.x;
		node.y = dot.y;
		console.warn("YA");
		node = nextNode;
	}
}

function linkAllDots()
{
	if (dots.length <= 1)
		return;
	for (let i = 0; i < dots.length - 1; i++)
	{
		const d = dots[i];
		if (d.linkParent || (d.linkHead && r_range(0, 20) < 2))
			continue;
		const other = dots[i + 1];
		linkDots(d, other, true);
	}
}