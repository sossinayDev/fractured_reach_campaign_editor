let objective_mover = `
<img src="static/img/ui/up.svg" onclick="move_up_objective('{ID}')"><img src="static/img/ui/down.svg" onclick="move_down_objective('{ID}')"><img src="static/img/ui/delete_objective.svg" onclick="delete_objective('{ID}')">
`

let ui_briefing = `<div class="mission_objective tinted centered" id="objective_{ID}">
    <div class="objective_mover">{OM}</div>    
    <h4>Briefing</h4>
    <p>Title</p>
    <input id="input_{ID}_title" placeholder="Objective title" value="{TITLE}">
    <p>Briefing text: (Split pages with "***")</p>
    <textarea id="input_{ID}_text" placeholder="Enter the briefing text">{TEXT}</textarea>
</div>
`

let ui_survive = `<div class="mission_objective tinted centered" id="objective_{ID}">
    <div class="objective_mover">{OM}</div>    
    <h4>Survive</h4>
    <p>Title</p>
    <input id="input_{ID}_title" placeholder="Objective title" value="{TITLE}">
    <p>Survival duration: (s)</p>
    <input type="number" id="input_{ID}_duration" placeholder="Enter the duration in seconds" value="{DURATION}">
</div>
`

let ui_reach_waypoint = `<div class="mission_objective tinted centered" id="objective_{ID}">
    <div class="objective_mover">{OM}</div>    
    <h4>Reach waypoint</h4>
    <p>Title</p>
    <input id="input_{ID}_title" placeholder="Objective title" value="{TITLE}">
    <p>Waypoint ID:</p>
    <input id="input_{ID}_waypoint_id" placeholder="Enter the waypoint id" value="{WAYPOINT_ID}">
</div>
`

let ui_destroy = `<div class="mission_objective tinted centered" id="objective_{ID}">
    <div class="objective_mover">{OM}</div>    
    <h4>Destroy object</h4>
    <p>Title</p>
    <input id="input_{ID}_title" placeholder="Objective title" value="{TITLE}">
    <p>Object id: (GD selector, no $)</p>
    <input id="input_{ID}_object_id" placeholder="Enter the object id" value="{TARGET}">
</div>
`

let ui_hyperspace_jump = `<div class="mission_objective tinted centered" id="objective_{ID}">
    <div class="objective_mover">{OM}</div>    
    <h4>Hyperspace jump</h4>
    <p>Title</p>
    <input id="input_{ID}_title" placeholder="Objective title" value="{TITLE}">
    <p>Jump direction: (deg)</p>
    <input type="number" id="input_{ID}_dir_x" placeholder="X direction in degrees" value="{DIR_X}">
    <input type="number" id="input_{ID}_dir_y" placeholder="Y direction in degrees" value="{DIR_Y}">
    <p>New jump location:</p>
    <select class="location_selector transparent wide no-focus-outline" id="input_{ID}_new_location" value="{NEW_LOCATION}"><option disabled selected hidden>Select a location</option></select>
</div>
`


let config = {
    "dark-mode": false
}

let projects = {}

