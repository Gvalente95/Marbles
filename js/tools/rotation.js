function getRotatedCorners(box) {
	const angle = box.angle || 0;
	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;
	const hw = box.width / 2;
	const hh = box.height / 2;

	const corners = [
		[-hw, -hh],
		[ hw, -hh],
		[ hw,  hh],
		[-hw,  hh]
	];

	return corners.map(([dx, dy]) => {
		const x = cx + dx * Math.cos(angle) - dy * Math.sin(angle);
		const y = cy + dx * Math.sin(angle) + dy * Math.cos(angle);
		return { x, y };
	});
}

function dotInOverlap(dot, box) {
	const corners = getRotatedCorners(box);
	const radius = dot.size / 2;
	const cx = dot.x + radius;
	const cy = dot.y + radius;
	if (pointInPolygon(cx, cy, corners))
		return true;
	for (let i = 0; i < corners.length; i++) {
		const a = corners[i];
		const b = corners[(i + 1) % corners.length];
		if (circleIntersectsSegment(cx, cy, radius, a, b))
			return true;
	}
	return false;
}

function pointInPolygon(px, py, corners) {
	let inside = false;
	for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
		const xi = corners[i].x, yi = corners[i].y;
		const xj = corners[j].x, yj = corners[j].y;
		const intersect = ((yi > py) !== (yj > py)) &&
			(px < (xj - xi) * (py - yi) / (yj - yi + 1e-10) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
}

function circleIntersectsSegment(cx, cy, r, a, b) {
	// vector AB and AP
	const abx = b.x - a.x;
	const aby = b.y - a.y;
	const apx = cx - a.x;
	const apy = cy - a.y;

	const abLenSquared = abx * abx + aby * aby;
	const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSquared));

	// closest point on segment
	const closestX = a.x + t * abx;
	const closestY = a.y + t * aby;

	// distance to circle center
	const dx = closestX - cx;
	const dy = closestY - cy;

	return dx * dx + dy * dy <= r * r;
}

function rotatePoint(px, py, cx, cy, angle) {
    const dx = px - cx;
    const dy = py - cy;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: cx + dx * cos + dy * sin,
        y: cy - dx * sin + dy * cos
    };
}
