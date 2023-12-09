/* 
    Code for global game ticks.
*/

function TickHandler(canvas) {
    this.canvas = canvas;
    this.ticks = 0;
    this.noTick = false;
}

TickHandler.prototype.tick = function () {
    if (this.noTick) return;

    let canvas = this.canvas;
 
    this.canvas.noTick = new Uint16Array(canvas.blocks.length);

    for (let i = 0; i < canvas.width * canvas.height; i++) {
        let cx = Math.floor(i / canvas.height);
        let cy = i % canvas.height;

        if (this.canvas.noTick[i]) continue;

        let currBlock = this.canvas.blocks[i];

        let allEq = true;

        if (this.ticks % 10 == 0) {
            new GameEvent('temp', mainTiles.tiles[currBlock], [cx, cy, this.ticks], this.canvas);
        }

        for (let x = -1; x < 2; x ++) {
            for (let y = -1; y < 2; y++) {
                let blok = this.canvas.getBlock(cx + x, cy + y);
    
                allEq = (blok == currBlock);
    
                if (!allEq) break;
            }
            if (!allEq) break;
        }
    
        if (allEq) continue;

        new GameEvent('tick', mainTiles.tiles[currBlock], [cx, cy, this.ticks], this.canvas);
    }

    for (let change of canvas.queuedChanges) {
        canvas.setBlock(change[0], change[1], change[2]);
    }
    canvas.queuedChanges = [];

    this.ticks++;
    this.ticks = this.ticks % 3600;
}
