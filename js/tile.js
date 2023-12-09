/*
    Code for configuring and appending tiles.

    Every item and block in the game is
    represented in one unified Tile class.

    A prototype of an API is provided 
    for players who wish to modify the game,
    to prevent conflicts from manually setting
    sections of an array. 
*/

var canGravity = [

];

function Tile(color, id) {
    this.color = color;

    this.id = id;
    this.number = -1;
    this.interactions = [];
    this.attributes = {};
    this.attributes.temperature = 0;
    this.attributes.conduct = 0.01;

    this.color = (color == 'none') ? [181,204,253,1/255] : color.replace(/^[^\(]+\(/,'').replace(/\)$/,'').split(',').map(x => 1 * x)
    if (color == 'random') this.color = [-1,-1,-1]; // ugly and hard-coded, but somehow faster?

    /*
        Interactions are used for dynamic functions that
        depend on world state, while attributes are used
        for block attributes that are static, or modified
        by other interactions.

        I highly suggest you define certain modifiers
        as a prototype of Tile that returns
        itself. This allows for prototype chaining
        within tile definitions.
    */
}

function TileManager(row, row2) {
    this.tiles = [];
    this.row = row;
    this.row2 = row2;
    this.sel = 0;
    
    this.used = {};

}

TileManager.prototype.loadSet = function (namespace, tiles) {
    let path = namespace.split('/');

    let elem = document.createElement('a');
    elem.textContent = namespace;
    elem.href = `#${namespace}`
    this.row.appendChild(elem);

    let elem2 = document.createElement('section');
    elem2.id = namespace
    this.row2.appendChild(elem2);


    for (let tile of tiles) {
        tile.namespace = namespace;
        tile.number = this.tiles.length;
        this.tiles.push(tile);

        canGravity[tile.number] = !tile.attributes.noGravity;

        if (path.indexOf('secret') != -1) continue;

        elem = document.createElement('button');
        elem.textContent = tile.id;
        elem2.appendChild(elem);

        elem.addEventListener('click', () => {
            this.sel = tile.number;
        })
    }
}

TileManager.prototype.resolveID = function (namespace, name) {
    let resolved = this.tiles
        .findIndex(tile =>
            tile.namespace == namespace &&
            tile.id == name
        );
    return resolved
}

TileManager.prototype.resolve = function (namespace, name) {
    let id = this.resolveID(namespace, name);
    return this.tiles[id];
}

var mainTiles = new TileManager(
    document.querySelector('.menu'),
    document.querySelector('.buttons')
);

/* 
    You can theoretically add more tile managers if desired, 
    but you probably shouldn't 
    if you don't know what you are doing.
*/