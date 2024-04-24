import { Vector3, ActionManager, ExecuteCodeAction } from 'babylonjs';

export class JetBoxControls {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.activeCamera !== scene.getCameraByName('camera0') ? scene.activeCamera : scene.getCameraByName('camera1');
    
    this.jetBox = scene.getMeshByName('jetBox');
    this.position = this.jetBox.position.clone();
    this.displacement = new Vector3(0, 0, 0);

    this.keys = {
      'a': () => this.panLeft(),
      'd': () => this.panRight(),
      'q': () => this.panUp(),
      'e': () => this.panDown(),
      'w': () => this.panForward(),
      's': () => this.panBackward(),
      'z': () => this.zoomIn(),
      'x': () => this.zoomOut(),
    };

    // this.setupActionManager();
    this.setupKeyboardObservables();
    this.setupOnScreenControls();
  }

//   getCurrentDirection() {
//     // Get the direction vector from the camera's position
//     var ray = this.camera.getForwardRay();

//     // Perform a ray cast to find the intersected mesh
//     var pickInfo = this.scene.pickWithRay(ray);
//     if (pickInfo.hit) {
//         // Get the normal of the intersected surface
//         var normal = pickInfo.getNormal();
        
//         // Determine the direction based on the surface normal
//         var directionText = "";

//         if (Math.abs(normal.x) > Math.abs(normal.z)) {
//             if (normal.x > 0) {
//                 directionText = "E";
//             } else {
//                 directionText = "W";
//             }
//         } else {
//             if (normal.z > 0) {
//                 directionText = "S";
//             } else {
//                 directionText = "N";
//             }
//         }

//         return directionText;
//     } else {
//         // No intersection found, return default direction
//         return "N"; // You can choose a default direction if no intersection occurs
//     }
// }


// getCurrentDirection() {
//   // Get camera's rotation quaternion
//   var rotationQuaternion = this.camera.absoluteRotationQuaternion;
//   rotationQuaternion.normalize();

//   // Get forward vector
//   var forward = Vector3.Forward();
//   forward = Vector3.TransformCoordinates(forward, rotationQuaternion);

//   // Calculate angle between forward vector and north direction
//   var angle = Math.atan2(forward.x, forward.z);
//   angle = angle * (180 / Math.PI); // Convert radians to degrees
//   var direction = "N";

//   // Determine cardinal direction
//   if (angle >= -45 && angle < 45) direction = "N";
//   else if (angle >= 45 && angle < 135) direction = "E";
//   else if (angle >= -135 && angle < -45) direction = "W";
//   else direction = "S";

//   return direction;
// }

getCurrentDirection() {
  

  if (!this.jetBox || !this.camera) {
      console.error("Parent mesh or camera not found in the scene.");
      return null;
  }

  // Get parent mesh's world matrix
  var parentWorldMatrix = this.jetBox.getWorldMatrix();

  // Get camera's local matrix
  var cameraLocalMatrix = this.camera.getWorldMatrix().multiply(parentWorldMatrix.invert());

  // Extract forward direction from camera's local matrix
  var direction = new Vector3(cameraLocalMatrix.m[8], cameraLocalMatrix.m[9], cameraLocalMatrix.m[10]);

  // Normalize direction vector
  direction.normalize();

  // Determine the direction based on the vector components
  var directionText = "";

  // Determine the primary direction (north, south, east, west)
  if (Math.abs(direction.x) > Math.abs(direction.z)) {
      if (direction.x > 0) {
          directionText = "S";
      } else {
          directionText = "N";
      }
  } else {
      if (direction.z > 0) {
          directionText = "E";
      } else {
          directionText = "W";
      }
  }

  return directionText;
}

// getCurrentDirection() {


//    if (!this.jetBox || !this.camera) {
//       console.error("Parent mesh or camera not found in the scene.");
//       return null;
//   }

//   // Get parent mesh's world matrix
//   var parentWorldMatrix = this.jetBox.getWorldMatrix();

//   // Get camera's local matrix
//   var cameraLocalMatrix = this.camera.getWorldMatrix().multiply(parentWorldMatrix.invert());

//   // Extract forward direction from camera's local matrix
//   var direction = new Vector3(cameraLocalMatrix.m[8], cameraLocalMatrix.m[9], cameraLocalMatrix.m[10]);

//   // Normalize direction vector
//   direction.normalize();

