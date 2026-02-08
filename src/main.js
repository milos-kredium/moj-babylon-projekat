import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.02, 0.02, 0.02);

    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 45, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 15;
    camera.upperRadiusLimit = 100;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    const apartmentCard = document.getElementById("apartment-card");
    let highlightedMesh = null;

    // UCITAVANJE MODELA (Ulica i Zgrada)
    Promise.all([
        SceneLoader.ImportMeshAsync("", "/", "ulica.glb", scene).catch(() => null),
        SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene)
    ]).then((results) => {
        // Ulica - isključujemo hover da ne smeta zgradi
        if(results[0]) {
            results[0].meshes.forEach(m => {
                m.isPickable = false; 
                m.position.y = -0.05;
            });
        }
        // Zgrada
        if(results[1]) {
            results[1].meshes.forEach(m => {
                m.isPickable = true;
                m.checkCollisions = true;
            });
        }
        console.log("3D Scena spremna.");
    });

    // ZELENI HOVER EFEKAT I KARTICA
    scene.onPointerMove = (evt) => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            
            if (highlightedMesh !== mesh) {
                if (highlightedMesh) highlightedMesh.renderOutline = false;
                
                highlightedMesh = mesh;
                mesh.renderOutline = true;
                mesh.outlineColor = new Color3(0.4, 1, 0); // Zelena boja
                mesh.outlineWidth = 0.08;

                // Pozicioniranje i prikaz kartice
                apartmentCard.style.display = "block";
                apartmentCard.style.left = (scene.pointerX + 15) + "px";
                apartmentCard.style.top = (scene.pointerY + 15) + "px";
                document.getElementById("card-title").innerText = mesh.name;
            }
        } else {
            if (highlightedMesh) highlightedMesh.renderOutline = false;
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

    // ZOOM
    document.getElementById('zoom-in').onclick = () => camera.radius -= 5;
    document.getElementById('zoom-out').onclick = () => camera.radius += 5;
    document.getElementById('reset-all').onclick = () => { camera.radius = 45; camera.setTarget(Vector3.Zero()); };

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());