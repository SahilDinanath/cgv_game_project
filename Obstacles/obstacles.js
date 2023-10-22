import { playerBoundingBox } from '/Player/player.js';
import { obstacles } from '/Obstacles/obstacleCreation.js';
import { obstaclesBoundingBoxes } from '/Obstacles/obstacleCreation.js';
import { createObstacle } from '/Obstacles/obstacleCreation.js';
import { onDeath } from '/Player/player.js';
import { isPaused } from '/main.js';

//where obstacle should be generated
const MIN_Z = -360;
//where obstacle should be removed
const MAX_Z = 25;

export let collisionDetected = false;

function updateGroupBoundingBox(obstacle, index) {
  let i = 0;
  obstacle.traverse(function(child) {
    if (child.isMesh && child.geometry) {
      //child.geometry.computeBoundingBox();
      obstaclesBoundingBoxes[(index*3) + i].setFromObject(child);
      i++;
    }
  });
}

function checkCollision() {
  for(let j = 0; j < 3; j++){
    if(obstaclesBoundingBoxes[j].intersectsBox(playerBoundingBox)){
      return true;
    }
  }
}

export function animateObstacles(renderer, camera, scene, speed) {
  function animate() {
    if(!isPaused){
      for (let i = 0; i < obstacles.length; i++) {
        updateGroupBoundingBox(obstacles[i], i);
  
        if (obstacles[0].position.z > -15) {
          if(checkCollision()){
            console.log("Collision?");
            collisionDetected = true;
            onDeath(scene);
            return;
          }
        }
  
        if(obstacles[i].position.z > MAX_Z){
          scene.remove(obstacles[i]);
          obstacles.splice(i, 1);
          obstaclesBoundingBoxes.splice(i*3, 3);
          i--;
        }
      }
  
      if(obstacles[0].position.z == -60){
        createObstacle(scene, MIN_Z);
      }
  
      for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].position.z += speed;
      }
  
      renderer.render(scene, camera);
    
    }
    requestAnimationFrame(animate);
  }

  createObstacle(scene, MIN_Z);
  animate();
}
