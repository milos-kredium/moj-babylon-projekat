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
    // Tamno siva pozadina da zgrada dođe do izražaja
    scene.clearColor = new Color3(0.1, 0.1, 0.1);

    // Draco dekoder (mora da stoji jer je model optimizovan)
    DracoCompression.Configuration = {
        decoder: {
            wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper.js",
            wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm"
        }
    };

    // Podešavanje kamere
    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Svetlo (povećano na 1.2 da zgrada bude jasna)
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 1.2;

    // Učitavanje modela
    SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene).then((result) => {
        // Automatsko fokusiranje na model bez obzira na njegovu veličinu
        const root = result.meshes[0];
        const boundingInfo = root.getHierarchyBoundingVectors();
        const center = Vector3.Center(boundingInfo.min, boundingInfo.max);
        
        camera.setTarget(center);
        
        const size = boundingInfo.max.subtract(boundingInfo.min);
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.radius = maxDim * 1.5; // Kamera se odmiče dovoljno da vidi celu zgradu
        
        console.log("Nova zgrada je uspešno prikazana!");
    }).catch(err => {
        console.error("Greška pri učitavanju:", err);
    });

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());