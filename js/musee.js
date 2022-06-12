var canvas, engine
var scene, camera
var playerCol, playerSight
let doors;
var selectedTeleportationSphere;
var startPosition, endPosition
var teleportationProgress = 1.0

function init(){
	canvas = document.getElementById("renderCanvas") ; 
	engine = new BABYLON.Engine(canvas,true) 
	scene  = creerScene() 
	camera = creerCamera("camera",{}, scene) 

	playerCol = BABYLON.MeshBuilder.CreateSphere("playerCol",{diameter:1} , scene);
	playerCol.isPickable = false

	playerCol.parent = camera

	// Kind of raycast
	playerSight = BABYLON.MeshBuilder.CreateBox("box", {width: .01	, height: .01, depth: 100 }, scene);
	playerSight.position.z += 50 + 1.1

	let debugMat = new BABYLON.StandardMaterial("debugMat",scene)
	playerSight.material = debugMat

	playerSight.parent = camera

	createLights()

	creerSkyBox(scene)

	peuplerScene()

	set_FPS_mode(scene, canvas,camera) ; 

	window.addEventListener("resize", function(){engine.resize();}) ; 

	engine.runRenderLoop( function(){

		if(teleportationProgress < 1.0) {
			teleportationProgress += 0.02

			camera.position = BABYLON.Vector3.Lerp(startPosition, endPosition, smoothStep(teleportationProgress))
		}

		scene.render();
	} ) ; 
}

function smoothStep(x) 
{
	return x * x * (3 - 2 * x)
}


function createLights(){
	var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(5,5,5), scene) ; 
}

