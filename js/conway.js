/*
    Conway's Game of Life.

*/

let queuedChanges = [];

function life(event, liveTile, deadTile) {
    if (event.type != 'tick') return;

    let cx = event.data[0];
    let cy = event.data[1];
    let chunks = event.canvas;

    let neighbors = 0;

    let currBlock = chunks.getBlock(cx, cy);

    liveTile = mainTiles.resolveID(liveTile[0], liveTile[1]);
    deadTile = mainTiles.resolveID(deadTile[0], deadTile[1]);

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x == 0 && y == 0) continue;
            let blok = chunks.getBlock(cx + x, cy + y);
            neighbors += (blok == liveTile) ? 1 : 0;
        }
    }

    if (currBlock == -1 || (currBlock != liveTile && currBlock != deadTile)) return;

    if ((neighbors < 2 || neighbors > 3) && currBlock != deadTile) {
       chunks.queuedChanges.push([cx, cy, deadTile])
    }

    if (neighbors == 3 && currBlock != liveTile) {
        chunks.queuedChanges.push([cx, cy, liveTile])
    }

    return true;

}

Tile.prototype.life = function (liveTile, deadTile) {
    this.interactions.push(function (event) {
        life(event, liveTile, deadTile)
    });
    return this;
}