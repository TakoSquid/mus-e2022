var canvas, engine
var scene, camera
var playerCol, playerSight
let doors;
var selectedTeleportationSphere;
var startPosition, endPosition
var teleportationProgress = 1.0
var kids;

function init(){
	canvas = document.getElementById("renderCanvas") ; 
	engine = new BABYLON.Engine(canvas,true) 
	scene = creerScene() 
	camera = creerCamera("camera", {}, scene)

	playerCol = BABYLON.MeshBuilder.CreateSphere("playerCol",{diameter:1} , scene);
	playerCol.isPickable = false

	kids = new BABYLON.Sound("music", "assets/sounds/kids.mp3", scene, null, {
		loop: false,
		autoplay: false,
		volume: 0.1
	});

	playerCol.parent = camera

	// Kind of raycast
	playerSight = BABYLON.MeshBuilder.CreateBox("box", { width: .01, height: .01, depth: 100 }, scene);

	playerSight.position.z += 50 + 1.1

	let debugMat = new BABYLON.StandardMaterial("debugMat",scene)
	playerSight.material = debugMat

	playerSight.parent = camera

	createLights()

	creerSkyBox(scene)

	peuplerScene()

	BABYLON.SceneLoader.ImportMesh("Body", "assets/blender_export/", "untitled.babylon", scene, function (newMeshes, particleSystems, skeletons) {
		var dude = newMeshes[0];

		dude.rotation.y = Math.PI - Math.PI * 1/8;
		dude.position = new BABYLON.Vector3(2, .1, 1);

		skeletons[0].beginAnimation("waving", true);
	});
	
	var music = new BABYLON.Sound("Music", "assets/sounds/clic.wav", scene, null, {
		loop: false,
		autoplay: false
	});

	scene.debugLayer.show();

	set_FPS_mode(scene, canvas,camera) ; 

	window.addEventListener("resize", function(){engine.resize();}) ; 

	engine.runRenderLoop( function(){

		if(teleportationProgress < 1.0) {
			teleportationProgress += 0.02

			camera.position = BABYLON.Vector3.Lerp(startPosition, endPosition, smoothStep(teleportationProgress))

			if (teleportationProgress >= 1.0) {
				kids.play();
			}
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
	var materiauGrass = creerMateriauSimple("mat-grass", {texture:"assets/textures/grass.jpg", uScale:15, vScale:15}, scene);
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

	let prefix = "assets/textures/paintings/sublimepoulpe/";

	// Oui oui je sais, un xml et c'était plié, mais flemme

	let collec = [
		painting("test1", prefix + "boo.png", 1920, 1080, "Cadeau pour un artiste" + " - " +"Decembre 2021"),
		painting("test2", prefix + "heyna.png", 1440, 1080, "Commande d'un client" + " - " +"Janvier 2022"),
		painting("test3", prefix + "paper.png", 1280, 960, "Commande d'un client" + " - " +"Février 2022"),
		painting("test4", prefix + "raiden.png", 717, 920, "Commande d'un client" + " - " +"Mars 2022"),
		painting("test5", prefix + "seoska.png", 720, 720, "Cadeau pour un artiste" + " - " +"Avril 2022"),
		painting("test6", prefix + "stanrenartr.png", 1440, 1080, "Commande d'un client" + " - " + "Mai 2022"),
		painting("test7", prefix + "tako.png", 637, 479, "Premier écran titre" + " -" + "Octobre 2021"),
		painting("test8", prefix + "toco.png", 1440, 1080, "Commande d'un client" + " - " +"Novembre 2022"),
	]

	let circle1 = circlePosters("first circle", { collection: collec, radius: 4.75, width:3, startAngle:Math.PI/4.0, totalAngle:2.0*Math.PI - 2.0*Math.PI/4.0}, scene);
	circle1.position.z -= 7.5;
	circle1.position.y += .5;
	circle1.rotation.y -= Math.PI / 2;

	prefix = "assets/textures/paintings/zetterstrand/";

	collec = [
		painting("zetterstrand1", prefix + "Bathers.jpg", 1920, 1912, "Bathers. 20x20cm. Oil on canvas (2007)"),
		painting("zetterstrand2", prefix + "wanderer.jpg", 1920, 1699, "Wanderer. 33x37cm. oil on canvas (2008)"),
		painting("zetterstrand3", prefix + "moonlight-installation.jpg", 1920, 1912, "Moonlight installation. 64x64cm. Oil on canvas. (2009)"),
		painting("zetterstrand4", prefix + "pwned-landscape.jpg", 1920, 1381, "Pwned Landscape. 250x180cm. Oil on canvas (2010)"),
		painting("zetterstrand5", prefix + "the_box.jpg", 1918, 1920, "The Box. 99x99cm. Oil on canvas (2011)"),
		painting("zetterstrand6", prefix + "hue_of_resolution.jpg", 1920, 1686, "Hue of resolution, 43x49cm, Oil on canvas (2012)"),
		painting("zetterstrand7", prefix + "winter-ruins.jpg", 1920, 1502, "Winter Ruins. 157×200 cm. Oil on canvas (2013)"),
		painting("zetterstrand8", prefix + "Early-Morning-Delft.jpg", 1697, 1920, "Early Morning, Delft. 49x43cm. Oil on canvas (2014)"),
	]

	let circle2 = circlePosters("second circle", { collection: collec, radius: 4.75, width:3, startAngle:Math.PI/4.0, totalAngle:2.0*Math.PI - 2.0*Math.PI/4.0}, scene);
	circle2.position.x -= 10;
	circle2.position.z -= 7.5;
	circle2.position.y += .5;
	circle2.rotation.y -= Math.PI / 2;

	prefix = "assets/textures/paintings/mackle/";

	collec = [
		painting("mackle1", prefix + "Cherry.jpg", 1920, 1080, "Cherry - Niklas Mäckle"),
		painting("mackle2", prefix + "Dissonance.jpg", 1920, 960, "Dissonance - Niklas Mäckle"),
		painting("mackle3", prefix + "Neuschwanstein Castle.jpg", 1920, 835, "Neuschwanstein Castle.jpg - Niklas Mäckle"),
		painting("mackle4", prefix + "North Bridge - Edinburgh.jpg", 1920, 1080, "North Bridge - Edinburgh - Niklas Mäckle"),
		painting("mackle5", prefix + "untitled fortress thing.jpg", 1920, 835, "untitled fortress thing - Niklas Mäckle"),
		painting("mackle6", prefix + "untitled.jpg", 1920, 1080, "untitled - Niklas Mäckle"),
		painting("mackle7", prefix + "Visions of a Future World - Part 1.jpg", 1200, 1800, "Visions of a Future World - Part 1 - Niklas Mäckle"),
		painting("mackle8", prefix + "Winter's First Snow.jpg", 1920, 835, "Winter's First Snow - Niklas Mäckle"),
	]

	let circle3 = circlePosters("third circle", { collection: collec, radius: 4.75, width:3, startAngle:Math.PI/4.0, totalAngle:2.0*Math.PI - 2.0*Math.PI/4.0}, scene);
	circle3.position.x += 10;
	circle3.position.z -= 7.5;
	circle3.position.y += .5;
	circle3.rotation.y -= Math.PI / 2;

	let rembarde_gauche = creerRembarde("rembarde gauche", {materiau:materiauBois}, scene);
	rembarde_gauche.position.x += 2
	rembarde_gauche.position.y += 5
	rembarde_gauche.rotation.y = Math.PI / 2;

	let rembarde_droite = creerRembarde("rembarde gauche", {materiau:materiauBois}, scene);
	rembarde_droite.position.x -= 2
	rembarde_droite.position.y += 5
	rembarde_droite.rotation.y = -Math.PI / 2;


	// rembarde_gauche.position.y += 0;

	//scene.debugLayer.show();

	// var light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 1, 0), new BABYLON.Vector3(0, -1, 0), Math.PI / 3, 0, scene);
}

var isLocked = false ; 

function set_FPS_mode(scene, canvas, camera){

	scene.onPointerDown = function (evt) {

		if (!isLocked) {
			canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock || false;
			if (canvas.requestPointerLock) {
				canvas.requestPointerLock();
			}
		}
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

		get_clic().play();
		teleportationProgress = 0.0
		startPosition = camera.position
		endPosition = selectedTeleportationSphere
	}
})

init();