//   // Determine the primary direction (north, south, east, west)
//   var primaryDirection = "";
//   if (Math.abs(direction.z) > Math.abs(direction.x)) {
//       if (direction.z > 0) {
//           primaryDirection = "N";
//       } else {
//           primaryDirection = "S";
//       }
//   } else {
//       if (direction.x > 0) {
//           primaryDirection = "E";
//       } else {
//           primaryDirection = "W";
//       }
//   }

//   // Determine the secondary direction (northeast, northwest, southeast, southwest)
//   var secondaryDirection = "";
//   if (Math.abs(direction.z) > Math.abs(direction.x)) {
//       if (direction.x > 0) {
//           secondaryDirection = "E";
//       } else {
//           secondaryDirection = "W";
//       }
//   } else {
//       if (direction.z > 0) {
//           secondaryDirection = "N";
//       } else {
//           secondaryDirection = "S";
//       }
//   }

//   // Combine primary and secondary directions
//   var finalDirection = primaryDirection;
//   if (secondaryDirection !== "") {
//       finalDirection += "" + secondaryDirection;
//   }

//   return finalDirection;
// }




  setupActionManager() {
    // Register actions for pointer events using ActionManager
    this.jetBox.actionManager = new ActionManager(this.scene);

    // Example: Trigger action on key down
    this.jetBox.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnKeyDownTrigger,
        (evt) => {
          const key = evt.sourceEvent.key.toLowerCase();
          this.handleKeyPress(key);
        }
      )
    );
  }

  setupKeyboardObservables() {
    this.scene.onKeyboardObservable.add((kbInfo) => {
      const key = kbInfo.event.key.toLowerCase();
      this.handleKeyPress(key);
    });
  }

  setupOnScreenControls() {
    document.getElementById('panLeft').addEventListener('pointerdown', () => this.panLeft());
    document.getElementById('panRight').addEventListener('pointerdown', () => this.panRight());
    document.getElementById('panUp').addEventListener('pointerdown', () => this.panUp());
    document.getElementById('panDown').addEventListener('pointerdown', () => this.panDown());
    document.getElementById('panForward').addEventListener('pointerdown', () => this.panForward());
    document.getElementById('panBackward').addEventListener('pointerdown', () => this.panBackward());
    document.getElementById('zoomIn').addEventListener('pointerdown', () => this.zoomIn());
    document.getElementById('zoomOut').addEventListener('pointerdown', () => this.zoomOut());
    document.getElementById('rotateLeft').addEventListener('pointerdown', () => this.rotateLeft());
    document.getElementById('rotateRight').addEventListener('pointerdown', () => this.rotateRight());
    document.getElementById('rotateUp').addEventListener('pointerdown', () => this.rotateUp());
    document.getElementById('rotateDown').addEventListener('pointerdown', () => this.rotateDown());
  }

  handleKeyPress(key) {
    const handler = this.keys[key];
    if (handler) {
      handler();
    }
  }

  panLeft() {
    const direction = this.getCurrentDirection();
    switch (direction) {
      case 'N':
        this.updateDisplacement(0, 0, -0.1);
        break;
      case 'NE':
          this.updateDisplacement(-0.05, 0, -0.05);
          break;
      case 'E':
        this.updateDisplacement(-0.1, 0, 0);
        break;
      case 'SE':
          this.updateDisplacement(-0.05, 0, 0.05);
          break;
      case 'S':
        this.updateDisplacement(0, 0, 0.1);
        break;
      case 'SW':
          this.updateDisplacement(0.05, 0, 0.05);
          break;
      case 'W':
        this.updateDisplacement(0.1, 0, 0);
        break;
      case 'NW':
        this.updateDisplacement(0.05, 0, -0.05);
        break;
      default:
        break;
    }
  }

  panRight() {
    const direction = this.getCurrentDirection();
    switch (direction) {
      case 'N':
        this.updateDisplacement(0, 0, 0.1);
        break;
      case 'NE':
        this.updateDisplacement(0.05, 0, 0.05);
        break;
      case 'E':
        this.updateDisplacement(0.1, 0, 0);
        break;
      case 'SE':
        this.updateDisplacement(0.05, 0, -0.05);
        break;
      case 'S':
        this.updateDisplacement(0, 0, -0.1);
        break;
      case 'SW':
        this.updateDisplacement(-0.05, 0, -0.05);
        break;
      case 'W':
        this.updateDisplacement(-0.1, 0, 0);
        break;
      case 'NW':
        this.updateDisplacement(-0.05, 0, 0.05);
        break;
      default:
        break;
    }
  }

  panUp() {
    const direction = this.getCurrentDirection();
    switch (direction) {
      case 'N':
        this.updateDisplacement(0, -0.1, 0);
        break;
      case 'NE':
          this.updateDisplacement(0, -0.05, -0.05);
          break;
      case 'E':
        this.updateDisplacement(0, 0, -0.1);
        break;
      case 'SE':
        this.updateDisplacement(0, 0.05, -0.05);
        break;
      case 'S':
        this.updateDisplacement(0, 0.1, 0);
        break;
      case 'SW':
          this.updateDisplacement(0, 0.05, 0.05);
        break;
      case 'W':
        this.updateDisplacement(0, 0, 0.1);
        break;
      case 'NW':
        this.updateDisplacement(0, -0.05, 0.05);
        break;
      default:
        break;
    }
  }

  panDown() {
    const direction = this.getCurrentDirection();
    switch (direction) {
      case 'N':
        this.updateDisplacement(0, 0.1, 0);
        break;
      case 'NE':
          this.updateDisplacement(0, 0.05, 0.05);
          break;
      case 'E':
        this.updateDisplacement(0, 0, 0.1);
        break;
      case 'SE':
          this.updateDisplacement(0, -0.05, 0.05);
          break;
      case 'S':
        this.updateDisplacement(0, -0.1, 0);
        break;
      case 'SW':
          this.updateDisplacement(0, -0.05, -0.05);
          break;
      case 'W':
        this.updateDisplacement(0, 0, -0.1);
        break;
      case 'NW':
        this.updateDisplacement(0, 0.05, -0.05);
        break;
      default:
        break;
    }
  }
  
  panForward() {
    const direction = this.getCurrentDirection();
    switch (direction) {
      case 'N':
        this.updateDisplacement(-0.1, 0,  0);
        break;
      case 'NE':
        this.updateDisplacement(-0.05, 0,  0.05);
        break;
      case 'E':
        this.updateDisplacement(0, 0, 0.1);
        break;
      case 'SE':
        this.updateDisplacement(0.05, 0, 0.05);
        break;
      case 'S':
        this.updateDisplacement(0.1, 0, 0);
        break;
      case 'SW':
          this.updateDisplacement(0.05, 0, -0.05);
          break;
      case 'W':
        this.updateDisplacement(0, 0, -0.1);
        break;
      case 'NW':
        this.updateDisplacement(-0.05, 0, -0.05);
        break;
      default:
        break;
    }
  }

  panBackward() {
    const direction = this.getCurrentDirection();
    switch (direction) {
      case 'N':
        this.updateDisplacement(0.1, 0, 0);
        break;
      case 'NE':
        this.updateDisplacement(0.05, 0, -0.05);
        break;
      case 'E':
        this.updateDisplacement(0, 0, -0.1);
        break;
      case 'SE':
        this.updateDisplacement(-0.05, 0, -0.05);
        break;
      case 'S':
        this.updateDisplacement(-0.1, 0, 0);
        break;
      case 'SW':
        this.updateDisplacement(-0.05, 0, 0.05);
        break;
      case 'W':
        this.updateDisplacement(0, 0, 0.1);
        break;
      case 'NW':
          this.updateDisplacement(0.05, 0, 0.05);
          break;
      default:
        break;
    }
  }

  zoomIn() {
    this.scene.activeCamera.radius -= 0.3;
  }

  zoomOut() {
    this.scene.activeCamera.radius += 0.3;
  }

  rotateLeft() {
    this.updateRotation(0, -0.1, 0);
  }

  rotateRight() {
    this.updateRotation(0, 0.1, 0);
  }

  rotateUp() {
    this.updateRotation(-0.1, 0, 0);
  }

  rotateDown() {
    this.updateRotation(0.1, 0, 0);
  }

  updateDisplacement(x, y, z) {
    this.jetBox.position.x += x;
    this.jetBox.position.y += y;
    this.jetBox.position.z += z;
  }

  updateRotation(x, y, z) {
    this.jetBox.rotation.x += x;
    this.jetBox.rotation.y += y;
    this.jetBox.rotation.z += z;
  }
}

export default function BabylonControls(scene) {
    new JetBoxControls(scene);
}
