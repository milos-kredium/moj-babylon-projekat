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

    // 1. KONFIGURACIJA DRACO DEKODERA (Ključno za tvoj kompresovani model)
    DracoCompression.Configuration = {
        decoder: {
            wasmUrl: "https://preview.babylonjs.com/draco_wasm_wrapper.js",
            wasmBinaryUrl: "https://preview.babylonjs.com/draco_decoder_gltf.wasm"
        }
    };

    // 2. KAMERA I SVETLO
    const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 40, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 100;
    camera.upperBetaLimit = Math.PI / 2.1; // Sprečava kameru da ide ispod poda

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // 3. UI ELEMENTI
    const apartmentCard = document.getElementById("apartment-card");
    const closeCardBtn = document.getElementById("close-card-x");
    let highlightedMesh = null;
    let isCardLocked = false;
    let originalMaterials = new Map();

    // Materijal za hover efekat (zeleni prozirni sloj)
    const hoverMaterial = new StandardMaterial("hoverMat", scene);
    hoverMaterial.diffuseColor = new Color3(0.4, 1, 0.2);
    hoverMaterial.alpha = 0.4;
    hoverMaterial.emissiveColor = new Color3(0.2, 0.5, 0.1);

    // 4. UČITAVANJE MODELA
    // Putanja "/" znači da traži zgrada.glb unutar public foldera
    SceneLoader.ImportMeshAsync("", "/", "zgrada.glb", scene, (event) => {
        // Logika za učitavanje (opciono: možeš dodati vizuelni loading bar ovde)
        if (event.lengthComputable) {
            let percentage = ((event.loaded * 100) / event.total).toFixed(0);
            console.log("Učitavanje: " + percentage + "%");
        }
    }).then((result) => {
        console.log("Model uspešno učitan!");
        result.meshes.forEach(m => {
            m.isPickable = true;
            if (m.material) {
                originalMaterials.set(m, m.material);
            }
        });
    }).catch(err => {
        console.error("Greška pri učitavanju modela: ", err);
    });

    // 5. INTERAKCIJA (HOVER & KLIK)
    const clearHighlight = () => {
        if (highlightedMesh) {
            highlightedMesh.material = originalMaterials.get(highlightedMesh);
            highlightedMesh.renderOutline = false;
        }
        highlightedMesh = null;
    };

    // Pomeranje miša (Hover)
    scene.onPointerMove = () => {
        if (isCardLocked) return; // Ako je kartica "zaključana" klikom, hover ne radi ništa

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

    // Klik na objekat
    scene.onPointerDown = (evt) => {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh) {
            isCardLocked = true; // "Zaključavamo" karticu na ekranu
            const mesh = pickResult.pickedMesh;
            
            clearHighlight();
            highlightedMesh = mesh;
            mesh.material = hoverMaterial;
            mesh.renderOutline = true;

            apartmentCard.style.display = "block";
            // Pozicija kartice ostaje fiksna na mestu klika
            apartmentCard.style.left = (scene.pointerX + 15) + "px";
            apartmentCard.style.top = (scene.pointerY + 15) + "px";
            document.getElementById("card-title").innerText = mesh.name;
        }
    };

    // Zatvaranje kartice na X
    if (closeCardBtn) {
        closeCardBtn.onclick = (e) => {
            e.stopPropagation(); // Sprečava da klik na X aktivira klik na zgradu ispod
            isCardLocked = false;
            apartmentCard.style.display = "none";
            clearHighlight();
        };
    }

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());

// Responzivnost
window.addEventListener("resize", () => {
    engine.resize();
});