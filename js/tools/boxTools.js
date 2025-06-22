function boxesOverlap(boxA, boxB) {
	return (elementsOverlap(boxA.x, boxA.y, boxA.width, boxA.height, boxB.x, boxB.y, boxB.width, boxB.height));
}
function elementsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
	return ax < bx + bw && ax + aw > bx &&
	       ay < by + bh && ay + ah > by;
}

function getBoxAtPos(x, y, width = 20, height = width, self = null)
{
	const len = boxes.length;
	for (let i = len - 1; i >= 0; i--)
	{
		const b = boxes[i];
		if (b == self)
			continue;
		if (elementsOverlap(b.x, b.y, b.width, b.height, x, y, width, height))
			return b;
	}
	return null;
}

function groupBox(box, detach = false) {
	if (box.connectedBoxes.length > 0)
		au.playBoxSound(null, box);
	if (detach) {
		const visited = new Set();
		const stack = [box];

		while (stack.length > 0) {
			const current = stack.pop();
			if (visited.has(current)) continue;
			visited.add(current);

			if (current.connectedBoxes) {
				current.connectedBoxes.forEach(cb => {
					if (cb !== current) stack.push(cb);
				});
			}
			current.connectedBoxes = [];
			current.screws?.forEach(s => {
			if (s.element && s.element.parentNode)
			s.element.parentNode.removeChild(s.element);
			});
			current.screws = [];
		}
		return;
	}
	const group = new Set();
	const queue = [box];
	while (queue.length > 0) {
		const current = queue.shift();
		group.add(current);

		for (let i = 0; i < boxes.length; i++) {
			const b = boxes[i];
			if (group.has(b) || b === current) continue;
			if (elementsOverlap(b.x - 2, b.y - 2, b.width + 2, b.height + 2, current.x, current.y, current.width, current.height)) {
				queue.push(b);
				group.add(b);
			}
		}
	}
	const groupArray = Array.from(group);
	groupArray.forEach(b => {
		b.connectedBoxes = groupArray;
		b.screws = b.screws || [];
	});
	for (let i = 0; i < groupArray.length; i++)
	{
		for (let j = i + 1; j < groupArray.length; j++) {
			const a = groupArray[i];
			const b = groupArray[j];
			if (elementsOverlap(a.x, a.y, a.width, a.height, b.x, b.y, b.width, b.height))
				addScrewBetween(a, b);
		}
	}
}

function addScrewBetween(boxA, boxB) {
	if (boxA.screws?.some(s => s.other === boxB) || boxB.screws?.some(s => s.other === boxA))
		return;

	const screw = document.createElement("div");
	screw.className = "screw";
	screw.style.position = "absolute";
	screw.style.width = "10px";
	screw.style.height = "10px";
	screw.style.background = "#999";
	screw.style.borderRadius = "50%";
	screw.style.zIndex = "10";
	screw.style.pointerEvents = "auto";
	screw.style.cursor = "pointer";

	const xOverlap = Math.max(0, Math.min(boxA.x + boxA.width, boxB.x + boxB.width) - Math.max(boxA.x, boxB.x));
	const yOverlap = Math.max(0, Math.min(boxA.y + boxA.height, boxB.y + boxB.height) - Math.max(boxA.y, boxB.y));

	let offsetX, offsetY;
	if (xOverlap > yOverlap) {
		offsetX = ((Math.min(boxA.x + boxA.width, boxB.x + boxB.width) + Math.max(boxA.x, boxB.x)) / 2) - boxA.x - 5;
		offsetY = Math.max(boxA.y, boxB.y) - boxA.y - 5;
	} else {
		offsetX = Math.max(boxA.x, boxB.x) - boxA.x - 5;
		offsetY = ((Math.min(boxA.y + boxA.height, boxB.y + boxB.height) + Math.max(boxA.y, boxB.y)) / 2) - boxA.y - 5;
	}
	screw.style.left = offsetX + "px";
	screw.style.top = offsetY + "px";

	const screwDataA = { element: screw, other: boxB };
	const screwDataB = { element: screw, other: boxA };

	screw.onclick = function () {
		boxA.connectedBoxes = boxA.connectedBoxes.filter(b => b !== boxB);
		boxB.connectedBoxes = boxB.connectedBoxes.filter(b => b !== boxA);
		boxA.screws = boxA.screws.filter(s => s.other !== boxB);
		boxB.screws = boxB.screws.filter(s => s.other !== boxA);
		screw.remove();
	};

	boxA.appendChild(screw);
	boxA.screws = boxA.screws || [];
	boxB.screws = boxB.screws || [];
	boxA.screws.push(screwDataA);
	boxB.screws.push(screwDataB);
}
