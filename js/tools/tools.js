
function resizeDot(d, newRad)
{
	const diff = d.radius - newRad;
	d.size = newRad * 2;
	d.style.width = d.size + "px";
	d.style.height = d.size + "px";
	d.x += d.radius - newRad;
	d.y += d.radius - newRad;
	d.newX += diff;
	d.newY += diff;
	d.style.left = d.x + "px";
	d.style.top = d.y + "px";
	d.centerX = d.x + newRad;
	d.centerY = d.y + newRad;
	d.radius = newRad;
	d.mass = d.size * d.size;
	const sizeGroup = d.size <= 50 / 3 ? 0 : d.size <= 50 * 2 / 3 ? 1 : 2;
	const groupIndex = (sizeGroup * 4) + Math.floor(r_range(0, 4));
	d.auIndex = Math.min(au.bells.length - 1, au.bells.length - 1 - groupIndex);
}

function resizeDots()
{
	for (const d of dots)
		if (d.radius < minSize || d.radius > maxSize)
			resizeDot(d, d.radius < minSize ? minSize : maxSize);
}