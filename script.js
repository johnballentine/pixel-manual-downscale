const originalCanvas = document.getElementById('originalCanvas');
const scaledCanvas = document.getElementById('scaledCanvas');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const offsetXInput = document.getElementById('offsetXInput');
const offsetYInput = document.getElementById('offsetYInput');
const applyButton = document.getElementById('applyResolutionButton');
const controlRadios = document.getElementsByName('control');
const displayRadios = document.getElementsByName('display');
const transparencySlider = document.getElementById('transparencySlider');

const originalCtx = originalCanvas.getContext('2d');
const scaledCtx = scaledCanvas.getContext('2d');

let img = new Image();
let currentWidth, currentHeight;
let offsetX = 0, offsetY = 0;
let controlMode = 'resolution'; // Default mode
let displayMode = 'side-by-side'; // Default display mode
let transparency = 0.5; // Default transparency for overlaid mode

document.addEventListener('keydown', handleKeyDown);

// Disable arrow key scrolling
window.addEventListener('keydown', function(e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});

// Listen for display mode changes
displayRadios.forEach(radio => {
  radio.addEventListener('change', handleDisplayModeChange);
});
transparencySlider.addEventListener('input', handleSliderChange);

// Load the image when the page loads
window.onload = function() {
  img.onload = function() {
    currentWidth = Math.floor(img.width / 2);  // Start at half size of the original
    currentHeight = Math.floor(img.height / 2);
    drawOriginalImage();
    drawScaledImage();
    updateResolutionFields();
  };
  img.src = 'image.webp'; // Ensure the image file is image.webp
};

// Draw the original image at full resolution
function drawOriginalImage() {
  originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  originalCtx.imageSmoothingEnabled = false; // Nearest-neighbor interpolation
  originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);
}

// Draw the scaled image and handle display modes
function drawScaledImage() {
  // 1. Create an off-screen canvas that represents the original image
  const offCanvas = document.createElement('canvas');
  offCanvas.width = img.width;
  offCanvas.height = img.height;
  const offCtx = offCanvas.getContext('2d');
  offCtx.imageSmoothingEnabled = false; // Nearest-neighbor interpolation

  // 2. Draw the original image on the off-screen canvas with the offset applied
  offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
  offCtx.drawImage(img, offsetX, offsetY, img.width, img.height);

  // 3. Create another off-screen canvas for the downscaled version
  const downscaleCanvas = document.createElement('canvas');
  downscaleCanvas.width = currentWidth;
  downscaleCanvas.height = currentHeight;
  const downscaleCtx = downscaleCanvas.getContext('2d');
  downscaleCtx.imageSmoothingEnabled = false; // Nearest-neighbor interpolation

  // 4. Downscale the offset image to the currentWidth and currentHeight
  downscaleCtx.drawImage(offCanvas, 0, 0, img.width, img.height, 0, 0, currentWidth, currentHeight);

  // Handle display mode
  if (displayMode === 'side-by-side') {
    // Side-by-side mode (current behavior)
    originalCanvas.style.display = 'block';
    scaledCanvas.style.display = 'block';
    transparencySlider.style.display = 'none'; // Hide the slider

    // Redraw the original image on the originalCanvas
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    originalCtx.imageSmoothingEnabled = false;
    originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height); // Ensure original image is restored
    
    scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    scaledCtx.imageSmoothingEnabled = false; // Nearest-neighbor interpolation
    scaledCtx.drawImage(
      downscaleCanvas,               // Source: the downscaled image
      0, 0,                          // Position in the source
      currentWidth, currentHeight,    // Source width and height
      0, 0,                          // Draw it at (0, 0) on the final canvas
      scaledCanvas.width, scaledCanvas.height // Scale to fill the entire canvas
    );
  } else if (displayMode === 'overlaid') {
    // Overlaid mode: draw the scaled image on top of the original with transparency
    originalCanvas.style.display = 'block';
    scaledCanvas.style.display = 'none';
    transparencySlider.style.display = 'block'; // Show the slider
    
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    originalCtx.imageSmoothingEnabled = false; // Nearest-neighbor for original
    originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height); // Original image
    
    originalCtx.globalAlpha = transparency; // Set transparency from the slider
    originalCtx.imageSmoothingEnabled = false; // Nearest-neighbor for overlay
    originalCtx.drawImage(downscaleCanvas, 0, 0, currentWidth, currentHeight, 0, 0, originalCanvas.width, originalCanvas.height); // Scaled image on top
    
    originalCtx.globalAlpha = 1.0; // Reset transparency
  }
}

// Handle display mode change
function handleDisplayModeChange(e) {
  displayMode = e.target.value;
  if (displayMode === 'overlaid') {
    transparencySlider.style.display = 'block'; // Show the slider in overlaid mode
  } else {
    transparencySlider.style.display = 'none'; // Hide the slider in other modes
  }
  drawScaledImage(); // Redraw the images based on the new mode
}

// Handle slider change
function handleSliderChange(e) {
  transparency = parseFloat(e.target.value); // Update transparency from the slider
  drawScaledImage();
}

// Update the input fields with the current resolution and offset
function updateResolutionFields() {
  widthInput.value = currentWidth;
  heightInput.value = currentHeight;
  offsetXInput.value = offsetX;
  offsetYInput.value = offsetY;
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

// Handle arrow key events for resolution or offset adjustment
function handleKeyDown(e) {
  controlMode = getSelectedControlMode();
  
  if (controlMode === 'resolution') {
    if (e.key === 'ArrowDown') {
      decreaseResolution();
    } else if (e.key === 'ArrowUp') {
      increaseResolution();
    }
  } else if (controlMode === 'offset') {
    if (e.key === 'ArrowLeft') {
      offsetX -= 1; // Allow negative offsetX values
    } else if (e.key === 'ArrowRight') {
      offsetX += 1;
    } else if (e.key === 'ArrowUp') {
      offsetY -= 1; // Allow negative offsetY values
    } else if (e.key === 'ArrowDown') {
      offsetY += 1;
    }
    updateResolutionFields();
    drawScaledImage();
  }
}

// Get the selected control mode (resolution or offset)
function getSelectedControlMode() {
  for (const radio of controlRadios) {
    if (radio.checked) {
      return radio.value;
    }
  }
  return 'resolution';
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