function peuplerScene(){

	var materiauRouge = creerMateriauSimple("rouge",{couleur:new BABYLON.Color3(0.8,0.1,0.1)},scene) ;
	var materiauCloison = creerMateriauSimple("mat-cloison",{texture:"assets/textures/wall.png", uScale:2}, scene) ; 
	var materiauSol = creerMateriauSimple("mat-sol", {texture:"assets/textures/floor.png", uScale:2, vScale:2}, scene);
	var materiauGrass = creerMateriauSimple("mat-grass", {texture:"assets/textures/grass.png", uScale:15, vScale:15}, scene);
	var materiauBois = creerMateriauSimple("mat-wood", { texture: "assets/textures/stairs.jpg", uScale: 2.0 / 7.0, vScale: 1 }, scene);
	
	let glassMat = new BABYLON.StandardMaterial("transp", scene)
	glassMat.alpha = 0.5
	glassMat.diffuseColor = new BABYLON.Color3(230/255, 1, 252/255)
	

	var sol = creerSol("sol",{materiau:materiauGrass},scene) ;


	var sous = creerSol("sol",{largeur:30, profondeur:30, materiau:materiauSol}, scene);
	sous.position.y += .05

	var cloisonSud = creerCloison("cloisonSud", {hauteur:10, largeur:30, materiau:materiauCloison}, scene)
	cloisonSud.position.z += 15
	var cloisonSudCSG = BABYLON.CSG.FromMesh(scene.getMeshByName("cloisonSud"))

	var cloisonNord = creerCloison("cloisonNord", {hauteur:10, largeur:30, materiau:materiauCloison}, scene)
	cloisonNord.position.z -= 15

	var cloisonEst = creerCloison("cloisonEst", {hauteur:10, largeur:30, materiau:materiauCloison}, scene)
	cloisonEst.position.x += 15
	cloisonEst.rotation.y = Math.PI/2

	var cloisonOuest = creerCloison("cloisonOuest", {hauteur:10, largeur:30, materiau:materiauCloison}, scene)
	cloisonOuest.position.x -= 15
	cloisonOuest.rotation.y = Math.PI/2


	// Cloison du milieu
	var cloisonMilieu = creerCloison("cloisonMilieu", {hauteur:5, largeur:30}, scene)
	var cloisonMilieuCSG = BABYLON.CSG.FromMesh(scene.getMeshByName("cloisonMilieu"))

	// Patron de découpe
	var porteCutout = BABYLON.Mesh.CreateBox("porteCutout", 1, scene);
	porteCutout.scaling.y = 4
	porteCutout.position.y = 2
	porteCutout.scaling.x = 3

	// On retire la matière
	var porteCutoutCSG = BABYLON.CSG.FromMesh(scene.getMeshByName("porteCutout"))
	cloisonMilieuCSG = cloisonMilieuCSG.subtract(porteCutoutCSG)
	
	// On dépace...
	porteCutout.position.x += 10
	porteCutoutCSG = BABYLON.CSG.FromMesh(scene.getMeshByName("porteCutout"))
	// ... On retire la matière
	cloisonMilieuCSG = cloisonMilieuCSG.subtract(porteCutoutCSG)
	cloisonMilieuCSG = cloisonMilieuCSG.subtract(porteCutoutCSG)

	porteCutout.position.x -= 20
	porteCutoutCSG = BABYLON.CSG.FromMesh(scene.getMeshByName("porteCutout"))
	cloisonMilieuCSG = cloisonMilieuCSG.subtract(porteCutoutCSG)
	cloisonMilieuCSG = cloisonMilieuCSG.subtract(porteCutoutCSG)

	// porteCutout.dispose()
	cloisonMilieu.dispose()
	cloisonMilieu = cloisonMilieuCSG.toMesh("csg", materiauCloison, scene)

	cloisonMilieu.checkCollisions = true

	var bigWindowCutout = BABYLON.Mesh.CreateBox("bigWindowCutout", 1, scene);
	bigWindowCutout.position.z = 15;
	bigWindowCutout.position.y = 7;
	bigWindowCutout.scaling.x = 27;
	bigWindowCutout.scaling.y = 4;
	var bigWindowCutoutCSG = BABYLON.CSG.FromMesh(scene.getMeshByName("bigWindowCutout"))
	cloisonSudCSG = cloisonSudCSG.subtract(bigWindowCutoutCSG)

	porteCutout.position.x = 0;
	porteCutout.position.z = 15;
	porteCutoutCSG = BABYLON.CSG.FromMesh(scene.getMeshByName("porteCutout"));
	cloisonSudCSG = cloisonSudCSG.subtract(porteCutoutCSG)

	bigWindowCutout.dispose();
	porteCutout.dispose();
	cloisonSud.dispose()
	cloisonSud = cloisonSudCSG.toMesh("csg", materiauCloison, scene)
	cloisonSud.position.z += 15
	cloisonSud.checkCollisions = true

	var bigWindow = BABYLON.Mesh.CreateBox("bigWindow", 1, scene);
	bigWindow.material = glassMat;
	bigWindow.position.z = 15;
	bigWindow.position.y = 7;
	bigWindow.scaling.x = 27;
	bigWindow.scaling.y = 4;
	bigWindow.scaling.z = .2;

	let middleDoor = creerPorte("middleDoor", {}, scene)

	let leftDoor = creerPorte("leftDoor", {}, scene)
	leftDoor.position.x += 10

	let rightDoor = creerPorte("rightDoor", {}, scene)
	rightDoor.position.x -= 10

	let entryDoor = creerPorte("entryDoor", {}, scene);
	entryDoor.position.z = 15;

	var cloisonGauche = creerCloison("cloisonGauche", {hauteur:5, largeur:15, materiau:materiauCloison}, scene)
	cloisonGauche.position.z -= 7.5
	cloisonGauche.position.x += 5
	cloisonGauche.rotation.y = Math.PI/2

	var cloisonDroite = creerCloison("cloisonDroite", {hauteur:5, largeur:15, materiau:materiauCloison}, scene)
	cloisonDroite.position.z -= 7.5
	cloisonDroite.position.x -= 5
	cloisonDroite.rotation.y = Math.PI/2

	var solMezzanine = creerCloison("solMezzanine", {largeur:30,hauteur:15, materiau:materiauSol}, scene)
	solMezzanine.position.y += 5
	solMezzanine.position.z -= 15
	solMezzanine.rotation.x = Math.PI/2

	var toit = creerCloison("toit", {largeur:30,hauteur:30, materiau:materiauSol}, scene)
	toit.position.y += 10
	toit.position.z -= 15
	toit.rotation.x = Math.PI/2

	var escalierGauche = creerEscalier("escalierGauche", {hauteur:5, largeur:3, profondeur:8, stepsCount:20, materiau:materiauBois}, scene)
	escalierGauche.position.x += 15 - 1.5
	escalierGauche.position.z += 8

	var escalierDroite = creerEscalier("escalierDroite", {hauteur:5, largeur:3, profondeur:8, stepsCount:20, materiau:materiauBois}, scene)
	escalierDroite.position.x -= 15 - 1.5
	escalierDroite.position.z += 8


	// Lights
	var proxyLight = creerLumiereProximite("middleLight", {diffuse : new BABYLON.Color3(1.0, 0.6, 0.6)}, scene)
	proxyLight.position.z -= 7.5

	var proxyLight = creerLumiereProximite("middleLight", {diffuse : new BABYLON.Color3(0.6, 1.0, 0.6)}, scene)
	proxyLight.position.z -= 7.5
	proxyLight.position.x += 10

	var proxyLight = creerLumiereProximite("middleLight", {diffuse : new BABYLON.Color3(0.6, 0.6, 1.0)}, scene)
	proxyLight.position.z -= 7.5
	proxyLight.position.x -= 10


	// Tele orbs
	var tele = creerTeleSphere("teleSphere", {}, scene)

	tele.position.z += 10
	tele.position.y += 1.5

	var tele2 = creerTeleSphere("teleSphere", {}, scene)
	tele2.position.y += 5 + 1.5
	tele2.position.z -= 1

	function painting(name = "", path = "", width = 0, height = 0, description = "") {
		return {"name":name, "path":path, "width":width, "height":height, "description": description}
	}

	let prefix = "assets/textures/paintings/";

	let collec = [
		painting("test1", prefix + "boo.png", 1920, 1080, "Decembre 2021"),
		painting("test2", prefix + "heyna.png", 1440, 1080, "Janvier 2022"),
		painting("test3", prefix + "paper.png", 1280, 960, "Février 2022"),
		painting("test4", prefix + "raiden.png", 717, 920, "Mars 2022"),
		painting("test5", prefix + "seoska.png", 720, 720, "Avril 2022"),
		painting("test6", prefix + "stanrenartr.png", 1440, 1080, "Mai 2022"),
		painting("test7", prefix + "tako.png", 637, 479, "Octobre 2021"),
		painting("test8", prefix + "toco.png", 1440, 1080, "Novembre 2022"),
	]

	let circle1 = circlePosters("first circle", { collection: collec, radius: 4.75, width:3, startAngle:Math.PI/4.0, totalAngle:2.0*Math.PI - 2.0*Math.PI/4.0}, scene);
	circle1.position.z -= 7.5;
	circle1.position.y += .5;
	circle1.rotation.y -= Math.PI / 2;

	// BABYLON.SceneLoader.Append("assets/blender_export/", "untitled.babylon", scene, function (raindenScene) {
	// 	raindenScene.debugLayer.show();

	// 	skull = raindenScene.skeletons[0];
	// 	console.log(skull.bones[0]);

	// 	skull.beginAnimation("hello", true);
	// });

	BABYLON.SceneLoader.ImportMesh("Body", "assets/blender_export/", "untitled.babylon", scene, function (newMeshes, particleSystems, skeletons) {
		var dude = newMeshes[0];

		dude.rotation.y = Math.PI - Math.PI * 1/8;
		dude.position = new BABYLON.Vector3(2, .1, 1);

		skeletons[0].beginAnimation("waving", true);
	});
}

