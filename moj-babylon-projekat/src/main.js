import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    Vector3, 
    HemisphericLight, 
    SceneLoader, 
    Color3, 
    DracoCompression 
} from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.05, 0.05, 0.05); // Skoro crna pozadina

    // Draco konfiguracija (ako je novi model smanjen)
    DracoCompression.Configuration = {
        decoder: {
            wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper.js",
            wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm"
        }
    };

    // Osnovna kamera
    const camera = new ArcRotateCamera("camera", 0, Math.PI / 3, 10, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Svetlo
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

    // UČITAVANJE NOVE ZGRADE
    // Promenio sam ime u zgrada_nova.glb da nateramo sistem da zaboravi staru
    SceneLoader.ImportMeshAsync("", "/", "zgrada_nova.glb", scene).then((result) => {
        console.log("Nova zgrada učitana!");
        
        // Automatsko centriranje kamere na novu zgradu
        const root = result.meshes[0];
        const boundingInfo = root.getHierarchyBoundingVectors();
        const center = Vector3.Center(boundingInfo.min, boundingInfo.max);
        
        camera.setTarget(center);
        
        // Podesi udaljenost kamere da model stane u ekran
        const size = boundingInfo.max.subtract(boundingInfo.min);
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.radius = maxDim * 2; 
    }).catch(err => console.error("Greška:", err));

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());