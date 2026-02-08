import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.05, 0.05, 0.05);

    // Kamera podešena da gleda u zgradu
    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 50, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50;

    // Svetlo
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Učitavanje modela
    Promise.all([
        SceneLoader.ImportMeshAsync("", "/", "ulica.glb", scene).catch(() => null),
        SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene)
    ]).then((results) => {
        if(results[0]) {
            results[0].meshes.forEach(m => m.position.y = -0.05);
        }
        console.log("3D Modeli učitani.");
    });

    // Interfejs Logika (X i Filters dugme)
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

    // Zoom Kontrole
    document.getElementById('zoom-in').addEventListener('click', () => camera.radius -= 5);
    document.getElementById('zoom-out').addEventListener('click', () => camera.radius += 5);
    
    document.getElementById('reset-all').addEventListener('click', () => {
        camera.radius = 50;
        camera.setTarget(Vector3.Zero());
    });

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());