/*
    Secure JSON loader for modding purposes.

    Unless you want to do something really fancy
    or provide a basis for more mods,
    do not use raw JavaScript.
    
    Instead, use a JSON file to contain your mod's
    content, and ask me for essential features to be
    added.

    This isn't finished entirely, but should give a
    decent basis for modding in the future.
*/

mods = [];

legalFuncs = [
    "gravity",
    "cohesion",
    "combine",
    "unGravity",
    "life",
    "temperature",
    "state",
    "duplicate"
]

function loadTiles(stuff) {
    for (item in stuff) {
        let params = stuff[item].params;
        stuff[item] = new Tile(stuff[item].color, stuff[item].name);
        for (let param of params) {
            if (legalFuncs.indexOf(param.func) == -1) {
                console.warn('This function is not supported!');
                continue;
            }
            stuff[item] = stuff[item][param.func](...param.options)
        }
    }
    return stuff;
}

function loadMod(stuff) {
    for (let thing of stuff) {
        mainTiles.loadSet(
            thing.namespace,
            loadTiles(thing.content)
        )
    }
}
/*
async function openMods(stuff) {
    // TODO: don't use prompt
    let url = prompt('Type in the URL to the JSON of the mod you want to load.');
    loadMod(await (await fetch(url)).json())
}*/

function openMods() {
    
    document.querySelector("#mod-loader-modal").classList.add("opened")
    
}
function closeMods() {
    
    document.querySelector("#mod-loader-modal").classList.remove("opened")
    
}



async function loadModFromForm() {
    
    document.querySelector("#mod-form input").disabled = true;
    let url = document.querySelector("#mod-form input").value;
    try {
        var mod = await fetch(url).then(e => e.json());
        // do stuff here, check if mod is ok, etc...
        alert("Mod loaded!")
        
        mods.push(mod)
    } catch(err) {
        alert("That mod isn't valid. Check the mod, and try again.")
    }
    document.querySelector("#mod-form input").disabled = false;
    
    
}


document.querySelectorAll(".mod-loader-tab").forEach(function(element, index){
    
    element.onclick = function() {
        
        document.querySelectorAll("#mod-loader-modal .selected-group").forEach(function(e) {e.classList.remove("selected-group")})
        element.classList.add("selected-group");
        document.querySelector(".mod-loader-tab-content:nth-child("+(index+1)+")").classList.add("selected-group");
        
    }
    
})
