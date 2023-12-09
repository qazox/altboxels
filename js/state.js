/*
    Controls a block's state of matter.
*/

function state(event, state, temperature, isMin) {
    if (event.type != 'tick') return;
    
    let cx = event.data[0];
    let cy = event.data[1];
    let chunks = event.canvas;

    let temp = chunks.getBlock(cx, cy, true);

    if (chunks.noTick[cx*chunks.height + cy]) return;

    if ((temp > temperature) == isMin) {
        chunks.setBlock(cx, cy,  mainTiles.resolveID(state[0],state[1]));
        return true;
    }
}

Tile.prototype.state = function ( state2, temperature, isMin) {
    this.interactions.push(function (event) {
        state(event,  state2, temperature, isMin)
    });
    return this;
}