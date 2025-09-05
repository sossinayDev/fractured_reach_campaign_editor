const VERSION = "0.1a"

const id_chars = "qwertzuiopasdfghjklyxcvbnm_-1234567890()"
let current_level = null
let current_location = null

const defaults = {
    "briefing": {
        "type": "briefing",
        "title": "My briefing",
        "text": "This is command of the %P campaign!\nPage two\n***\nPage three"
    },
    "survive": {
        "type": "survive",
        "title": "Survive",
        "duration": "10"
    },
    "reach_waypoint": {
        "type": "reach_waypoint",
        "title": "Reach the waypoint",
        "waypoint_id": "waypoint_alpha"
    },
    "destroy": {
        "type": "destroy",
        "title": "Destroy the drone",
        "target": "drone_1"
    },
    "hyperspace_jump": {
        "type": "hyperspace_jump",
        "title": "Jump to hyperspace",
        "dir_x": "0",
        "dir_y": "0"
    }
}

function $(selector) {
    return document.querySelector(selector)
}

function load_data(data_only = false) {

    let projects_tmp = JSON.parse(localStorage.getItem("fractured_reach_campaign_editor_projects"))
    if (typeof (projects_tmp) == "object") {
        projects = projects_tmp
    }
    else {
        projects = {}
    }
    if (projects == null) {
        projects = {}
    }

    if (!data_only) {
        let tmp = JSON.parse(localStorage.getItem("fractured_reach_campaign_editor_config"))
        if (typeof (tmp) == "object" && tmp != null) {
            config = tmp
        }
        if (config["dark-mode"] == true) {
            document.querySelector("body").className = "dark-mode"
            document.getElementById("theme_toggle").src = "static/img/ui/light_mode.svg"
        }
    }

    currently_editing = localStorage.getItem("fractured_reach_campaign_editor_current_project")
    current_level = localStorage.getItem("fractured_reach_campaign_editor_current_level")
    current_location = localStorage.getItem("fractured_reach_campaign_editor_current_location")
    if (current_level == "null") {
        current_level = null
    }
    if (current_location == "null") {
        current_location = null
    }
}

function move_up_objective(obj) {
    let data = get_level_data(current_level)
    let obj_data = data.objectives[obj]
    if (data.objectives.length > 1 && obj > 0) {
        let first = data.objectives[obj - 1]
        data.objectives[obj - 1] = obj_data
        data.objectives[obj] = first
        set_level_data(current_level, data)
        store_data(false)
        document.location.reload()
    }
}

function new_location(name) {
    let data = projects[currently_editing]
    if (data["locations"] == null){
        data["locations"] = []
    }
    let loc_data = {
        name: to_valid(name).trim(),
        id: to_valid(name).trim(),
        objects: [],
        background: "bg.png"
    }
    data["locations"].push(loc_data)
    projects[currently_editing]=data
}


function move_down_objective(obj) {
    let data = get_level_data(current_level)
    let obj_data = data.objectives[obj]
    if (data.objectives.length > 1 && obj < data.objectives.length - 1) {
        let last = data.objectives[parseInt(obj) + 1]
        data.objectives[parseInt(obj) + 1] = obj_data
        data.objectives[obj] = last
        set_level_data(current_level, data)
        store_data(false)
        document.location.reload()
    }
}

function delete_objective(obj) {
    let data = get_level_data(current_level)
    data.objectives.splice(obj, 1)
    set_level_data(current_level, data)
    store_data(false)
    document.location.reload()
}

function store_data(save_pr = true) {
    if (window.location.href.includes("editor.html") && save_pr) {
        save_project()
    }
    localStorage.setItem("fractured_reach_campaign_editor_config", JSON.stringify(config))
    localStorage.setItem("fractured_reach_campaign_editor_projects", JSON.stringify(projects))
    localStorage.setItem("fractured_reach_campaign_editor_current_level", current_level)
    localStorage.setItem("fractured_reach_campaign_editor_current_location", current_location)
}

function to_valid(text) {
    let result = ""
    text = text.toLowerCase().replace(" ", "_")
    text.split("").forEach(char => {
        if (id_chars.includes(char)) {
            result += char
        }
    });
    return result
}

function new_project(name) {
    projects[name] = {
        "name": name,
        "namespace": to_valid(name),
        "levels": [],
        "editor_version": VERSION,
        "finish": "Congrats!",
        "files": {}
    }
    store_data()
}

function delete_project(name) {
    if (!confirm(`Do you really want to delete the campaign "${name}"? This is irreversible!`)) {
        return
    }
    delete projects[name]
    store_data()
    window.location.reload()
}

function delete_level(name) {
    if (!confirm(`Do you really want to delete the mission "${projects[currently_editing].levels[name].name}"? This is irreversible!`)) {
        return
    }
    delete projects[currently_editing].levels.splice(name, 1)
    store_data()
    window.location.reload()
}

