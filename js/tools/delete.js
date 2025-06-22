function deleteDots()
{
	for (const d of dots)
	{
		if (typeof d.onRemove === "function") d.onRemove();
		d.remove();
	}
	linkHeads = [];
	dots = [];
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
