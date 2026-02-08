import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, Color3, StandardMaterial } from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.05, 0.05, 0.05);

    // Kamera
    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 40, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 100;

    // Svetlo
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // --- UCITAVANJE MODELA (Ulica i Zgrada) ---
    Promise.all([
        SceneLoader.ImportMeshAsync("", "/", "ulica.glb", scene).catch(() => console.log("Ulica.glb nije pronadjena")),
        SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene)
    ]).then((results) => {
        if(results[0]) {
            results[0].meshes.forEach(m => {
                m.isPickable = false;
                m.position.y = -0.02; // Da ne treperi podloga
            });
        }
        
        const zgrada = results[1].meshes;
        zgrada.forEach(m => {
            m.isPickable = true;
            m.originalMaterial = m.material;
        });
        console.log("Modeli ucitani!");
    });

    // --- UI LOGIKA (Zatvaranje/Otvaranje) ---
    const sidebar = document.getElementById('filter-sidebar');
    const closeBtn = document.getElementById('close-sidebar-x');
    const openBtn = document.getElementById('open-sidebar-btn');

    closeBtn.addEventListener('click', () => {
        sidebar.classList.add('sidebar-hidden');
        openBtn.style.display = 'block';
    });

    openBtn.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-hidden');
        openBtn.style.display = 'none';
    });

    // --- ZOOM KONTROLE ---
    document.getElementById('zoom-in').addEventListener('click', () => {
        camera.radius -= 5;
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        camera.radius += 5;
    });

    document.getElementById('reset-all').addEventListener('click', () => {
        camera.setTarget(Vector3.Zero());
        camera.radius = 40;
        camera.alpha = Math.PI / 2;
        camera.beta = Math.PI / 2.5;
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});