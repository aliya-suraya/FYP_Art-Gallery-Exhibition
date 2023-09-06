
const  scene = new THREE.Scene();
const  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .1, 1000);
const renderer = new THREE.WebGLRenderer();

let controls = {};
let player = {
  height: 0.2,
  turnSpeed: .03,
  speed: .07,
  jumpHeight: .2,
  gravity: .01,
  velocity: 0,
  
  jumps: false
};

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.background = new THREE.Color("white");
document.body.appendChild(renderer.domElement);

// BrowserWindow->Renderer:ResizeRe-Render
window.addEventListener('resize', () => {
  let w = window.innerWidth,
      h = window.innerHeight;
  
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

// Camera:Setup
camera.position.set(0, player.height, -0.2);
camera.lookAt(new THREE.Vector3(0, player.height, 0));

const canvas = document.getElementById("canvas");
const fileInput = document.getElementById("fileInput");
const frameSelect = document.getElementById("frameSelect");
const descriptionInput = document.getElementById('descriptionInput');
const submitButton = document.getElementById('submitButton');
const descriptions = [];

let model;
let texture;
let imageData;
let imageDescriptions = {};
let appliedDescriptions = {};

let loader = new THREE.GLTFLoader();
loader.load('./design3/scene.gltf', function (gltf) {
   model=gltf.scene;
   console.log("Model loaded successfully");
    scene.add(model);

    const fileInput = document.getElementById("fileInput");
    fileInput.addEventListener("change", handleImageUpload);
});


function handleImageUpload(event) {
  console.log('Image upload event triggered');
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    imageData = e.target.result;
    const selectedFrame = frameSelect.value;

  console.log('Replacing texture for frame:', selectedFrame);
  replaceTexture(imageData, selectedFrame);
    
// Display the description for the selected frame
if (imageDescriptions[selectedFrame]) {
  console.log('Description:', imageDescriptions[selectedFrame]);
}

  };
  reader.readAsDataURL(file);
}

submitButton.addEventListener('click', handleSubmit);

function handleSubmit() {
  console.log('Submit button clicked');
  
  const file = fileInput.files[0];
  const description = descriptionInput.value;
  const selectedFrame = frameSelect.value;
  
  
  if (!file || !description) {
    console.log('Please upload an image and enter a description');
    return;
  }
  
  const frameDescription = { frameName: selectedFrame, description: description };
  descriptions.push(frameDescription); // Add to the descriptions array
  appliedDescriptions[selectedFrame] = description;

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageData = e.target.result;
    
    console.log('Replacing texture for frame:', selectedFrame);
    replaceTexture(imageData, selectedFrame);
    
    // Store the description for the selected frame
    const frameDescription = { frameName: selectedFrame, description: description };
    imageDescriptions[selectedFrame] = description;
    appliedDescriptions[selectedFrame] = description;
    

    console.log('Description:', description);
  };
  reader.readAsDataURL(file);
}

function replaceTexture(imageData, frameName) {
  console.log('Replacing texture for frame:', frameName);
  console.log('Replacing texture with image data:', imageData);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(imageData, function (newTexture) {
    texture = newTexture;

    model.traverse((child) => {
      if (child.isMesh && child.name === frameName) {
        const material = child.material;

          material.map = texture;
          material.needsUpdate = true;
  
      }
    })
    });
    
  };


const button = document.getElementById('export');
button.addEventListener('click', exportmodel);

function exportmodel() {
  const exporter = new THREE.GLTFExporter();
  
  // Parse the input and generate the glTF output
  const descriptions = Object.keys(appliedDescriptions).map(frameName => ({
    frameName,
    description: appliedDescriptions[frameName],
  }));

  
  exporter.parse(scene, function(gltf) {
		const output = JSON.stringify( gltf, null, 2 );
		sendToServer(output, descriptions);
  }, {});
}

function sendToServer(data, descriptions) {
  fetch('/upload_gltf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gltfData: data, descriptions: descriptions }),
  })
    .then((response) => response.json())
    .then((response) => {
      // Handle the server's response, if needed
      console.log('Server response:', response);
      showMessage('Exhibition Published');
    })
    .catch((error) => {
      // Handle any errors that occur during the fetch request
      console.error('Error sending data to server:', error);
    });
}

function showMessage(message) {
  alert(message);
}


// Object:Light:1
let light1 = new THREE.PointLight("white", .8);
light1.position.set(0, 3, 0);
light1.castShadow = true;
light1.shadow.camera.near = 2.5;
scene.add(light1);

// Object:Light:2
let light2 = new THREE.AmbientLight("white", .15);
light2.position.set(10, 2, 0);
scene.add(light2);

// Controls:Listeners
document.addEventListener('keydown', ({ keyCode }) => { controls[keyCode] = true });
document.addEventListener('keyup', ({ keyCode }) => { controls[keyCode] = false });

// ...
function control() {
  // Controls:Engine 
  if(controls[87]){ // w
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }
  if(controls[83]){ // s
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }
  if(controls[65]){ // a
    camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
  }
  if(controls[68]){ // d
    camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
  }
  if(controls[37]){ // la
    camera.rotation.y -= player.turnSpeed;
  }
  if(controls[39]){ // ra
    camera.rotation.y += player.turnSpeed;
  }
  if(controls[32]) { // space
    if(player.jumps) return false;
    player.jumps = true;
    player.velocity = -player.jumpHeight;
  }
}

function ixMovementUpdate() {
  player.velocity += player.gravity;
  camera.position.y -= player.velocity;
  
  if(camera.position.y < player.height) {
    camera.position.y = player.height;
    player.jumps = false;
  }
}


function update() {
  control();
  ixMovementUpdate();

}

function render() {
  renderer.render(scene, camera);
}

function loop() {
  requestAnimationFrame(loop);
  update();
  render();
}

loop();
