import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, Color3, StandardMaterial } from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.02, 0.02, 0.02);

    // KAMERA - Podešena da ne ide ispod zemlje i da zumira blizu
    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 30, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    
    camera.lowerRadiusLimit = 5;      // Koliko blizu možeš prići (baš blizu!)
    camera.upperRadiusLimit = 80;     // Maksimalno udaljavanje
    camera.upperBetaLimit = Math.PI / 2.1; // Blokira kameru da ne ide ispod zgrade

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    const apartmentCard = document.getElementById("apartment-card");
    let highlightedMesh = null;
    let originalMaterials = new Map();

    // Materijal za zeleni transparentni hover
    const hoverMaterial = new StandardMaterial("hoverMat", scene);
    hoverMaterial.diffuseColor = new Color3(0.4, 1, 0.2);
    hoverMaterial.alpha = 0.5; // Prozirnost (0.5 je 50%)
    hoverMaterial.emissiveColor = new Color3(0.2, 0.5, 0.1);

    // UCITAVANJE SAMO ZGRADE
    SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene).then((result) => {
        result.meshes.forEach(m => {
            m.isPickable = true;
            // Čuvamo originalne materijale za svaki deo
            if (m.material) {
                originalMaterials.set(m, m.material);
            }
        });
        console.log("Zgrada ucitana bez ulice.");
    });

    // HOVER LOGIKA SA TRANSPARENTNIM MATERIJALOM
    scene.onPointerMove = (evt) => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            
            if (highlightedMesh !== mesh) {
                // Vrati prethodni materijal
                if (highlightedMesh) {
                    highlightedMesh.material = originalMaterials.get(highlightedMesh);
                    highlightedMesh.renderOutline = false;
                }
                
                highlightedMesh = mesh;
                
                // Primeni zeleni transparentni hover
                mesh.material = hoverMaterial;
                mesh.renderOutline = true;
                mesh.outlineColor = new Color3(0.4, 1, 0);
                mesh.outlineWidth = 0.05;

                apartmentCard.style.display = "block";
                apartmentCard.style.left = (scene.pointerX + 15) + "px";
                apartmentCard.style.top = (scene.pointerY + 15) + "px";
                document.getElementById("card-title").innerText = mesh.name;
            }
        } else {
            if (highlightedMesh) {
                highlightedMesh.material = originalMaterials.get(highlightedMesh);
                highlightedMesh.renderOutline = false;
            }
            highlightedMesh = null;
            apartmentCard.style.display = "none";
        }
    };

    // UI LOGIKA
    const sidebar = document.getElementById('filter-sidebar');
    const closeBtn = document.getElementById('close-sidebar-x');
    const openBtn = document.getElementById('open-sidebar-btn');

    closeBtn.onclick = () => { sidebar.classList.add('sidebar-hidden'); openBtn.style.display = 'block'; };
    openBtn.onclick = () => { sidebar.classList.remove('sidebar-hidden'); openBtn.style.display = 'none'; };

    document.getElementById('zoom-in').onclick = () => camera.radius -= 3;
    document.getElementById('zoom-out').onclick = () => camera.radius += 3;
    document.getElementById('reset-all').onclick = () => { camera.radius = 30; camera.setTarget(Vector3.Zero()); };

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());