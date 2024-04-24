 // Babylon.js code goes here
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

    // Load the custom 3D mesh
    BABYLON.SceneLoader.Load("", "../static/models/"+modelFilename, engine, function(loadedScene) {
        scene = loadedScene;

        // Create a default camera
        var camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // Create a light
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

        // Material for highlighting meshes
        highlightMaterial = new BABYLON.StandardMaterial("highlightMaterial", scene);
        highlightMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0); // Red
        // Enable picking on canvas click
// Keep track of the previously selected mesh
var previousSelectedMesh = null;

// Enable picking on canvas click
canvas.addEventListener('click', function(event) {
// Get the clicked coordinates
var pickInfo = scene.pick(scene.pointerX, scene.pointerY);

// Check if a mesh is picked
if (pickInfo.hit) {
var pickedMesh = pickInfo.pickedMesh;

// Reset material of previously selected mesh
if (previousSelectedMesh) {
    previousSelectedMesh.material = previousSelectedMesh.originalMaterial;
}

// Change the material color of the picked mesh to red
pickedMesh.originalMaterial = pickedMesh.material;
pickedMesh.material = highlightMaterial;
document.getElementById('objectName').value=pickedMesh.metadata.objectName;
document.getElementById('locationType').value=pickedMesh.metadata.locationType;
document.getElementById('sampleType').value=pickedMesh.metadata.sampleType;
document.getElementById('presenceFrequency').value=pickedMesh.metadata.presenceFrequency;
document.getElementById('incident').value=pickedMesh.metadata.incident;
document.getElementById('evidence').value=pickedMesh.metadata.evidence;
// Display metadata in the object name form field
// var objectNameInput = document.getElementById('objectName');
// if (objectNameInput) {
//     objectNameInput.value = pickedMesh.metadata.objectName || '';
// }

// Update the previously selected mesh
previousSelectedMesh = pickedMesh;
}
});

        // Render the scene
        engine.runRenderLoop(function(){
            scene.render();
        });
    });

// Form submission using AJAX
var form = document.getElementById('modelDataForm');
form.addEventListener('submit', function(event) {
event.preventDefault(); // Prevent default form submission

// Serialize form data
var formData = new FormData(form);

// Send form data asynchronously
var xhr = new XMLHttpRequest();
xhr.open('POST', '/submit_form');
xhr.onload = function() {
if (xhr.status === 200) {
    // Form submitted successfully
    console.log(xhr.responseText);
    // Clear form fields
    form.reset();
    // Show toast message
    var toast = document.getElementById('toast');
    var bsToast = new bootstrap.Toast(toast);
    bsToast.show();
} else {
    // Error handling
    console.error('Form submission failed');
}
};
xhr.send(formData);
});
});