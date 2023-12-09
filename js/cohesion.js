/*
    Code for cohesion. 
    Allows water to stick to itself.

    radius: How far out of blocks will contribute to sticking
    isAll: 
        If this is false or undefined, cohesion occurs (sticks to self)
        If this is true, adhesion and cohesion ocucrs (sticks to non-air)

*/

function cohesion(event, radius, isAll = 0) {
    if (event.type != 'tick') return;
    
    let cx = event.data[0];
    let cy = event.data[1];
    let chunks = event.canvas;

    let dir = [0, 0];
    let force = [0,0];

    let currBlock = chunks.getBlock(cx, cy);

    for (let x = -radius; x <= radius; x ++) {
        for (let y = -radius; y <= radius; y++) {
            let blok = chunks.getBlock(cx + x, cy + y);

            let factor = ((blok == currBlock) * (1-isAll)) + ((blok != air) * isAll);

            if (factor == 0) continue;

            let dist = 0.1 + (1/8 * (-x * -x - y * y + 8) * (x * x + y * y));

            force[0] += x / dist * factor;
            force[1] += y / dist * factor;
        }
    }

    if (force[0] == 0 && force[1] == 0) return;

    dir[0] = (Math.abs(force[0]) < radius*0.1) ? 0 : Math.sign(force[0]);
    dir[1] = (Math.abs(force[1]) < radius*0.1) ? 0 : Math.sign(force[1]);

    if (Math.abs(force[0]) < Math.abs(force[1])) {
        force[0] = 0
    } else {
        force[1] = 0
    }

    let offBlock = chunks.getBlock(cx + dir[0], cy + dir[1]);

    if (currBlock == -1 || offBlock == -1 || offBlock != air || currBlock == offBlock || chunks.noTick[(cx+dir[0])*chunks.height + (cy+dir[1])]) return;

    chunks.setBlock(cx, cy, offBlock);
    chunks.setBlock(cx + dir[0], cy + dir[1], currBlock);

    let t = chunks.getBlock(cx, cy,true);
    let t2 = chunks.getBlock(cx + dir[0], cy + dir[1],true);
    
    if (t != undefined && t2 != undefined) {
        chunks.setBlock(cx, cy,t2, true);
        chunks.setBlock(cx + dir[0], cy + dir[1], t, true);
    }

    return true;
}

Tile.prototype.cohesion = function (radius, isAll) {
    this.interactions.push(function (event) {
        cohesion(event, radius, isAll)
    });
    return this;
}