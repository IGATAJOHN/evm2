import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import 'babylonjs-materials';
import 'babylonjs-post-process';
import 'babylonjs-procedural-textures';
import 'babylonjs-serializers';
import 'babylonjs-gui';

var modelDataDiv = document.getElementById('modelData');
var modelFilename = modelDataDiv.getAttribute('data-model-filename');

window.addEventListener('DOMContentLoaded', function(){
    var canvas = document.getElementById('modelCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var scene;

    // Material for highlighting meshes
    var highlightMaterial;

    // Array to store selected meshes
    var selectedMesh;
    var customName; // Define customName variable for storing mesh name

    // Create cameras
    var defaultCamera, camera1, camera2, insideCamera, outsideCamera;

    // Load the custom 3D mesh
    BABYLON.SceneLoader.Load("", "../static/models/" + modelFilename, engine, function (loadedScene) {
        scene = loadedScene;
        var hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
        hemisphericLight.intensity = 0.7; // Adjust intensity as needed

// Create cameras
defaultCamera = createCamera("defaultCamera", new BABYLON.Vector3(0, 5, -10), scene);
camera1 = createCamera("camera1", new BABYLON.Vector3(0, 10, 0), scene);

// Set the default active camera
scene.activeCamera = defaultCamera;
scene.createDefaultCameraOrLight(true, true, true);

var boundingInfo = scene.meshes[0].getBoundingInfo();
var center = boundingInfo.boundingBox.center;
scene.meshes[0].position.subtractInPlace(center);

// Set the camera to cover the entire model
defaultCamera.setTarget(scene.meshes[0].absolutePosition);
defaultCamera.lowerRadiusLimit = boundingInfo.boundingBox.extendSizeWorld.length() * 1.5;

// Set camera position to view the model from the top
defaultCamera.setPosition(new BABYLON.Vector3(0, 20, 0)); // Adjust the height as needed
defaultCamera.alpha = -Math.PI / 2; // Set camera rotation to look from the side
defaultCamera.beta = Math.PI / 2; // Set camera angle to look straight down

// Create a parent mesh to hold the model and rotate it
var parentMesh = new BABYLON.TransformNode("parentMesh", scene);
scene.meshes[0].parent = parentMesh;

// Tilt the parent mesh downward by about 40 degrees
// Tilt the parent mesh upward by about 40 degrees (opposite direction)
parentMesh.rotation.x = -BABYLON.Tools.ToRadians(20); // Adjust the angle as needed

document.addEventListener('keydown', (event) => {
    // Check if the "=" key is pressed
    if (event.key === '=') {
        switchCameraView();
    }
});

// Function to switch between camera views
function switchCameraView() {
    // Toggle between different camera objects or change camera properties
    if (scene.activeCamera === defaultCamera) {
        // Calculate centroid of all meshes
        var centroid = calculateCentroid(scene.meshes);
        camera1.position = centroid;
        scene.activeCamera = camera1;
    } else if (scene.activeCamera === camera1) {
        // Set camera to the default initial view
        defaultCamera.setTarget(scene.meshes[0].absolutePosition);
        defaultCamera.lowerRadiusLimit = boundingInfo.boundingBox.extendSizeWorld.length() * 1.5;
        defaultCamera.setPosition(new BABYLON.Vector3(0, 20, 0)); // Adjust the height as needed
        defaultCamera.alpha = -Math.PI / 2; // Set camera rotation to look from the side
        defaultCamera.beta = Math.PI / 2; // Set camera angle to look straight down
        scene.activeCamera = defaultCamera;
    } else {
        // Calculate centroid of all meshes
        var centroid = calculateCentroid(scene.meshes);
        camera1.position = centroid;
        scene.activeCamera = camera1;
    }
}

// Function to calculate centroid of meshes
function calculateCentroid(meshes) {
    var sum = BABYLON.Vector3.Zero();
    meshes.forEach(mesh => {
        sum = sum.add(mesh.getAbsolutePosition());
    });
    return sum.scale(1 / meshes.length);
}

// Modify camera creation function to position cameras initially
function createCamera(name, position, scene) {
    var camera = new BABYLON.ArcRotateCamera(name, 0, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    camera.setPosition(position);
    camera.attachControl(canvas, true);
    // Position the camera initially
    camera.position = position;
    return camera;
}

// Add event listener for keyboard navigation
document.addEventListener('keydown', (event) => {
    // Check if scene is loaded and active camera is set
    if (scene && scene.activeCamera) {
        // Get active camera position and rotation
        var camera = scene.activeCamera;
        var position = camera.position.clone();
        var rotation = camera.rotation.clone();

        // Define movement and rotation speed
        var movementSpeed = 0.1;
        var rotationSpeed = 0.02;

        // Handle keyboard input for navigation
        switch (event.key) {
            case 'w': // Forward movement
                position = position.add(new BABYLON.Vector3(
                    Math.sin(rotation.y) * movementSpeed,
                    0,
                    Math.cos(rotation.y) * -movementSpeed
                ));
                break;
            case 's': // Backward movement
                position = position.subtract(new BABYLON.Vector3(
                    Math.sin(rotation.y) * movementSpeed,
                    0,
                    Math.cos(rotation.y) * -movementSpeed
                ));
                break;
            case 'a': // Left movement
                position = position.add(new BABYLON.Vector3(
                    Math.sin(rotation.y - Math.PI / 2) * movementSpeed,
                    0,
                    Math.cos(rotation.y - Math.PI / 2) * -movementSpeed
                ));
                break;
            case 'd': // Right movement
                position = position.add(new BABYLON.Vector3(
                    Math.sin(rotation.y + Math.PI / 2) * movementSpeed,
                    0,
                    Math.cos(rotation.y + Math.PI / 2) * -movementSpeed
                ));
                break;
            case 'ArrowLeft': // Rotate left
                rotation.y -= rotationSpeed;
                break;
            case 'ArrowRight': // Rotate right
                rotation.y += rotationSpeed;
                break;
        }

        // Update camera position and rotation
        camera.position = position;
        camera.rotation = rotation;
    }
});
// Add event listeners for camera movement
document.getElementById('moveForward').addEventListener('click', function() {
    moveCamera('forward');
});

document.getElementById('moveBackward').addEventListener('click', function() {
    moveCamera('backward');
});

document.getElementById('turnLeft').addEventListener('click', function() {
    rotateCamera('left');
});

document.getElementById('turnRight').addEventListener('click', function() {
    rotateCamera('right');
});

// Function to move the camera forward or backward
function moveCamera(direction) {
    var camera = scene.activeCamera;
    var movementSpeed = 0.1; // Adjust movement speed as needed

    if (direction === 'forward') {
        camera.position = camera.position.add(new BABYLON.Vector3(
            Math.sin(camera.rotation.y) * movementSpeed,
            0,
            Math.cos(camera.rotation.y) * -movementSpeed
        ));
    } else if (direction === 'backward') {
        camera.position = camera.position.subtract(new BABYLON.Vector3(
            Math.sin(camera.rotation.y) * movementSpeed,
            0,
            Math.cos(camera.rotation.y) * -movementSpeed
        ));
    }
}

// Function to rotate the camera left or right
function rotateCamera(direction) {
    var camera = scene.activeCamera;
    var rotationSpeed = 0.02; // Adjust rotation speed as needed

    if (direction === 'left') {
        camera.alpha -= rotationSpeed; // Adjust the alpha angle for left rotation
    } else if (direction === 'right') {
        camera.alpha += rotationSpeed; // Adjust the alpha angle for right rotation
    }
}

// Add click event listener to child meshes
scene.meshes.forEach(mesh => {
    if (mesh.parent) {
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(evt) {
            // Capture position and rotation of the clicked child mesh
            var position = mesh.getAbsolutePosition().clone();
            var rotation = mesh.rotationQuaternion ? mesh.rotationQuaternion.toEulerAngles() : mesh.rotation.clone();
            var scaling = mesh.scaling.clone(); // Capture scaling if needed

            // Open a new window and render the 2D representation
            openNewWindowWithMeshData(mesh, position, rotation, scaling);
        }));
    }
});

// Function to open a new window and render the 2D representation
function openNewWindowWithMeshData(mesh, position, rotation, scaling) {
    // Open a new window
    var newWindow = window.open('', '_blank');

    // Write HTML content to the new window
    newWindow.document.write('<html><head><title>2D Mesh Representation</title></head><body>');
    newWindow.document.write('<h1>2D Mesh Representation</h1>');
    newWindow.document.write('<canvas id="meshCanvas" width="400" height="300"></canvas>');
    newWindow.document.write('<script src="https://cdn.babylonjs.com/babylon.js"></script>');
    newWindow.document.write('<script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>');
    newWindow.document.write('<script>');
    newWindow.document.write('var canvas = document.getElementById("meshCanvas");');
    newWindow.document.write('var engine = new BABYLON.Engine(canvas, true);');
    newWindow.document.write('var scene = new BABYLON.Scene(engine);');
    newWindow.document.write('var camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);');
    newWindow.document.write('camera.attachControl(canvas, false);');
    // Additional setup code for the scene if needed

    // Render the 2D representation of the mesh
    render2DRepresentation(mesh, position, rotation, scaling, newWindow);

    newWindow.document.write('engine.runRenderLoop(function () { scene.render(); });');
    newWindow.document.write('</script>');
    newWindow.document.write('</body></html>');
}

// Function to render the 2D representation of the mesh in the new window
function render2DRepresentation(mesh, position, rotation, scaling, newWindow) {
    // Create a 2D representation of the mesh
    // This could involve creating a cross-sectional view or any other representation you desire
    // Ensure the 2D representation matches the captured position, rotation, and scaling of the original mesh
    // Use Babylon.js primitives, materials, and methods to create the 2D representation
    // For simplicity, let's create a basic shape representing the mesh

    // Example: Create a rectangle
    var rect = BABYLON.MeshBuilder.CreatePlane("rect", { width: 5, height: 5 }, scene);
    // Set position, rotation, and scaling based on captured data
    rect.position.copyFrom(position);
    rect.rotation.copyFrom(rotation);
    rect.scaling.copyFrom(scaling); // Apply scaling if needed
    // Add material and other properties as needed
    var material = new BABYLON.StandardMaterial("rectMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red color for demonstration
    rect.material = material;

    // Add more logic as necessary to create the desired 2D representation
}

// Add event listener for the screenshot button
document.getElementById('screenshotButton').addEventListener('click', function() {
    takeScreenshot();
});

// Function to take a screenshot of the canvas
function takeScreenshot() {
    // Get the canvas element
    var canvas = document.getElementById('modelCanvas');

    // Create a new image element
    var image = new Image();

    // Set the image source to the data URL of the canvas
    image.src = canvas.toDataURL('image/png');

    // Create a link element to download the image
    var link = document.createElement('a');
    link.href = image.src;
    link.download = 'screenshot.png'; // Set the filename for the downloaded image
    link.click(); // Simulate a click on the link to trigger the download
}
// Define variables for video recording
let mediaRecorder;
let recordedChunks = [];

// Event listener for the Record Video button
document.getElementById('recordVideoButton').addEventListener('click', function() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        startRecording();
    } else {
        stopRecording();
    }
});

// Function to start video recording
function startRecording() {
    // Get the canvas element
    let canvas = document.getElementById('modelCanvas');

    // Get the canvas stream
    let stream = canvas.captureStream();

    // Create a MediaRecorder instance
    mediaRecorder = new MediaRecorder(stream);

    // Event listener for dataavailable event
    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    // Event listener for stop event
    mediaRecorder.onstop = function() {
        // Create a blob from the recorded chunks
        let blob = new Blob(recordedChunks, { type: 'video/webm' });

        // Create a video element to preview the recording
        let video = document.createElement('video');
        video.controls = true;
        video.src = URL.createObjectURL(blob);

        // Append the video element to the document
        document.body.appendChild(video);
    };

    // Start recording
    mediaRecorder.start();
}

// Function to stop video recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}
// Event listener for the Zoom In button
document.getElementById('zoomInButton').addEventListener('click', function() {
    zoomCamera('in');
});

// Event listener for the Zoom Out button
document.getElementById('zoomOutButton').addEventListener('click', function() {
    zoomCamera('out');
});

// Function to zoom the camera in or out
function zoomCamera(direction) {
    var camera = scene.activeCamera;
    var zoomSpeed = 0.1; // Adjust zoom speed as needed

    if (direction === 'in') {
        // Decrease camera radius to zoom in
        camera.radius -= zoomSpeed;
    } else if (direction === 'out') {
        // Increase camera radius to zoom out
        camera.radius += zoomSpeed;
    }
}
const heatmapButton = document.getElementById('heatmap');
heatmapButton.addEventListener('click', () => {
    scene.activeCamera = scene.activeCamera !== defaultCamera ? defaultCamera : scene.getCameraByName('camera1');
});


        // Enable picking on canvas click
        var previousSelectedMesh = null;
        canvas.addEventListener('click', function (event) {
            var pickInfo = scene.pick(scene.pointerX, scene.pointerY);
            
            if (pickInfo.hit) {
                var pickedMesh = pickInfo.pickedMesh;

                // Reset material of previously selected mesh
                if (previousSelectedMesh) {
                    previousSelectedMesh.material = previousSelectedMesh.originalMaterial;
                }

                // Highlight the newly selected mesh
                highlightMaterial = new BABYLON.StandardMaterial("highlightMaterial", scene);
                highlightMaterial.emissiveColor = new BABYLON.Color3(0, 0, 1); // Blue
                pickedMesh.originalMaterial = pickedMesh.material;
                pickedMesh.material = highlightMaterial;

                // Log the name of the selected mesh to the console
                console.log("Selected mesh:", pickedMesh.name);

                // Function to switch between camera views
                function switchCameraView() {
                    // Toggle between different camera objects or change camera properties
                    if (scene.activeCamera === defaultCamera) {
                        scene.activeCamera = camera1;
                    } else if (scene.activeCamera === camera1) {
                        scene.activeCamera = camera2;
                    } else {
                        scene.activeCamera = defaultCamera;
                    }
                }

                // Retrieve metadata for the selected mesh from localStorage
                var metadata = JSON.parse(localStorage.getItem(pickedMesh.name));
                if (metadata) {
                    // Populate form fields with metadata
                    document.getElementById('objectName').value = metadata.objectName;
                    document.getElementById('locationType').value = metadata.locationType;
                    document.getElementById('sampleType').value = metadata.sampleType;
                    document.getElementById('presenceFrequency').value = metadata.presenceFrequency;
                    document.getElementById('incident').value = metadata.incident;
                    document.getElementById('evidence').value = metadata.evidence;
                } else {
                    // Clear form fields if metadata is not found
                    clearForm();
                }

                // Store the newly selected mesh for future reference
                previousSelectedMesh = pickedMesh;
            }
        });

        engine.runRenderLoop(function () {
            scene.render();
        });
    });

    var form = document.getElementById('modelDataForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var formData = new FormData(form);
        var customName = document.getElementById('objectName').value;

        // Store form data in localStorage
        var metadata = {
            objectName: formData.get('objectName'),
            locationType: formData.get('locationType'),
            sampleType: formData.get('sampleType'),
            presenceFrequency: formData.get('presenceFrequency'),
            incident: formData.get('incident'),
            evidence: formData.get('evidence')
        };
        localStorage.setItem(customName, JSON.stringify(metadata));

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/submit_form');
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log(xhr.responseText);
                form.reset();
                var toast = document.getElementById('toast');
                var bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            } else {
                console.error('Form submission failed');
            }
        };
        xhr.send(formData);
    });

    // Function to clear form fields
    function clearForm() {
        document.getElementById('objectName').value = "";
        document.getElementById('locationType').value = "";
        document.getElementById('sampleType').value = "";
        document.getElementById('presenceFrequency').value = "";
        document.getElementById('incident').value = "";
        document.getElementById('evidence').value = "";
    }

    // Function to create camera
    function createCamera(name, position, scene) {
        var camera = new BABYLON.ArcRotateCamera(name, 0, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.setPosition(position);
        camera.attachControl(canvas, true);
        return camera;
    }
});


