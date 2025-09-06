const footer = `
    <div class="tinted centered" style="position: fixed; bottom: 0; left: 0; width: 100%;">
        <img id="theme_toggle" class="inline_img" src="static/img/ui/dark_mode.svg" alt="Dark Mode Toggle" style="cursor: pointer;" onclick="toggle_dark_mode()">
        <span class="footer_text">Fractured Reach Campaign Editor [v0.1a] - by <a href="https://sossinaydev.github.io">sossinay</a></span>
        <p class="placeholder_tiny"></p>
    </div>`



var organizer_vars = {}
var currently_editing = ""

function new_project_prompt() {
    let name = prompt("Enter the project name")
    if (name != null && name != "" && !(name in Object.keys(projects))) {
        new_project(name)
        location.reload()
    }
}

function check_file() {
    let action = $("#topbar_file").value.toString().toLowerCase()
    $("#topbar_file").value = "File"
    $("#topbar_file").blur();
    if (action == "save") {
        store_data()
    }
    else if (action == "exit") {
        save_project()
        exit()
    }
    else if (action == "home") {
        current_level = null
        current_location = null
        store_data()
        window.location.reload()
    }
    else if (action == "export") {
        $("#campaign_meta").style.display = "none"
        $("#home_spaceholder").style.display = "none"
        $("#level_selector").style.display = "none"
        $("#location_selector").style.display = "none"
        $("#home_spaceholder_2").style.display = "none"
        $("#mission_editor").style.display = "none"
        $("#location_editor").style.display = "none"
        $("#export").style.display = "block"
        prepare_export()
    }
}

function check_edit() {
    let action = $("#topbar_edit").value.toString().toLowerCase()
    $("#topbar_edit").value = "Edit"
    $("#topbar_edit").blur();
}

function check_config() {
    let action = $("#topbar_config").value.toString().toLowerCase()
    $("#topbar_config").value = "Config"
    $("#topbar_config").blur();
}

function check_missions() {
    let action = $("#topbar_missions").value.toString()
    $("#topbar_missions").value = "Missions"
    $("#topbar_missions").blur();
    edit_level(action)
}

function check_locations() {
    let name = $("#topbar_locations").value.toString()
    let id = 0
    let i = 0
    projects[currently_editing].locations.forEach(location => {
        if (location.name == name) {
            id = i
        }
        i++
    });
    $("#topbar_locations").value = "Locations"
    $("#topbar_locations").blur();
    edit_location(id)
}

function check_about() {
    let action = $("#topbar_about").value.toString().toLowerCase()
    if (action == "about") {
        hide_all()
        $("#about").style.display = "block"
    }
    else if (action == "help") {
        hide_all()
        $("#help").style.display = "block"
    }
    else if (action == "faq") {
        hide_all()
        $("#faq").style.display = "block"
    }
    $("#topbar_about").value = "About"
    $("#topbar_about").blur();
}

function hide_all() {
    $("#campaign_meta").style.display = "none"
    $("#home_spaceholder").style.display = "none"
    $("#level_selector").style.display = "none"
    $("#location_selector").style.display = "none"
    $("#home_spaceholder_2").style.display = "none"
    $("#mission_editor").style.display = "none"
    $("#location_editor").style.display = "none"
    $("#export").style.display = "none"
    $("#help").style.display = "none"
    $("#about").style.display = "none"
    $("#faq").style.display = "none"
}

function update_namespace() {
    $("#campaign_id").value = to_valid($("#campaign_id").value)
}

function autosave() {
    store_data()
}

function new_level_prompt() {
    let name = prompt("Enter the mission name")
    if (name != null && name != "" && !(name in Object.keys(projects))) {
        new_level(name)
        store_data()
        window.location.reload()
    }
}

function new_location_prompt() {
    let name = prompt("Enter the location name")
    if (name != null && name != "" && !(name in Object.keys(projects))) {
        new_location(name)
        store_data()
        window.location.reload()
    }
}

function prepare_export() {
    let levels = projects[currently_editing].levels
    let i = 0
    levels.forEach(level => {
        console.log(level.name)
        let val = "checked"
        if (level.name.toLowerCase().includes("debug")) {
            console.log("Marked as debug")
            val = ""
        }
        $("#export_level_filter").innerHTML += `<input class="checkbox" type="checkbox" id="export_level_check_${i}" ${val}><label for="export_level_check_${i}">${level.name}</label><br>`
        i++
    });
}

setInterval(autosave, 2000)