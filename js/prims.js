

function creerScene(){
	var scn = new BABYLON.Scene(engine) ;
	scn.gravity = new BABYLON.Vector3(0,-.02,0)
	scn.collisionsEnabled = true ; 
	return scn ;
}


function creerCamera(name,options,scn){
	// console.log("creation camera");
	// Création de la caméra
	// =====================

	camera = new BABYLON.UniversalCamera(name,new BABYLON.Vector3(0,1.5,5),scn) ;
	camera.setTarget(new BABYLON.Vector3(0, 1, 0)) ; 

	camera.keysUp = [90,38];
	camera.keysDown = [40,83];
	camera.keysLeft = [81,37];
	camera.keysRight = [68,39];
	camera.attachControl(canvas) ;
	camera.inertia = 0.01;
	camera.angularSensibility  = 1000;

	camera.applyGravity = true ; 
	camera.checkCollisions = true ;
	camera.ellipsoid = new BABYLON.Vector3(1,0.7,1) ; 

	camera.attachControl(canvas, false) ; 

	// let animation = new BABYLON.Animation("camera_animation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)

	// let keys = []
	// keys.push({frame:0, value:new BABYLON.Vector3(0, 0, 0)})
	// keys.push({frame:60, value:new BABYLON.Vector3(5, 0, 0)})

	// animation.setKeys(keys)

	// camera.animations.push(animation)

	// scn.beginAnimation(camera, 0, 120, true)

	return camera
}

function creerSkyBox(scn) {
	var skybox = BABYLON.Mesh.CreateBox("ciel",500,scn) ; 
	var skyboxMat = new BABYLON.StandardMaterial("skybox_m", scn) ; 
	skyboxMat.backFaceCulling = false ; 
	skyboxMat.disableLighting = true ;
	skyboxMat.diffuseColor = new BABYLON.Color3(0,0,0) ; 
	skyboxMat.specularColor = new BABYLON.Color3(0,0,0) ; 
	skyboxMat.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/skybox",scn) ; 
	skyboxMat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE ; 
			
	skybox.material = skyboxMat ; 
	skybox.infiniteDistance = true ;	
}



function creerSol(name,options,scn){
	let larg     = options.largeur || 300 ;   
	let prof     = options.profondeur || larg ;   
	let materiau = options.materiau || new BABYLON.StandardMaterial("blanc",scene) ;

	let sol = BABYLON.Mesh.CreateGround(name,larg,prof,2.0,scn) ;

	sol.material = materiau ;
	// sol.material.diffuseColor  = new BABYLON.Color3(1.0,0,0) ;
	// sol.material.diffuseTexture = new BABYLON.Texture('./assets/textures/grass.png',scene);
	// sol.material.specularTexture = new BABYLON.Texture('./assets/textures/grass.png',scene);
	// sol.material.emissiveTexture = new BABYLON.Texture('./assets/textures/grass.png',scene);
	// sol.material.ambientTexture = new BABYLON.Texture('./assets/textures/grass.png',scene);
	// sol.material.diffuseTexture.uScale = 10.0;
	// sol.material.diffuseTexture.vScale = 10.0;
	// sol.material.specularTexture.uScale = 10.0;
	// sol.material.specularTexture.vScale = 10.0;
	// sol.material.emissiveTexture.uScale = 10.0;
	// sol.material.emissiveTexture.vScale = 10.0;
	// sol.material.ambientTexture.uScale = 10.0;
	// sol.material.ambientTexture.vScale = 10.0;
	sol.receiveShadows = true;
	sol.metadata = {"type": 'ground'}

	sol.checkCollisions = true
	return sol
}

function creerMateriauSimple(nom,options,scn){
	let couleur = options.couleur || null ; 
	let texture = options.texture || null ; 
	let uScale  = options.uScale  || 1.0 ; 
	let vScale  = options.vScale  || 1.0 ; 

	let materiau = new BABYLON.StandardMaterial(nom,scn) ; 
	if(couleur != null) materiau.diffuseColor = couleur ;

	materiau.specularColor =  new BABYLON.Color3(.3,.3,.3)
	
	if(texture!= null){
		materiau.diffuseTexture = new BABYLON.Texture(texture,scn) ; 
		materiau.diffuseTexture.uScale = uScale ; 
		materiau.diffuseTexture.vScale = vScale ; 
	}
	return materiau ; 
}


