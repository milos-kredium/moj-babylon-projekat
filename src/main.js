import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, Color3, StandardMaterial } from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.05, 0.05, 0.05);

    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 50, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    const apartmentCard = document.getElementById("apartment-card");
    let highlightedMesh = null;

    // Učitavanje modela
    Promise.all([
        SceneLoader.ImportMeshAsync("", "/", "ulica.glb", scene).catch(() => null),
        SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene)
    ]).then((results) => {
        if(results[0]) results[0].meshes.forEach(m => { m.isPickable = false; m.position.y = -0.05; });
        
        const zgrada = results[1].meshes;
        zgrada.forEach(m => {
            m.isPickable = true;
            // Čuvamo originalni materijal da bi ga vratili posle hovera
            if (m.material) m.originalColor = m.material.albedoColor || m.material.diffuseColor;
        });
    });

    // --- HOVER LOGIKA ---
    scene.onPointerMove = (evt) => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            
            // Ako je miš na novom delu zgrade
            if (highlightedMesh !== mesh) {
                if (highlightedMesh && highlightedMesh.renderOutline) {
                    highlightedMesh.renderOutline = false;
                }
                highlightedMesh = mesh;
                mesh.renderOutline = true;
                mesh.outlineColor = new Color3(0.5, 1, 0); // Zelena linija
                mesh.outlineWidth = 0.1;

                // Prikaži karticu pored miša
                apartmentCard.style.display = "block";
                apartmentCard.style.left = (scene.pointerX + 20) + "px";
                apartmentCard.style.top = (scene.pointerY + 20) + "px";
                document.getElementById("card-title").innerText = "Section: " + mesh.name;
            }
        } else {
            if (highlightedMesh) highlightedMesh.renderOutline = false;
            highlightedMesh = null;
            apartmentCard.style.display = "none";
        }
    };

    // --- KLIK LOGIKA ---
    scene.onPointerDown = (evt) => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh) {
            console.log("Kliknuto na: " + pickResult.pickedMesh.name);
            // Ovde možeš dodati da se otvori neki prozor ili zumira kamera
        }
    };

    // UI Logika (Sidebar)
    const sidebar = document.getElementById('filter-sidebar');
    const closeBtn = document.getElementById('close-sidebar-x');
    const openBtn = document.getElementById('open-sidebar-btn');

    closeBtn.addEventListener('click', () => { sidebar.classList.add('sidebar-hidden'); openBtn.style.display = 'block'; });
    openBtn.addEventListener('click', () => { sidebar.classList.remove('sidebar-hidden'); openBtn.style.display = 'none'; });

    // Zoom
    document.getElementById('zoom-in').addEventListener('click', () => camera.radius -= 5);
    document.getElementById('zoom-out').addEventListener('click', () => camera.radius += 5);

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());