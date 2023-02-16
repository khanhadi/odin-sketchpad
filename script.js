let currentColor = '#000000'; // default color
let gridEnabled = true;

//#region TOOLBAR

// modes
const clickBtn = document.querySelector('#click-btn');
const hoverBtn = document.querySelector('#hover-btn');

let isClick = false;
let isHover = false;
let isSketch = false;

clickBtn.addEventListener('click', () => {
	clickBtn.classList.add('selected');
	hoverBtn.classList.remove('selected');
	isClick = true;
	isHover = false;
	console.log('Click Mode');
	enableDrawing(isHover, isClick, gridEnabled);
});

hoverBtn.addEventListener('click', () => {
	hoverBtn.classList.add('selected');
	clickBtn.classList.remove('selected');
	isHover = true;
	isClick = false;
	console.log('Hover Mode');
	enableDrawing(isHover, isClick, gridEnabled);
});

// tools

// eraser
let erase = false;
const eraserBtn = document.querySelector('#eraser-btn');
eraserBtn.addEventListener('click', () => {
	eraserBtn.classList.toggle('selected');

	if (eraserBtn.classList.contains('selected')) {
		erase = true;
		sketch = false;
		sketchBtn.classList.remove('selected');
	}

	if (!eraserBtn.classList.contains('selected')) {
		erase = false;
	}
});

// sketch
let sketch = false;
let shading = 0;
const sketchBtn = document.querySelector('#sketch-btn');
sketchBtn.addEventListener('click', () => {
	sketchBtn.classList.toggle('selected');

	if (sketchBtn.classList.contains('selected')) {
		sketch = true;
		erase = false;
		eraserBtn.classList.remove('selected');
		console.log(sketch);
	}

	if (!sketchBtn.classList.contains('selected')) {
		sketch = false;
		console.log(sketch);
	}
});

// toggle grid
const gridBtn = document.querySelector('#grid-btn');
gridBtn.addEventListener('click', () => {
	gridBtn.classList.toggle('selected');

	if (gridBtn.classList.contains('selected')) {
		gridEnabled = true;
		enableDrawing(isClick, isHover, gridEnabled);
	}

	if (!gridBtn.classList.contains('selected')) {
		gridEnabled = false;
		enableDrawing(isClick, isHover, gridEnabled);
	}
});

// grid size slider
const slider = document.querySelector('.slider');
const gridSizeText = document.querySelector('.grid-size');
gridSizeText.textContent = slider.value + 'x' + slider.value;
slider.addEventListener('input', () => {
	gridSizeText.textContent = slider.value + 'x' + slider.value;
});

// color-picker
const colorPicker = document.querySelector('#color-picker');
colorPicker.addEventListener('change', (e) => {
	currentColor = e.target.value;
});

// swatches
const swatches = document.querySelectorAll('.swatch');
swatches.forEach((swatch) => {
	swatch.addEventListener('click', (e) => {
		if (e.altKey) {
			e.target.style.backgroundColor = colorPicker.value;
		}
	});

	swatch.addEventListener('click', (e) => {
		if (!e.target.style.backgroundColor == '') {
			currentColor = e.target.style.backgroundColor;
			colorPicker.value = rgbToHex(currentColor);
		}
	});
});

//#endregion

//#region GRID
const gridContainer = document.querySelector('.grid-container');

// initialise default grid
// pixelCount value is from (Num) x Num px, where Num = pixelCount
let pixelCount = 16;

gridContainer.style.gridTemplateColumns = 'repeat(' + pixelCount + ', 1fr)';
for (let i = 0; i < pixelCount * pixelCount; i++) {
	const pixelDiv = document.createElement('div');
	pixelDiv.classList.add('pixel');
	pixelDiv.setAttribute('draggable', false);
	pixelDiv.setAttribute('data-shading', 0);
	gridContainer.appendChild(pixelDiv);
}

slider.addEventListener('input', () => {
	pixelCount = slider.value;
	gridContainer.style.gridTemplateColumns = 'repeat(' + pixelCount + ', 1fr)';

	while (gridContainer.firstChild) {
		gridContainer.removeChild(gridContainer.lastChild);
	}

	for (let i = 0; i < pixelCount * pixelCount; i++) {
		const pixelDiv = document.createElement('div');
		pixelDiv.classList.add('pixel');
		pixelDiv.setAttribute('draggable', false);
		pixelDiv.setAttribute('data-shading', 0);
		gridContainer.appendChild(pixelDiv);
	}
	enableDrawing(isHover, isClick, gridEnabled); // preserve mode
});

// drawing to the grid
function enableDrawing(isHover, isClick, gridEnabled) {
	const pixels = document.querySelectorAll('.pixel');

	if (gridEnabled == false) {
		pixels.forEach((pixel) => {
			pixel.style.border = 'none';
		});
	} else {
		pixels.forEach((pixel) => {
			pixel.style.border = '1px dotted rgb(245, 245, 245)';
		});
	}

	// hover mode
	if (isHover) {
		pixels.forEach((pixel) => {
			pixel.removeEventListener('click', draw);
			pixel.addEventListener('mouseover', draw);
		});
	}

	// click and drag mode
	if (isClick) {
		pixels.forEach((pixel) => {
			pixel.removeEventListener('mouseover', draw);
			pixel.addEventListener('click', draw);
		});

		window.addEventListener('mousedown', () => {
			pixels.forEach((pixel) => {
				pixel.addEventListener('mouseover', draw);
			});
		});

		window.addEventListener('mouseup', () => {
			pixels.forEach((pixel) => {
				pixel.removeEventListener('mouseover', draw);
			});
		});
	}
}

function draw() {
	if (sketch) {
		nextVal = this.dataset.shading; // get current shade val
		if (nextVal <= 8) {
			nextVal++;
		}
		this.setAttribute('data-shading', nextVal);
		console.log(shadeUp('#000000', nextVal));
		this.style.backgroundColor = shadeUp('#000000', nextVal);
	} else if (erase) {
		this.setAttribute('data-shading', 0); // reset shading.
		this.style.backgroundColor = '#FFFFFF';
	} else {
		this.style.backgroundColor = currentColor;
	}
}

function shadeUp(color, shade) {
	return 'rgb(' + hexToRGB(color).toString() + ',' + shade * 0.11 + ')';
}

// thank u stackoverflow :p
function hexToRGB(hex) {
	const normal = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
	if (normal) return normal.slice(1).map((e) => parseInt(e, 16));

	const shorthand = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
	if (shorthand) return shorthand.slice(1).map((e) => 0x11 * parseInt(e, 16));

	return null;
}

function rgbToHex(rgb) {
	// Choose correct separator
	let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
	// Turn "rgb(r,g,b)" into [r,g,b]
	rgb = rgb.substr(4).split(')')[0].split(sep);

	let r = (+rgb[0]).toString(16),
		g = (+rgb[1]).toString(16),
		b = (+rgb[2]).toString(16);

	if (r.length == 1) r = '0' + r;
	if (g.length == 1) g = '0' + g;
	if (b.length == 1) b = '0' + b;

	return '#' + r + g + b;
}

//#endregion