async function init() {
    load_data(true)

    document.body.innerHTML += footer
    document.title = document.title.replace("$V", VERSION)
    if (window.location.href.includes("editor.html")) {
        document.title = document.title.replace("$P", projects[currently_editing].name)
    }

    if ($("#project_organizer")) {
        organizer_vars[$("#project_organizer").id] = projects
    }
    if ($("#level_selector")) {
        organizer_vars[$("#level_selector").id] = projects[currently_editing].levels
    }
    if ($("#location_selector")) {
        organizer_vars[$("#location_selector").id] = projects[currently_editing].locations || []
    }

    load_data()


    document.querySelectorAll(".organizer").forEach(organizer => {
        if (organizer_vars[organizer.id] != null) {
            for (let project in organizer_vars[organizer.id]) {
                let item = document.createElement("div")
                item.className = "organizer_item"

                let btn = document.createElement("button")
                btn.className = "organizer_main_item"
                btn.textContent = organizer_vars[organizer.id][project]["name"]
                if (organizer == $("#project_organizer")) {
                    btn.onclick = function () {
                        localStorage.setItem("fractured_reach_campaign_editor_current_project", project)
                        localStorage.setItem("fractured_reach_campaign_editor_current_level", null)
                        window.location.href = "editor.html"
                    }
                }
                else if (organizer == $("#level_selector")) {
                    btn.onclick = function () {
                        edit_level(organizer_vars[organizer.id][project]["name"])
                    }
                }
                else if (organizer == $("#location_selector")) {
                    btn.onclick = function () {
                        edit_location(project)
                    }
                }
                item.appendChild(btn)

                let rename_btn = document.createElement("button")
                rename_btn.className = "organizer_item_icon_btn"
                let rename_icon = document.createElement("img")
                rename_icon.className = "inline_img recolor"
                rename_icon.src = "static/img/ui/rename.svg"
                rename_icon.alt = "Rename"
                rename_btn.prepend(rename_icon)
                if (organizer == $("#project_organizer")) {
                    rename_btn.onclick = function () {
                        rename_project(project)
                    }
                }
                else if (organizer == $("#level_selector")) {
                    rename_btn.onclick = function () {
                        rename_level(project)
                    }
                }
                else if (organizer == $("#location_selector")) {
                    rename_btn.onclick = function () {
                        rename_location(project)
                    }
                }
                item.appendChild(rename_btn)

                let delete_btn = document.createElement("button")
                delete_btn.className = "organizer_item_icon_btn warn_bg"
                let delete_icon = document.createElement("img")
                delete_icon.className = "inline_img recolor"
                delete_icon.src = "static/img/ui/delete.svg"
                delete_icon.alt = "Rename"
                delete_btn.prepend(delete_icon)
                if (organizer == $("#project_organizer")) {
                    delete_btn.onclick = function () {
                        delete_project(project)
                    }
                }
                else if (organizer == $("#level_selector")) {
                    delete_btn.onclick = function () {
                        delete_level(project)
                    }
                }
                else if (organizer == $("#location_selector")) {
                    delete_btn.onclick = function () {
                        delete_location(project)
                    }
                }
                item.appendChild(delete_btn)

                organizer.appendChild(item)
            }
            let placeholder = document.createElement("p")
            placeholder.className = "placeholder_fill"
            let add_new_btn = document.createElement("button")
            add_new_btn.textContent = "+ Create"
            add_new_btn.id = organizer.id + "_add_new_btn"
            add_new_btn.className = "add_new_btn"
            organizer.appendChild(add_new_btn)
        }
    });
    if (document.getElementById("project_organizer_add_new_btn") != null) {
        document.getElementById("project_organizer_add_new_btn").onclick = new_project_prompt
    }
    if (document.getElementById("level_selector_add_new_btn") != null) {
        document.getElementById("level_selector_add_new_btn").onclick = new_level_prompt
    }
    if (document.getElementById("location_selector_add_new_btn") != null) {
        document.getElementById("location_selector_add_new_btn").onclick = new_location_prompt
    }


    if (window.location.href.includes("editor.html")) {
        load_project()
        if (current_level == null && current_location == null) {
            $("#mission_editor").style.display = "none"
            $("#location_editor").style.display = "none"
        }
        else if (current_level != null) {
            $("#campaign_meta").style.display = "none"
            $("#home_spaceholder").style.display = "none"
            $("#level_selector").style.display = "none"
            $("#location_selector").style.display = "none"
            $("#home_spaceholder_2").style.display = "none"
            $("#location_editor").style.display = "none"
            $("#mission_name").textContent = get_level_data(current_level).name
            
            let t = get_level_data(current_level).finish || {}
            $("#mission_finish_text").value = t.text || ""

            let id = 0
            let objs = get_level_data(current_level).objectives
            objs.forEach(mission_objective => {
                if (mission_objective.type == "briefing") {
                    let base = ui_briefing.trim()
                    base = base.replace("{OM}", objective_mover)
                    base = base.replaceAll("{ID}", id.toString())
                    base = base.replaceAll("{TEXT}", mission_objective.text)
                    base = base.replaceAll("{TITLE}", mission_objective.title)
                    $("#objective_containers").innerHTML += base
                }
                else if (mission_objective.type == "survive") {
                    let base = ui_survive.trim()
                    base = base.replace("{OM}", objective_mover)
                    base = base.replaceAll("{ID}", id.toString())
                    base = base.replaceAll("{DURATION}", mission_objective.duration)
                    base = base.replaceAll("{TITLE}", mission_objective.title)
                    $("#objective_containers").innerHTML += base
                }
                else if (mission_objective.type == "reach_waypoint") {
                    let base = ui_reach_waypoint.trim()
                    base = base.replace("{OM}", objective_mover)
                    base = base.replaceAll("{ID}", id.toString())
                    base = base.replaceAll("{WAYPOINT_ID}", mission_objective.waypoint_id)
                    base = base.replaceAll("{TITLE}", mission_objective.title)
                    $("#objective_containers").innerHTML += base
                }
                else if (mission_objective.type == "destroy") {
                    let base = ui_destroy.trim()
                    base = base.replace("{OM}", objective_mover)
                    base = base.replaceAll("{ID}", id.toString())
                    base = base.replaceAll("{TARGET}", mission_objective.target_id)
                    base = base.replaceAll("{TITLE}", mission_objective.title)
                    $("#objective_containers").innerHTML += base
                }
                else if (mission_objective.type == "hyperspace_jump") {
                    let base = ui_hyperspace_jump.trim()
                    base = base.replace("{OM}", objective_mover)
                    base = base.replaceAll("{ID}", id.toString())
                    base = base.replaceAll("{DIR_X}", mission_objective.dir_x)
                    base = base.replaceAll("{DIR_Y}", mission_objective.dir_y)
                    base = base.replaceAll("{TITLE}", mission_objective.title)
                    base = base.replaceAll("{NEW_LOCATION}", mission_objective.new_location)
                    $("#objective_containers").innerHTML += base
                }

                $("#objective_containers").innerHTML += "<p class=\"placeholder_small\"></p>"

                id++
            });

            document.querySelectorAll(".location_selector").forEach(location_selector => {
                projects[currently_editing].locations.forEach(location => {
                    location_selector.innerHTML += `<option>${location.name}</option>`
                });
                if (get_level_data(current_level).objectives[parseInt(location_selector.id.replaceAll("input_", "").substring(0, 1))] != null){
                    location_selector.value = get_level_data(current_level).objectives[parseInt(location_selector.id.replaceAll("input_", "").substring(0, 1))].new_location
                }
            });
        }
        else if (current_location != null) {
            let loc_data = projects[currently_editing].locations[current_location]

            $("#campaign_meta").style.display = "none"
            $("#home_spaceholder").style.display = "none"
            $("#level_selector").style.display = "none"
            $("#location_selector").style.display = "none"
            $("#home_spaceholder_2").style.display = "none"
            $("#mission_editor").style.display = "none"

            $("#location_name").textContent = loc_data.name

            await reload_location_files();

        }
    }

    setTimeout(() => {
        document.body.style.transition = "background-color 0.3s ease-in-out"
    }, 1200)
}

