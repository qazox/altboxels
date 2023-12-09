/*
    Code for element combinations.
    TOOD: clean this up too
*/

function duplicate(event) {
    if (event.type != 'tick') return;

    let cx = event.data[0];
    let cy = event.data[1];
    let chunks = event.canvas;

    let maxMass = -1;
    let currBlock = chunks.getBlock(cx, cy);
    let dir = [0,0];

    for (let x = -1; x < 2; x++) {
        for (let y = 1; y >= -1; y--) {
            let blok = chunks.getBlock(cx + x, cy + y);
            
            let mass = (blok != -1 && blok) ? mainTiles.tiles[blok].attributes.mass : 0;

            if (mass > maxMass && blok != currBlock) {
                dir = [x,y];
                maxMass = mass;
            }
        }
    }

    let offBlock = chunks.getBlock(cx + dir[0], cy + dir[1]);
    let offTemp = chunks.getBlock(cx + dir[0], cy + dir[1], true);

    if (currBlock == -1 || offBlock == -1 || offBlock == currBlock) return;

    for (let x = -1; x < 2; x++) {
        for (let y = 1; y >= -1; y--) {
            
            let blok = chunks.getBlock(cx + x, cy + y);
            let oldTemp = chunks.getBlock(cx + x, cy + y, true);
            
            if (oldTemp < -300) oldTemp = -300;

            if (blok == currBlock) continue;
            chunks.setBlock(cx + x, cy + y, offBlock);
            chunks.setBlock(cx + x, cy + y, offTemp + oldTemp * 0.01, true);
        }
    }

    return true;
}

Tile.prototype.duplicate = function () {
    let that = this;

    that.interactions.push(function (event) {
        duplicate(event)
    });

    return this;
}