function rename_level(name) {
    let new_name = prompt(`Enter the new name for the mission "${projects[currently_editing].levels[name].name}"`)
    new_name = to_valid(new_name).trim()
    if (new_name == null || new_name == "") {
        return
    }
    projects[currently_editing].levels[name].name = new_name
    save_project()
    window.location.reload()
}

function save_project() {
    let data = get_level_data(current_level)
    data.locations = {
        "start": $("#mission_start_location").value
    }

    let objective_divs = document.querySelectorAll(".mission_objective")
    let obj_data = get_level_data(current_level).objectives || []
    let i = 0
    let new_obj_data = []
    objective_divs.forEach(objective_dir => {
        let o_data = obj_data[i]
        if (o_data) {
            let type = o_data.type

            let new_data = {
                type: type
            }
            if (type == "briefing") {
                new_data.title = $(`#input_${i}_title`).value
                new_data.text = $(`#input_${i}_text`).value
            }
            else if (type == "survive") {
                new_data.title = $(`#input_${i}_title`).value
                new_data.duration = $(`#input_${i}_duration`).value
            }
            else if (type == "reach_waypoint") {
                new_data.title = $(`#input_${i}_title`).value
                new_data.waypoint_id = $(`#input_${i}_waypoint_id`).value
            }
            else if (type == "destroy") {
                new_data.title = $(`#input_${i}_title`).value
                new_data.target_id = $(`#input_${i}_object_id`).value
            }
            else if (type == "hyperspace_jump") {
                new_data.title = $(`#input_${i}_title`).value
                new_data.dir_x = $(`#input_${i}_dir_x`).value
                new_data.dir_y = $(`#input_${i}_dir_y`).value
                new_data.new_location = $(`#input_${i}_new_location`).value
                data.locations[$(`#input_${i}_new_location`).value] = $(`#input_${i}_new_location`).value
            }

            new_obj_data.push(new_data)
        }
        i++;
    });
    
    data.objectives = new_obj_data
    data.finish = {
        "text": $("#mission_finish_text").value
    }
    
    
    set_level_data(current_level, data)


    let project_data = {
        "name": $("#campaign_name").value.trim(),
        "namespace": to_valid($("#campaign_id").value),
        "finish": $("#campaign_finish_text").value,
        "editor_version": VERSION,
        "levels": projects[currently_editing].levels || [],
        "locations": projects[currently_editing].locations || []
    }
    projects[currently_editing] = project_data
    localStorage.setItem("fractured_reach_campaign_editor_projects", JSON.stringify(projects))
}

function get_level_data(search_name) {
    if (currently_editing == null || search_name == null) {
        return {}
    }
    let result = {}
    projects[currently_editing].levels.forEach(level => {
        if (level.name.toLowerCase().trim() == search_name.toLowerCase().trim()) {
            result = level
        }
    });
    return result
}

function set_level_data(search_name, data) {
    if (currently_editing == null || search_name == null) {
        return {}
    }
    projects[currently_editing].levels.forEach(level => {
        if (level.name.toLowerCase().trim() == search_name.toLowerCase().trim()) {
            level = data
        }
    });
}

function load_project() {
    load_data(data_only = true)
    let project_data = projects[currently_editing]
    $("#campaign_name").value = project_data.name
    $("#campaign_id").value = project_data.namespace
    $("#campaign_finish_text").value = project_data.finish
    organizer_vars[$("#level_selector")] = project_data.levels || []

    project_data.levels.forEach(level => {
        $("#topbar_missions").innerHTML += `<option>${level.name}</option`
    });

    project_data.locations.forEach(location => {
        $("#topbar_locations").innerHTML += `<option>${location.name}</option`
    });
}


function add_objective() {
    let type = to_valid($("#objective_type").value).trim()
    let data = get_level_data(current_level)
    l = data.objectives || []
    let default_vals = defaults[type]
    let objective_data = {}
    for (dv in default_vals) {
        objective_data[dv] = default_vals[dv].replace("%P", projects[currently_editing].name)
    }
    l.push(objective_data)
    data["objectives"] = l
    set_level_data(current_level, data)
    store_data(false)
    document.location.reload()
}


function edit_level(name) {
    localStorage.setItem("fractured_reach_campaign_editor_current_location",null)
    localStorage.setItem("fractured_reach_campaign_editor_current_level", name)
    window.location.reload()
}

function edit_location(location) {
    localStorage.setItem("fractured_reach_campaign_editor_current_level", null)
    localStorage.setItem("fractured_reach_campaign_editor_current_location",location)
    window.location.reload()
}



function new_level(name) {
    name = to_valid(name).trim()
    if (name == "null") {
        return
    }
    let project_data = projects[currently_editing]
    let levels = project_data["levels"] || []
    levels.push({
        "name": name,
        "locations": {},
        "fail_triggers": [],
        "objectives": [],
        "finish": {}
    })
    project_data["levels"] = levels
    projects[currently_editing] = project_data
    store_data()
    document.location.reload()
}



function exit() {
    localStorage.removeItem("fractured_reach_campaign_editor_current_project")
    window.location.href = "index.html"
}
