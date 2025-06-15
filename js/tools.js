function r_range(min, max)
{
	return (min + Math.floor(Math.random() * (max - min)));
}

function f_range(min, max)
{
	return (min + Math.random() * (max - min));
}

function deleteDots()
{
	dots.forEach(dot => dot.remove());
	dots = [];
}
