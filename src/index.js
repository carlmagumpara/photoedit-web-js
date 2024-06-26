import * as deepar from 'deepar';

// Log the version. Just in case.
console.log("Deepar version: " + deepar.version);

// Top-level await is not supported.
// So we wrap the whole code in an async function that is called immediatly.
(async function() {

  // Resize the canvas according to screen size.
  const canvas = document.getElementById('deepar-canvas');
  canvas.width = window.innerWidth > window.innerHeight ? Math.floor(window.innerHeight * 0.66) : window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Initialize DeepAR.
  const deepAR = await deepar.initialize({
    licenseKey: '836eec3a4a513adb73d0631cafaa3da68c269e21e5a2c720397a68e8ace41824a92d9abd8884b9c6',
    canvas: canvas,
    rootPath: "./deepar-resources", // See webpack.config.js and package.json build script.
    additionalOptions: {
      // Disable the default webcam preview.
      cameraConfig: {
        disableDefaultCamera: true
      },
      hint: "faceModelsPredownload" // Download the face tracking model as soon as possible.
    }
  });

  deepAR.setPaused(true);

  // Hide the loading screen.
  document.getElementById("loader-wrapper").style.display = "none";

  // Nice util function for loading an image.
  async function getImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {resolve(img)};
      img.onerror = reject;
      img.src = src;
    })
  }

  // Using setTimeout with await.
  async function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  // Function for changing the photo.
  async function processPhoto(src) {
    let image;
    if(typeof src == "string") {
      image = await getImage(src);
    } else {
      image = src;
    }

    // Process image multiple times to get more accurate tracking results.
    // Face tracking gets better with successive frames.
    deepAR.processImage(image);
    deepAR.processImage(image);
    deepAR.processImage(image);

    return image;
  }

  // Initial image
  let image = await getImage('./test_photos/camera1.jpg');

  // Trigger the face tracking initialization by loading the effect.
  deepAR.switchEffect('./effects/look1').then(() => {
    // Clear the effect after it has been loaded.
    deepAR.clearEffect()
    // Push the current image frame because clearEffect can sometimes produce a black image when setPaused is called.
    deepAR.processImage(image);
  }).catch(() => {
    // The switchEffectCanceled error will be thrown if we try to load some beuty effect while this promise is not resolved.
    // So we just ignore this error.
  });

  // Load the inital photo.
  image = await processPhoto(image);

  document.getElementById('load-photo-1').onclick = async function() {
    image = await processPhoto('./test_photos/camera1.jpg');
  }
  document.getElementById('load-photo-2').onclick = async function() {
    image = await processPhoto('./test_photos/camera2.jpg');
  }
  document.getElementById('apply-makeup-look-1').onclick = async function() {
    deepAR.switchEffect('./effects/look1');
    await delay(33);
    await processPhoto(image);
  }
  document.getElementById('apply-makeup-look-2').onclick = async function() {
    deepAR.switchEffect('./effects/look2');
    await delay(33);
    await processPhoto(image);
  }
  document.getElementById('remove-makeup-filter').onclick = function() {
    deepAR.clearEffect();
    deepAR.processImage(image);
  }
  document.getElementById('download-photo').onclick = async function() {
    const screenshot = await deepAR.takeScreenshot();
    const a = document.createElement('a');
    a.href = screenshot;
    a.download = 'photo.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
})();