function creerSphere(nom,opts,scn){

	let options  = opts || {} ; 
	let diametre = options.diametre || 1.0 ; 

	let sph = BABYLON.Mesh.CreateSphere(nom,16,diametre,scn) ;
	sph.material              = new BABYLON.StandardMaterial("blanc",scene) ;
	sph.material.diffuseColor  = new BABYLON.Color3(1.0,1.0,1.0) ;
	sph.receiveShadows = true;

	sph.metadata = {"type": 'sphere'}
	return sph;

}

function creerPoster(nom,opts,scn){

	let options = opts || {} ; 
	let hauteur = options["hauteur"] || 1.0 ; 
	let largeur = options["largeur"] || 1.0 ; 	
	let textureName = options["tableau"] || ""; 

	var group = new BABYLON.TransformNode("group-"+nom)
	var tableau1 = BABYLON.MeshBuilder.CreatePlane("tableau-" + nom, {width:largeur,height:hauteur}, scn);
	tableau1.parent = group ; 
	tableau1.position.y = hauteur/2.0 ; 

	var mat = new BABYLON.StandardMaterial("tex-tableau-" + nom, scn);
	let texture = new BABYLON.Texture(textureName, scn);
	mat.diffuseTexture = texture;
	console.log(texture.getSize());
	tableau1.material = mat;

	tableau1.receiveShadows = true;

	return group ;
}

function circlePosters(nom, opts, scn) {

	let options = opts || {};
	let collection = options["collection"] || [];
	let radius = options["radius"] || 1;
	let width = options["width"] || 1;
	let startAngle = options["startAngle"] || 0;
	let totalAngle = options["totalAngle"] || 2 * 3.14;

	let group = new BABYLON.TransformNode("group-" + nom);

	let zone = options.zone || creerSphere("zone", { diametre: 6 }, scn)
	zone.parent = group;

	for (let i = 0; i < collection.length; i++) {

		t = collection[i];
		l = width;
		h = l * t.height / t.width

		let tableau = creerPoster(t.name, { tableau: t.path, largeur:l, hauteur:h}, scn);
		tableau.position.x = Math.cos(startAngle + i * totalAngle / (collection.length-1)) * radius;
		tableau.position.z = Math.sin(startAngle + i * totalAngle / (collection.length-1)) * radius;
		tableau.lookAt(new BABYLON.Vector3(0, 0, 0));
		tableau.rotation.y += 3.14;
		tableau.parent = group;
	}

	return group;
}

function creerCloison(nom,opts,scn){
	let options   = opts || {} ; 
	let hauteur   = options.hauteur || 3.0 ; 
	let largeur   = options.largeur || 5.0 ; 
	let epaisseur = options.epaisseur || 0.1 ;
	let materiau   = options.materiau || new BABYLON.StandardMaterial("materiau-pos"+nom,scn); 

    let groupe = new BABYLON.TransformNode("groupe-"+nom) ; 

	let cloison = BABYLON.MeshBuilder.CreateBox(nom,{width:largeur,height:hauteur,depth:epaisseur},scn) ;
	cloison.material = materiau ; 
	cloison.parent = groupe ; 
	cloison.position.y = hauteur / 2.0 ; 

	cloison.checkCollisions = true
	cloison.receiveShadows = true;

    return groupe ;  
}

