import * as THREE from 'three';
import * as player from '/Player/player.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as ui from '/UI/start_screen.js'
import * as minimap from '/UI/minimap.js'
import * as bosses from '/Bosses/bosses.js';
import * as obstacles from '/Obstacles/obstacles.js';
import * as music from '/Music/musicController.js';
import * as particle from '/Player/particleEffect.js';
import { disableButtons } from "/UI/start_screen.js";
//
//game below
//

const scene = new THREE.Scene();
//sets up sound, sound needs to be set up before the world is setup as it runs during the login page
music.setInGameSound()

//sets up camera
var camera;
const firstCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
firstCamera.position.z = 30;
firstCamera.position.y = 2;
camera = firstCamera;

const secondCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//sets up renderer/screen
secondCamera.position.z = 25;
secondCamera.position.x = -30;
secondCamera.position.y = 5;
secondCamera.rotateY(-Math.PI / 5);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Add orbit control
var controls = new OrbitControls(camera, renderer.domElement);

const ambientLighting = new THREE.AmbientLight("white", 6);

var level1 = false;
var level2 = false;
var level3 = false;
//object setup in world
function worldLevelOne() {
	level1 = true;
	scene.add(ambientLighting);
	player.addPlayerToScene(scene);
	minimap.addMiniMapToScene(scene);
	obstacles.animateObstacles(renderer, camera, scene);
	//uncomment line below to view boss (position currently incorrect and ambient light to bright for texture)
	bosses.bossTwo(camera, scene, renderer);
}


// Define a variable to track the animation state
export let isPaused = false;

// Function to handle the animation
//
//
//
//////
//
//
///
//
//
///
//
//
///
//
//
///
//
// Create an array to hold the stars
var starsArray = [];

var starStartZ = -10;
var starStartY = 80;
var starStartX = 80;
// Function to create a star with random position and speed
function createStar() {
	var starGeometry = new THREE.BufferGeometry();
	var positions = new Float32Array(2 * 3); // Two points to create a line

	positions[0] = 0;
	positions[1] = 0;
	positions[2] = 10;

	positions[3] = 0;
	positions[4] = 0;
	positions[5] = -1; // Extend the line in the negative z-direction

	starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

	// Randomly select blue or purple color
	var color = Math.random() > 0.5 ? 0x9500ff: 0x04d9ff;

	var starMaterial = new THREE.LineBasicMaterial({ color: color ,linewidth: 10});
	var star = new THREE.Line(starGeometry, starMaterial);
	// Randomize the star's position
	star.position.x = (Math.random() - 0.5) * starStartX;
	star.position.y = (Math.random() - 0.5) * starStartY;
	star.position.z = starStartZ - Math.random() * 10; // Start behind the camera

	// Randomize the star's speed
	star.speed = 0.01 + Math.random() * 0.1;

	scene.add(star);
	starsArray.push(star);
}

// Create a number of stars
for (var i = 0; i < 700; i++) {
	createStar();
}

// Create ambient light with a color similar to the starfield
var ambientLight = new THREE.AmbientLight(0x101010); // Adjust the color as needed
scene.add(ambientLight);

// Create a directional light
var directionalLight = new THREE.DirectionalLight(0xffffff, 10); // Adjust the color and intensity as needed
directionalLight.position.set(0, 1, 0); // Set the initial position
scene.add(directionalLight);

// Function to animate the directional light's position
var lightRotation = 0;

function animateDirectionalLight() {
	lightRotation += 0.1;
	var radius = 50;
	directionalLight.position.x = radius * Math.cos(lightRotation);
	directionalLight.position.y = radius * Math.sin(lightRotation);
	directionalLight.position.z = 30; // Adjust the Z position as needed

	requestAnimationFrame(animateDirectionalLight);
}

animateDirectionalLight();

//
//
//
//
//////
//
//
///
//
//
///
//
//
//
//
//
//
//
//
function animate() {
	if (!isPaused) {
		requestAnimationFrame(animate);

		// Your animation code here
		player.keyboardMoveObject(scene.getObjectByName("player"));
		particle.updateParticleSystem();

		// Move stars towards the camera
		for (var i = 0; i < starsArray.length; i++) {
			var star = starsArray[i];
			star.position.z += star.speed;

			// Reset star position to create a loop
			if (star.position.z > 0) {
				star.position.z = starStartZ * 5 - Math.random() * 10;
			}
		}


		if (scene.getObjectByName('minimap_icon') != null) {
			if (scene.getObjectByName('minimap_icon').position.x > 20) {

				//TODO: add function to show win screen, look at UI start_screen.js to see how to achieve this.
				ui.enableWinScreen();  //it shows while game is in play?
			} else {
				scene.getObjectByName('minimap_icon').position.x += 0.005;
				//player.onDeath(scene);
				//ui.enableLoseScreen();
			}
		}

		renderer.render(scene, camera);
	}

}

// Function to pause the animation
function pauseAnimation() {
	isPaused = true;
	ui.enablePauseScreen();
}

// Function to resume the animation
function resumeAnimation() {
	if (isPaused) {
		isPaused = false;
		ui.disableButtons();
		animate();
	}
}

// Listen for the space key press event to pause or resume game
document.addEventListener('keydown', function(event) {
	if (event.key === ' ') { // ' ' represents the space key
		if (isPaused) {
			resumeAnimation();
		} else {
			pauseAnimation();
		}
	}
});
document.addEventListener('keydown', function(event) {

	if (event.keyCode == 49) {
		camera = firstCamera;
	}
	if (event.keyCode == 50) {
		camera = secondCamera;
	}
});

//music.enableSound();

// Define a function to clear the scene
function clearScene() {
	// Remove all objects from the scene
	while (scene.children.length > 0) {
		scene.remove(scene.children[0]);
	}

}

//spawn level depending on button click 
animate();
ui.levelOneButton.onclick = function() {

	/*sound can only play if user clicks somewhere on the screen, 
	 * this is a design by google/firefox, this plays the song in case the user never clicked anywhere on screen*/
	particle.createNewParticleSystem(0, 0, 0, scene);
	music.enableSound();
	ui.disableStartScreen();
	worldLevelOne();
	animate();
}

ui.levelTwoButton.onclick = function() {
	level2 = true;
	ui.disableStartScreen();
	worldLevelOne();
	animate();
}

ui.levelThreeButton.onclick = function() {
	level3 = true;
	ui.disableStartScreen();
	worldLevelOne();
	animate();
}

ui.nextButton.onclick = function() {
	clearScene();
	disableButtons();
	if (level1) {
		level1 = false;
		worldLevelOne();   //change to level2
		animate();
	}
	if (level2) {
		level2 = false;
		worldLevelOne(); // change to level3
		animate();
	}


}

ui.resumeButton.onclick = function() {
	//TODO: resume game on keyboard pause
}

ui.returnButton.onclick = function() {

	window.location.reload(); // This will reload the page
}

ui.restartButton.onclick = function() {
	clearScene();
	disableButtons();
	if (level1) {
		worldLevelOne();
	}
	if (level2) {
		worldLevelOne(); // change to level2
	}
	if (level3) {
		worldLevelOne(); // change to level3
	}
}




