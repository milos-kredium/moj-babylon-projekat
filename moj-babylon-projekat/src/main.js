import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, Color3, StandardMaterial } from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.02, 0.02, 0.02);

    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 30, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 80;
    camera.upperBetaLimit = Math.PI / 2.1;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    const apartmentCard = document.getElementById("apartment-card");
    const closeCardBtn = document.getElementById("close-card-x");
    let highlightedMesh = null;
    let isCardLocked = false; // Nova promenljiva za "zaključavanje" kartice
    let originalMaterials = new Map();

    const hoverMaterial = new StandardMaterial("hoverMat", scene);
    hoverMaterial.diffuseColor = new Color3(0.4, 1, 0.2);
    hoverMaterial.alpha = 0.5;
    hoverMaterial.emissiveColor = new Color3(0.2, 0.5, 0.1);

    SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene).then((result) => {
        result.meshes.forEach(m => {
            m.isPickable = true;
            if (m.material) originalMaterials.set(m, m.material);
        });
    });

    // Funkcija za skidanje hover efekta
    const clearHighlight = () => {
        if (highlightedMesh) {
            highlightedMesh.material = originalMaterials.get(highlightedMesh);
            highlightedMesh.renderOutline = false;
        }
        highlightedMesh = null;
    };

    // HOVER LOGIKA
    scene.onPointerMove = (evt) => {
        if (isCardLocked) return; // Ako je kartica otvorena klikom, ne menjaj ništa na hover

        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            if (highlightedMesh !== mesh) {
                clearHighlight();
                highlightedMesh = mesh;
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
            clearHighlight();
            apartmentCard.style.display = "none";
        }
    };

    // KLIK LOGIKA (Za mobilni i fiksiranje kartice)
    scene.onPointerDown = (evt) => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh) {
            isCardLocked = true; // Zaključaj karticu
            const mesh = pickResult.pickedMesh;
            
            clearHighlight();
            highlightedMesh = mesh;
            mesh.material = hoverMaterial;
            mesh.renderOutline = true;

            apartmentCard.style.display = "block";
            // Pozicioniramo karticu tamo gde je kliknuto, ali fiksno
            apartmentCard.style.left = (scene.pointerX + 15) + "px";
            apartmentCard.style.top = (scene.pointerY + 15) + "px";
            document.getElementById("card-title").innerText = mesh.name;
        }
    };

    // Zatvaranje kartice na X
    closeCardBtn.onclick = (e) => {
        e.stopPropagation(); // Sprečava da klik na X aktivira klik na zgradu iza
        isCardLocked = false;
        apartmentCard.style.display = "none";
        clearHighlight();
    };

    // UI LOGIKA (Sidebar)
    const sidebar = document.getElementById('filter-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-x');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');

    closeSidebarBtn.onclick = () => { sidebar.classList.add('sidebar-hidden'); openSidebarBtn.style.display = 'block'; };
    openSidebarBtn.onclick = () => { sidebar.classList.remove('sidebar-hidden'); openSidebarBtn.style.display = 'none'; };

    document.getElementById('zoom-in').onclick = () => camera.radius -= 3;
    document.getElementById('zoom-out').onclick = () => camera.radius += 3;
    document.getElementById('reset-all').onclick = () => { camera.radius = 30; camera.setTarget(Vector3.Zero()); isCardLocked = false; apartmentCard.style.display = "none"; clearHighlight(); };

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());