async function reload_location_files() {
    let current_skybox = await loadFile(`${current_location}_background`)
    if (current_skybox != null) {
        $("#location_editor_background_preview").setAttribute("src", URL.createObjectURL(current_skybox));
    }

    let current_scene = await loadFile(`${current_location}_scene`)
    if (current_scene != null) {
        $("#location_editor_scene_name").textContent = `Current scene: ${current_scene.name}`
    }

    let all_files = await listFiles()
    let additional_files = []
     $("#location_editor_additional_file_list").innerHTML = ""
    for (const file_key of all_files) {
        const file = await loadFile(file_key.key)
        console.log(file)
        if (file_key.key.startsWith(`${current_location}_additional_`)) {
            additional_files.push(file)

            $("#location_editor_additional_file_list").innerHTML += `
                        <span>${file.name}</span> <img src="static/img/ui/delete_objective.svg" onclick="remove_additional_file('${file_key.key}')"> <p class="spaceholder_tiny"></p>
                    `
        }
    }
}

function rename_project(project) {
    let new_name = prompt(`Enter the new name for ${project}:`)
    if (new_name == null || new_name == "") {
        return
    }
    projects[new_name] = projects[project]
    delete projects[project]
    projects[new_name].name = new_name
    projects[new_name].namespace = to_valid(new_name)
    store_data()
    document.location.reload()
}

function rename_location(location) {
    let new_name = to_valid(prompt(`Enter the new name for ${projects[currently_editing].locations[location].name}:`)).trim()
    if (new_name == null || new_name == "") {
        return
    }
    projects[currently_editing].locations[location].name = new_name
    projects[currently_editing].locations[location].id = to_valid(new_name)
    store_data()
    document.location.reload()
}

function delete_location(location) {
    if (confirm(`Do you really want to delete ${projects[currently_editing].locations[location].name}? This is irreversible!`)) {
        projects[currently_editing].locations.splice(location, 1)
    }
    store_data()
    document.location.reload()
}


function toggle_dark_mode() {
    var mode = document.querySelector("body").className
    if (mode == "dark-mode") {
        document.querySelector("body").className = ""
        document.getElementById("theme_toggle").src = "static/img/ui/dark_mode.svg"
        config["dark-mode"] = false
    }
    else {
        document.querySelector("body").className = "dark-mode"
        document.getElementById("theme_toggle").src = "static/img/ui/light_mode.svg"
        config["dark-mode"] = true
    }
    store_data()
}

window.onload = init