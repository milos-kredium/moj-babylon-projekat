import './style.css'
import { 
    Engine, Scene, ArcRotateCamera, Vector3, 
    HemisphericLight, SceneLoader, Color3, 
    StandardMaterial 
} from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = function () {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.1, 0.1, 0.2);

    // --- KAMERA (Niska i stabilna) ---
    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.2, 35, new Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    
    camera.upperBetaLimit = 1.58; // Stop tačno na zemlji
    camera.lowerRadiusLimit = 5; 
    camera.upperRadiusLimit = 70;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // --- POBOLJŠAN HOVER MATERIJAL (Nije transparentan) ---
    const hoverMat = new StandardMaterial("hoverMat", scene);
    // Emissive color daje sjaj, ali bez alpha (zgrada ostaje vidljiva)
    hoverMat.emissiveColor = new Color3(0, 0.2, 0.8); 
    hoverMat.specularColor = new Color3(0, 0, 0); // Isključujemo odsjaj svetla da ne blješti previše

    SceneLoader.ImportMesh("", "/", "zgrada.glb", scene, function (meshes) {
        camera.setTarget(new Vector3(0, 1, 0));
        meshes.forEach(m => {
            m.isPickable = true;
            m.originalMaterial = m.material;
        });
    });

    let lastMesh = null;

    // --- HOVER ---
    scene.onPointerMove = function () {
        const pick = scene.pick(scene.pointerX, scene.pointerY);
        if (pick.hit && pick.pickedMesh) {
            if (lastMesh !== pick.pickedMesh) {
                if (lastMesh) lastMesh.material = lastMesh.originalMaterial;
                lastMesh = pick.pickedMesh;
                
                // Umesto zamene celog materijala, koristimo "emissiveColor" na originalu ako je moguće
                // ali pošto je tvoja zgrada jedan mesh, idemo sa sigurnijom varijantom:
                lastMesh.material = hoverMat;
                canvas.style.cursor = "pointer";
            }
        } else {
            if (lastMesh) lastMesh.material = lastMesh.originalMaterial;
            lastMesh = null;
            canvas.style.cursor = "default";
        }
    };

    // --- KLIK KARTICA ---
    scene.onPointerDown = function (evt) {
        const pick = scene.pick(scene.pointerX, scene.pointerY);
        const card = document.getElementById("info-card");

        if (pick.hit && pick.pickedMesh) {
            const pos = pick.pickedPoint;
            const buildingName = pos.x < 0 ? "Building 1 (Leva)" : "Building 2 (Desna)";
            
            let floor = "Prizemlje";
            if (pos.y > 2.5) floor = "1. Sprat";
            if (pos.y > 5.5) floor = "2. Sprat";

            card.innerHTML = `
                <span class="close-btn" onclick="this.parentElement.style.display='none'">X</span>
                <h2>${buildingName}</h2>
                <p><strong>${floor}</strong></p>
                <hr style="border:0; border-top:1px solid #eee;">
                <p>Status: Available</p>
                <p>Units: 1BR, 2BR, 3BR</p>
            `;

            card.style.left = evt.clientX + 10 + "px";
            card.style.top = evt.clientY + 10 + "px";
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    };

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());