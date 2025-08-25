function deleteDots() {
	const toDelete = [];
	for (let i = 0; i < dots.length; i++) {
		if (!dots[i].active) break;
		toDelete.push(dots[i]);
	}
	for (const d of toDelete)
		deleteDot(d);
	linkHeads = [];
}

function deleteDot(d) {
	if (!d.active)
		return;
	if (typeof d.onRemove === "function") d.onRemove();
	d.style.display = "none";
	d.active = false;
	const i = dots.indexOf(d);
	if (i !== -1) {
		dots.splice(i, 1);
	}
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
