/*
    Code for gravity.

    mass: Density (in kg/cm^3)
    fluid: Spread of substance
    saturation: Maximum mass for gravity reactions to occur
*/

function gravity(event, mass, fluid, saturation) {
    if (event.type != 'tick') return;
    
    let cx = event.data[0];
    let cy = event.data[1];
    let chunks = event.canvas;

    let dir = [0, 0];
    let force = [0,0];
    let density = 0;

    let currBlock = chunks.getBlock(cx, cy);


    for (let x = -1; x < 2; x ++) {
        for (let y = -1; y < 2; y++) {
            let blok = chunks.getBlock(cx + x, cy + y);
            
            if (blok == -1) continue;

            let mass2 = mainTiles.tiles[blok].attributes.mass;

            density += mass2;
            if (density > saturation) break;

            if (blok == currBlock) continue;

            let massDiff = (mass / mass2) - (mass2 / mass);
            let x2 = x / fluid;
            let dirDiff = (y - 1 + fluid) / (1/8 * (x2 * x2 - y * y + 8) * (x2 * x2 + y * y));


            if (y == 0 && x == 0) dirDiff = 0;
            if (isNaN(dirDiff)) dirDiff = 0;

            force[0] += massDiff * x2;
            force[1] += massDiff * dirDiff * y;
        }
        if (density > saturation) break;
    }

    dir[0] = (Math.abs(force[0]) < .5) ? 0 : Math.sign(force[0]);
    dir[1] = (Math.abs(force[1]) < .5) ? 0 : Math.sign(force[1]);

    if (density > saturation ) {
        return;
    }

    let offBlock = chunks.getBlock(cx + dir[0], cy + dir[1]);

    if (currBlock == offBlock && density <= saturation) {
        dir[0] = Math.sign(force[0]);
        offBlock = chunks.getBlock(cx + dir[0], cy + dir[1]);
    }

    if (currBlock == -1 || offBlock == -1 || currBlock == offBlock ||offBlock == undefined || mainTiles.tiles[offBlock].attributes.saturation / 9 < mass || chunks.noTick[(cx+dir[0])*chunks.height + (cy+dir[1])]) return;


    
    if (!canGravity[offBlock]) return;

    chunks.noTick[cx*chunks.height + cy] = true;
    chunks.noTick[(cx+dir[0])*chunks.height + (cy+dir[1])] = true;

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

Tile.prototype.gravity = function (mass, fluid, saturation) {
    this.interactions.push(function (event) {
        gravity(event, mass, fluid, saturation)
    });
    this.attributes.mass = mass;
    this.attributes.saturation = saturation;
    return this;
}

Tile.prototype.unGravity = function () {
    this.attributes.noGravity = true;
    return this;
}