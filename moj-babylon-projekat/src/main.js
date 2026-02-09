import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    Vector3, 
    HemisphericLight, 
    SceneLoader, 
    Color3, 
    StandardMaterial, 
    DracoCompression 
} from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.02, 0.02, 0.02);

    // 1. DRACO DEKODER (OBAVEZNO: Omogućava čitanje kompresovanog modela)
    DracoCompression.Configuration = {
        decoder: {
            wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper.js",
            wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm"
        }
    };

    // 2. KAMERA (Podešena da se okreće oko zgrade)
    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 50, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 150;
    camera.upperBetaLimit = Math.PI / 2.1; // Ne dozvoljava kameri da ide "ispod zemlje"

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.81; // Mala promena da bi Git registrovao novi commit

    // 3. UI ELEMENTI (Kartica za stanove)
    const apartmentCard = document.getElementById("apartment-card");
    const closeCardBtn = document.getElementById("close-card-x");
    let highlightedMesh = null;
    let isCardLocked = false;
    let originalMaterials = new Map();

    // Materijal za hover efekat
    const hoverMaterial = new StandardMaterial("hoverMat", scene);
    hoverMaterial.diffuseColor = new Color3(0.4, 1, 0.2);
    hoverMaterial.alpha = 0.4;

    // 4. UČITAVANJE MODELA (Pazi da se fajl zove zgrada.glb u public folderu)
    SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene, (event) => {
        if (event.lengthComputable) {
            let percentage = ((event.loaded * 100) / event.total).toFixed(0);
            console.log(`Učitavanje modela: ${percentage}%`);
        }
    }).then((result) => {
        console.log("Zgrada je uspešno učitana!");
        result.meshes.forEach(m => {
            m.isPickable = true;
            if (m.material) {
                originalMaterials.set(m, m.material);
            }
        });
    }).catch(err => {
        console.error("Greška pri učitavanju:", err);
    });

    // 5. INTERAKCIJA
    const clearHighlight = () => {
        if (highlightedMesh) {
            highlightedMesh.material = originalMaterials.get(highlightedMesh);
            highlightedMesh.renderOutline = false;
        }
        highlightedMesh = null;
    };

    scene.onPointerMove = () => {
        if (isCardLocked) return;
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            if (highlightedMesh !== mesh) {
                clearHighlight();
                highlightedMesh = mesh;
                mesh.material = hoverMaterial;
                mesh.renderOutline = true;
                mesh.outlineColor = new Color3(0.4, 1, 0);
                
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

    scene.onPointerDown = () => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh) {
            isCardLocked = true;
            document.getElementById("card-title").innerText = "Sprat: " + pickResult.pickedMesh.name;
        }
    };

    if (closeCardBtn) {
        closeCardBtn.onclick = (e) => {
            e.stopPropagation();
            isCardLocked = false;
            apartmentCard.style.display = "none";
            clearHighlight();
        };
    }

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());