function creerLumiereProximite(nom, opts, scn)
{
	let groupe = new BABYLON.TransformNode("groupe-"+nom);
	let options = opts || {}
	let light = options.light || new BABYLON.PointLight(nom+"-light", new BABYLON.Vector3(0,0,0), scn)
	let diffuse = options.diffuse || new BABYLON.Color3(1.0, 0.0, 0.0)
	light.position.y += 2
	light.diffuse = diffuse
	light.intensity = 0.0;
	light.parent = groupe
	let zone = options.zone || creerSphere("zone", {diametre:10}, scn)

	let fakeLamp = creerSphere("fake_lamp", {diametre:.5}, scn)

	var fakeLampMat = new BABYLON.StandardMaterial("fake_lamp_off", scn);
	fakeLampMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
	fakeLampMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);


	fakeLamp.material = fakeLampMat

	fakeLamp.position.y += 4
	fakeLamp.parent = groupe

	zone.parent = groupe
	zone.isVisible = false

	zone.actionManager = new BABYLON.ActionManager(scn)

	console.log(diffuse)

	zone.actionManager
	.registerAction(
		new BABYLON.CombineAction(
			{
				trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
				parameter: { 
					mesh: playerCol,
				}
			},

			[
				new BABYLON.InterpolateValueAction(
					BABYLON.ActionManager.NothingTrigger,
					light,
					"intensity",
					.7,
					1000
				),
				new BABYLON.InterpolateValueAction(
					BABYLON.ActionManager.NothingTrigger,
					fakeLamp.material,
					"emissiveColor",
					diffuse,
					1000
				)
			]
		)
	)

	zone.actionManager
	.registerAction(
		new BABYLON.CombineAction(
			{
				trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, 
				parameter: { 
					mesh: playerCol,
				}
			},

			[
				new BABYLON.InterpolateValueAction(
					BABYLON.ActionManager.NothingTrigger,
					light,
					"intensity",
					0.0,
					1000
				),
				new BABYLON.InterpolateValueAction(
					BABYLON.ActionManager.NothingTrigger,
					fakeLamp.material,
					"emissiveColor",
					new BABYLON.Color3(0, 0, 0),
					1000
				)
			]
		)		
	)
	return groupe
}

function creerEscalier(nom, opts, scn)
{
	let options = opts || {};
	let hauteur = options.hauteur || 1.0;
	let largeur = options.largeur || 1.0;
	let stepsCount = options.stepsCount || 10;
	let materiau = options.materiau || new BABYLON.StandardMaterial("materiau-pos"+nom,scn);
	let profondeur = options.profondeur || 1.0
	let stepDepth = options.stepDepth || .3

	let groupe = new BABYLON.TransformNode("groupe-"+nom);

	let stepHeight = hauteur/stepsCount

	for (let i = 0; i < stepsCount; i++) {
		let step = BABYLON.MeshBuilder.CreateBox(nom, {width:largeur, height: stepHeight/2.0, dept:stepDepth},scn)
		step.position.y += stepHeight*i + stepHeight/2
		step.position.z -= (profondeur/stepsCount)*i // Taille giron
		step.material = materiau;
		step.parent = groupe;

		step.checkCollisions = true
		step.receiveShadows = true
	} 

	return groupe
}

