let export_progress = 0
let currentZip = null;

// LOCALFORAGE ==========================================
localforage.config({
    name: "fractured_reach_campaign_editor",
    storeName: "campaign_files"
});


async function saveFile(key, file) {
    await localforage.setItem(key, file);
    console.log(`Saved ${key} (${file.size} bytes)`);
}

async function loadFile(key) {
    const file = await localforage.getItem(key);
    if (!file) {
        console.warn(`No file stored under ${key}`);
        return null;
    }
    return file;
}

async function listFiles() {
    const keys = [];
    await localforage.iterate((value, key) => {
        keys.push({ key, size: value.size });
    });
    return keys;
}

async function deleteFile(key) {
    await localforage.removeItem(key);
}


// JSZIP ===============================================
function createNewZip() {
    currentZip = new JSZip();
    console.log("Created new zip");
    return currentZip;
}

// Add a file to the zip
function addFileToZip(path, content) {
    if (!currentZip) throw new Error("No zip created yet");
    currentZip.file(path, content);
    console.log(`Added file: ${path}`);
}

// Add a folder to the zip
function addFolderToZip(path) {
    if (!currentZip) throw new Error("No zip created yet");
    currentZip.folder(path);
    console.log(`Added folder: ${path}`);
}

async function exportZip() {
    if (!currentZip) throw new Error("No zip created yet");
    return await currentZip.generateAsync({ type: "blob" });
  }


// MAIN ====================================================


// Folder structure:
// {namespace}:

//   campaigns

//     {campaign_namespace}

//       level_data

//         {level_0}
//           mission.json
//           background.png
//           {location_1}.tscn
//           ...

//         {level_1}
//           mission.json
//           background.png
//           {location_1}.tscn
//           ...

//       campaign.json

async function export_campaign() {
    export_progress = 0
    createNewZip()

    let i = 0
    for (level of projects[currently_editing].levels){
        // let level = projects[currently_editing].levels[level_key]
        if ($(`#export_level_check_${i}`).checked){
            addFolderToZip(`${projects[currently_editing].namespace}/campaigns/${projects[currently_editing].namespace}/level_data/${level.name}`)
            addFileToZip(`${projects[currently_editing].namespace}/campaigns/${projects[currently_editing].namespace}/level_data/${level.name}/mission.json`, await generate_mission_json(i))
        }
        i++
    };
    download_file(await exportZip(), `${projects[currently_editing].namespace}.zip`)
}


async function generate_mission_json(level_id){
    let level_data = projects[currently_editing].levels[level_id]

    let json_data = {
        finish: {
            text: level_data.finish.text || ""
        },
        objectives: [],
        locations: {},
        fail_triggers: []
    }

    for (loc in level_data.locations) {
        let val = level_data.locations[loc]
        
        let loc_i = 0
        let i = 0
        projects[currently_editing].locations.forEach(loc => {
            if (loc.name == val){
                loc_i = i
            }
            i++
        });

        let modified_file_name = `lvl_${level_id}_${(await loadFile(`${loc_i}_scene`)).name}`
        
        json_data.locations[loc] = {
            "name": val,
            "file": modified_file_name
        }
    }
    console.log(json_data)
    level_data.objectives.forEach(obj => {
        let altered_data = obj
        altered_data.display = "waypoint"
        if (obj.type == "briefing"){
            let d = []
            let splits = obj.text.split("***")
            splits.forEach(split => {
                d.push({
                    "type": "text",
                    "title": obj.title,
                    "text": split,
                    "display": "hologram",
                    "face": "clone_trooper"
                })
            });
            altered_data.display = d            
        }
        else if (obj.type == "hyperspace_jump") {
            if (obj.new_location == json_data.locations.start.name){
                obj.new_location = "start"
            }
        }
        
        json_data.objectives.push(altered_data)
    });

    return JSON.stringify(json_data)
}


// USER FILE I/O ==========================================

function get_file(accept_types, multiple = false) {
    return new Promise((resolve, reject) => {
        let tmpfilegetter = document.createElement("input");
        tmpfilegetter.type = "file";
        tmpfilegetter.accept = accept_types;
        tmpfilegetter.multiple = multiple;

        tmpfilegetter.addEventListener("change", () => {
            if (tmpfilegetter.files.length > 0) {
                if (multiple) {
                    resolve(Array.from(tmpfilegetter.files));
                } else {
                    resolve(tmpfilegetter.files[0]);
                }
            } else {
                reject(new Error("No file selected"));
            }
        });

        tmpfilegetter.click();
    });
}

function download_file(blob, filename = "download") {
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename

    a.click();

    URL.revokeObjectURL(url)
}



// EDITOR ==================================================
async function upload_background() {
    let blob_result = await get_file(".png")
    $("#location_editor_background_preview").setAttribute("src", URL.createObjectURL(blob_result));
    await saveFile(`${current_location}_background`, blob_result)
}

async function upload_scene() {
    let blob_result = await get_file(".tscn")
    $("#location_editor_scene_name").textContent = blob_result.name
    await saveFile(`${current_location}_scene`, blob_result)
}

async function upload_additional() {
    let blob_results = await get_file("", true)
    blob_results.forEach(file => {
        saveFile(`${current_location}_additional_${file.name}`, file)
        reload_location_files()
    })
}

async function remove_additional_file (file_key) {
    deleteFile(file_key)
    await reload_location_files()
}