function r_range(min, max){
	return (min + Math.floor(Math.random() * (max - min)));}

function f_range(min, max){
	return (min + Math.random() * (max - min));}

function minmax(min, max, value){
	return Math.max(min, Math.min(max, value));}

function lerp(a, b, t) {return a + (b - a) * t;}

function rotate(velocity, angle) {
	return {
		x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
		y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
	};}

function getRevAngle(angle) {
	return (angle + Math.PI) % (2 * Math.PI);}