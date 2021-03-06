import { B3DMLoader } from '../src/index.js';
import {
	Scene,
	DirectionalLight,
	AmbientLight,
	WebGLRenderer,
	PerspectiveCamera,
	Box3,
	OrthographicCamera,
	sRGBEncoding,
	Group,
	PCFSoftShadowMap,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';

let camera, controls, scene, renderer, tiles, orthoCamera;
let offsetParent, box, dirLight;
let stats;

const params = {

};

init();
animate();

function init() {

	scene = new Scene();

	// primary camera view
	renderer = new WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x151c1f );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFSoftShadowMap;
	renderer.outputEncoding = sRGBEncoding;

	document.body.appendChild( renderer.domElement );

	camera = new PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 4000 );
	camera.position.set( 400, 400, 400 );

	orthoCamera = new OrthographicCamera();

	// controls
	controls = new OrbitControls( camera, renderer.domElement );
	controls.screenSpacePanning = false;
	controls.minDistance = 1;
	controls.maxDistance = 2000;

	// lights
	dirLight = new DirectionalLight( 0xffffff, 1.25 );
	dirLight.position.set( 1, 2, 3 ).multiplyScalar( 40 );
	dirLight.castShadow = true;
	dirLight.shadow.bias = - 0.01;
	dirLight.shadow.mapSize.setScalar( 2048 );

	const shadowCam = dirLight.shadow.camera;
	shadowCam.left = - 200;
	shadowCam.bottom = - 200;
	shadowCam.right = 200;
	shadowCam.top = 200;
	shadowCam.updateProjectionMatrix();

	scene.add( dirLight );

	const ambLight = new AmbientLight( 0xffffff, 0.05 );
	scene.add( ambLight );

	box = new Box3();

	new B3DMLoader()
		.load( 'https://raw.githubusercontent.com/CesiumGS/3d-tiles-samples/master/tilesets/TilesetWithRequestVolume/city/lr.b3dm' )
		.then( res => {

			console.log( res );
			scene.add( res.scene );

		} );

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

	// GUI
	const gui = new dat.GUI();
	gui.width = 300;
	gui.open();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.updateProjectionMatrix();

	updateOrthoCamera();

}

function updateOrthoCamera() {

	orthoCamera.position.copy( camera.position );
	orthoCamera.rotation.copy( camera.rotation );

	const scale = camera.position.distanceTo( controls.target ) / 2.0;
	let aspect = window.innerWidth / window.innerHeight;
	orthoCamera.left = - aspect * scale;
	orthoCamera.right = aspect * scale;
	orthoCamera.bottom = - scale;
	orthoCamera.top = scale;
	orthoCamera.near = camera.near;
	orthoCamera.far = camera.far;
	orthoCamera.updateProjectionMatrix();

}

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	updateOrthoCamera();

	renderer.render( scene, params.orthographic ? orthoCamera : camera );

}