var isLocked = false ; 

function set_FPS_mode(scene, canvas, camera){

	// On click event, request pointer lock
	scene.onPointerDown = function (evt) {

		//true/false check if we're locked, faster than checking pointerlock on each single click.
		if (!isLocked) {
			canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock || false;
			if (canvas.requestPointerLock) {
				canvas.requestPointerLock();
			}
		}

		//continue with shooting requests or whatever :P
		//evt === 0 (left mouse click)
		//evt === 1 (mouse wheel click (not scrolling))
		//evt === 2 (right mouse click)
	};

	// Event listener when the pointerlock is updated (or removed by pressing ESC for example).
	var pointerlockchange = function () {
		var controlEnabled = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || false;

		// If the user is already locked
		if (!controlEnabled) {
			camera.detachControl(canvas);
			isLocked = false;
		} else {
			camera.attachControl(canvas);
			setTimeout(() => {
				isLocked = true;
			}, 100);

		}
	};

	// Attach events to the document
	document.addEventListener("pointerlockchange", pointerlockchange, false);
	document.addEventListener("mspointerlockchange", pointerlockchange, false);
	document.addEventListener("mozpointerlockchange", pointerlockchange, false);
	document.addEventListener("webkitpointerlockchange", pointerlockchange, false);

}

window.addEventListener ("keydown", function(event){

	if(event.keyCode == 69)
	{
		console.log(camera.position)
	}
}) ;

window.addEventListener ("click", function(){
	if(selectedTeleportationSphere != null && teleportationProgress >= 1.0) {

		teleportationProgress = 0.0
		startPosition = camera.position
		endPosition = selectedTeleportationSphere
	}
})

init();
