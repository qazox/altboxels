/*
    Code for element combinations.
    TOOD: clean this up too
*/

function combine(event, inBlock, outBlock, outBlock2, mustAir = false) {
    if (event.type != 'tick') return;

    let cx = event.data[0];
    let cy = event.data[1];
    let chunks = event.canvas;

    let dir = [0, 0];
    let currBlock = chunks.getBlock(cx, cy);

    for (let x = -1; x < 2; x++) {
        for (let y = 1; y >= -1; y--) {
            if (chunks.getBlock(cx + x, cy + y) == inBlock) {
                dir = [x, y];
                continue;
            }
        }
    }

    let offBlock = chunks.getBlock(cx + dir[0], cy + dir[1]);
    let offBlock2 = chunks.getBlock(cx + dir[0], cy + dir[1] - 1);

    if (mustAir && offBlock2 != air) return;
    if (currBlock == -1 || offBlock == -1 || offBlock != inBlock || currBlock == offBlock || chunks.noTick[(cx + dir[0]) * chunks.height + (cy + dir[1])]) return;

    chunks.setBlock(cx, cy, outBlock);
    chunks.setBlock(cx + dir[0], cy + dir[1], outBlock2);

    return true;
}

Tile.prototype.combine = function (inBlock, outBlock2, outBlock, mustAir = false) {
    let that = this;

    setTimeout(function() {

        inBlock =  mainTiles.resolveID(inBlock[0],inBlock[1]);
        outBlock = mainTiles.resolveID(outBlock[0],outBlock[1]);
        outBlock2 = mainTiles.resolveID(outBlock2[0],outBlock2[1]);
    
        that.interactions.push(function (event) {
    
            combine(event, inBlock, outBlock, outBlock2, mustAir)
        });
    },200)

    return this;
}