function creerTeleSphere(nom, opts, scn)
{
	let options = opts || {}

	let groupe = new BABYLON.TransformNode("groupe-"+nom)

	let sph = creerSphere("sphere", {diametre:1}, scn)

	let sphereMat = new BABYLON.StandardMaterial("teleSph",scn)

	sphereMat.diffuseFresnelParameters = new BABYLON.FresnelParameters();

	sphereMat.diffuseFresnelParameters.leftColor = new BABYLON.Color3(.6, .6, .6);
	sphereMat.diffuseFresnelParameters.rightColor = new BABYLON.Color3(.4, .4, .4);
	sphereMat.diffuseFresnelParameters.power = 4;

	sph.material = sphereMat;

	let sphereMatSelected = new BABYLON.StandardMaterial("teleSph", scn);

	sphereMatSelected.diffuseFresnelParameters = new BABYLON.FresnelParameters();

	sphereMatSelected.diffuseFresnelParameters.leftColor = new BABYLON.Color3(.3, .9, .3);
	sphereMatSelected.diffuseFresnelParameters.rightColor = new BABYLON.Color3(.8, 1, .8);
	sphereMatSelected.diffuseFresnelParameters.power = 4;

	sph.parent = groupe;

	sph.actionManager = new BABYLON.ActionManager(scn);

	sph.actionManager
	.registerAction(
		new BABYLON.CombineAction(
			{
				trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
				parameter: { 
					mesh: playerSight,
					usePreciseIntersection: true
				}
			},

			[
				new BABYLON.SetValueAction(
					BABYLON.ActionManager.NothingTrigger,
					sph,
					"material",
					sphereMatSelected
				),
				new BABYLON.ExecuteCodeAction(
					BABYLON.ActionManager.NothingTrigger,
					function () { 
						selectedTeleportationSphere = new BABYLON.Vector3(groupe.position.x, groupe.position.y, groupe.position.z)
						// console.log(groupe)

					}
				)
			]
		)
	)
	sph.actionManager
	.registerAction(
		new BABYLON.CombineAction(
			{
				trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, 
				parameter: { 
					mesh: playerSight,
					usePreciseIntersection: true
				}
			},

			[
				new BABYLON.SetValueAction(
					BABYLON.ActionManager.NothingTrigger,
					sph,
					"material",
					sphereMat
				),
				new BABYLON.ExecuteCodeAction(
					BABYLON.ActionManager.NothingTrigger,
					function () {
						selectedTeleportationSphere = null
					}
				)
			]
		)
	)

	return groupe;
}

function creerPorte(nom, opts, scn)
{
	let glassMat = new BABYLON.StandardMaterial("transp", scn)
	glassMat.alpha = 0.7
	glassMat.diffuseColor = new BABYLON.Color3(230/255, 1, 252/255)
	
	let selectedGlassMat = new BABYLON.StandardMaterial("selectTransp", scn)
	selectedGlassMat.alpha = 0.8
	selectedGlassMat.diffuseColor = new BABYLON.Color3(190/255, 215/255, 252/255)
	selectedGlassMat.emissiveColor = new BABYLON.Color3(0, .1, 0)

	let options = opts || {};
	let hauteur = options.hauteur || 4.0;
	let largeur = options.largeur || 3.0;
	let pronfondeur = options.profondeur || .01;
	let deplacement = options.deplacement || 2.6;
	let materiau = options.materiau || glassMat;
	let groupe = new BABYLON.TransformNode("groupe-"+nom);



	let door = BABYLON.MeshBuilder.CreateBox(nom, {height:hauteur,width:largeur, depth:pronfondeur}, scn);
	door.material = materiau;
	door.position.y += 2;
	door.checkCollisions = true;
	door.parent = groupe;
	door.isPickable = true
	door.receiveShadows = true;

	let zone = options.zone || creerSphere("zone", {diametre:6}, scn)
	zone.position.y += 2

	zone.parent = groupe
	zone.isVisible = false

	zone.actionManager = new BABYLON.ActionManager(scn)
	zone.actionManager
	.registerAction(
		new BABYLON.InterpolateValueAction({
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
            parameter: { 
                mesh: playerCol,
            }
        }, 
        door,
        'position.x',
        door.position.x + deplacement,
		750
		)
	)
	zone.actionManager
	.registerAction(
		new BABYLON.InterpolateValueAction({
            trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, 
            parameter: { 
                mesh: playerCol,
            }
        }, 
        door,
        'position.x',
        door.position.x,
		750	
		)		
	)
	
	door.actionManager = new BABYLON.ActionManager(scn);

	door.actionManager
	.registerAction(
		new BABYLON.SetValueAction({
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
            parameter: { 
                mesh: playerSight,
				usePreciseIntersection: true
            }
        }, 
        door,
        'material',
		selectedGlassMat
		)
	)
	door.actionManager
	.registerAction(
		new BABYLON.SetValueAction({
            trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, 
            parameter: { 
                mesh: playerSight,
				usePreciseIntersection: true
            }
        }, 
        door,
        'material',
		glassMat
		)		
	)

	return groupe
}

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
