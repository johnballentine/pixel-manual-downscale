const originalCanvas = document.getElementById('originalCanvas');
const scaledCanvas = document.getElementById('scaledCanvas');
const scaleFactorDisplay = document.getElementById('scaleFactorDisplay');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const applyButton = document.getElementById('applyResolutionButton');

const originalCtx = originalCanvas.getContext('2d');
const scaledCtx = scaledCanvas.getContext('2d');

let img = new Image();
let currentWidth, currentHeight;

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
    // Set the default resolution to half of the original dimensions
    currentWidth = Math.floor(img.width / 2);
    currentHeight = Math.floor(img.height / 2);
    drawOriginalImage();
    drawScaledImage();
    updateResolutionFields();
  };
  img.src = 'image.webp'; // Ensure the image file is in the same directory
};

// Draw the original image at full resolution
function drawOriginalImage() {
  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);
}

// Draw the scaled image based on currentWidth and currentHeight
function drawScaledImage() {
  const offCanvas = document.createElement('canvas');
  offCanvas.width = currentWidth;
  offCanvas.height = currentHeight;
  const offCtx = offCanvas.getContext('2d');
  offCtx.imageSmoothingEnabled = false;
  offCtx.drawImage(img, 0, 0, currentWidth, currentHeight);

  scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
  scaledCtx.imageSmoothingEnabled = false;
  scaledCtx.drawImage(offCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
}

// Update the input fields with the current resolution
function updateResolutionFields() {
  widthInput.value = currentWidth;
  heightInput.value = currentHeight;
}

// Apply the new resolution entered by the user
applyButton.addEventListener('click', function() {
  const newWidth = parseInt(widthInput.value);
  const newHeight = parseInt(heightInput.value);

  if (!isNaN(newWidth) && !isNaN(newHeight) && newWidth > 0 && newHeight > 0 && newWidth <= img.width && newHeight <= img.height) {
    currentWidth = newWidth;
    currentHeight = newHeight;
    drawScaledImage();
  } else {
    alert('Please enter valid width and height values that are within the original image dimensions.');
  }
});

// Handle up and down key events
function handleKeyDown(e) {
  if (e.key === 'ArrowDown') {
    decreaseResolution();
  } else if (e.key === 'ArrowUp') {
    increaseResolution();
  } else if (e.key === 'Enter') {
    saveImage();
  }
}

// Decrease resolution by 1 pixel
function decreaseResolution() {
  if (currentWidth > 1 && currentHeight > 1) {
    currentWidth -= 1;
    currentHeight -= 1;
    updateResolutionFields();
    drawScaledImage();
  }
}

// Increase resolution by 1 pixel
function increaseResolution() {
  if (currentWidth < img.width && currentHeight < img.height) {
    currentWidth += 1;
    currentHeight += 1;
    updateResolutionFields();
    drawScaledImage();
  }
}

// Save the current scaled image
function saveImage() {
  const link = document.createElement('a');
  link.download = 'downscaled_image.png';
  link.href = scaledCanvas.toDataURL();
  link.click();
}
