const originalCanvas = document.getElementById('originalCanvas');
const scaledCanvas = document.getElementById('scaledCanvas');
const scaleFactorDisplay = document.getElementById('scaleFactorDisplay');

const originalCtx = originalCanvas.getContext('2d');
const scaledCtx = scaledCanvas.getContext('2d');

let img = new Image();
let scaleFactor = 0.25; // Default scaling factor
const maxScaleFactor = 1.0; // Maximum scaling factor
const minScaleFactor = 0.01; // Minimum scaling factor

document.addEventListener('keydown', handleKeyDown);

// Disable arrow key scrolling
window.addEventListener('keydown', function(e) {
  if (["ArrowUp", "ArrowDown"].includes(e.key)) {
    e.preventDefault();
  }
});

// Load the image when the page loads
window.onload = function() {
  img.onload = function() {
    drawOriginalImage();
    drawScaledImage();
  };
  img.src = 'image.webp'; // Ensure the image file is in the same directory
};

function drawOriginalImage() {
  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);
}

function drawScaledImage() {
  const width = img.width * scaleFactor;
  const height = img.height * scaleFactor;

  // Create an off-screen canvas
  const offCanvas = document.createElement('canvas');
  offCanvas.width = width;
  offCanvas.height = height;
  const offCtx = offCanvas.getContext('2d');

  // Scale the image using nearest-neighbor interpolation
  offCtx.imageSmoothingEnabled = false;
  offCtx.drawImage(img, 0, 0, width, height);

  // Draw the scaled image onto the main canvas
  scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
  scaledCtx.imageSmoothingEnabled = false;
  scaledCtx.drawImage(offCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
}

function handleKeyDown(e) {
  const scaleStep = calculateScaleStep(); // Dynamic scale step based on current scale factor

  if (e.key === 'ArrowUp') {
    scaleFactor = Math.min(maxScaleFactor, parseFloat((scaleFactor + scaleStep).toFixed(3))); // Increase scale factor
    updateScaleFactor();
  } else if (e.key === 'ArrowDown') {
    scaleFactor = Math.max(minScaleFactor, parseFloat((scaleFactor - scaleStep).toFixed(3))); // Decrease scale factor
    updateScaleFactor();
  } else if (e.key === 'Enter') {
    saveImage();
  }
}

function calculateScaleStep() {
  // Scale the increment dynamically based on the current scale factor.
  // You can adjust the factor (e.g., 0.1) to make it more or less dramatic.
  return scaleFactor * 0.1;
}

function updateScaleFactor() {
  scaleFactorDisplay.textContent = scaleFactor.toFixed(3); // Display scale factor up to three decimal places
  drawScaledImage();
}

function saveImage() {
  const link = document.createElement('a');
  link.download = 'downscaled_image.png';
  link.href = scaledCanvas.toDataURL();
  link.click();
}
