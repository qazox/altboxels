/*
    Code for rendering and startup.
*/

function Canvas(width, height, upscale) {
    this.width = width;
    this.height = height;
    this.upscale = upscale;
    this.radius = 2;

    this.x = 0;
    this.y = 0;

    this.elem = document.querySelector('canvas');
    this.ctx = this.elem.getContext('2d');

    this.blocks = new Uint16Array(width * height);
    this.temp = new Array(width * height); // This will not be saved in the world data.

    for (let i = 0; i < width * height; i++) {
        this.temp[i] = 0;
    }

    this.sel = -1;

    this.queuedChanges = [];

    let that = this;

    this.elem.addEventListener('mousedown', function (e) {
        that.clicked = true;
    });

    this.elem.addEventListener('mousemove', function (e) {
        that.pageX = e.pageX;
        that.pageY = e.pageY;
    })

    this.elem.addEventListener('wheel', function (e) {
        that.radius += Math.sign(e.deltaY);
        if (that.radius < 0) that.radius = 0;
    })

    this.elem.addEventListener('mouseup', function (e) {
        that.clicked = false;

        that.firstX = this.pageX;
        that.firstY = this.pageY;
    });


    this.clicked = false;
    this.pageX = 0;
    this.pageY = 0;

    this.resize();
}

Canvas.prototype.getBlock = function (x, y, doTemp) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        if (doTemp) return undefined;
        return -1;
    }
    return (doTemp ? this.temp : this.blocks)[x * this.height + y];
}

Canvas.prototype.setBlock = function (x, y, block, doTemp) {
    if (this.getBlock(x, y) == -1) return;
    (doTemp ? this.temp : this.blocks)[x * this.height + y] = block
}

Canvas.prototype.resize = function () {
    this.elem.style.width = this.width * this.upscale + 'px';
    this.elem.style.height = this.height * this.upscale + 'px';

    this.elem.width = this.width;
    this.elem.height = this.height;

    this.render();
}

Canvas.prototype.render = function () {
    this.ctx.clearRect(0, 0, this.width * this.upscale, this.height * this.upscale);

    let imgData = this.ctx.getImageData(0, 0, this.width, this.height);
    let pixels = imgData.data;

    let int = Math.ceil(this.width * this.height/8);
    for (let j = 0; j < 8; j++) {
        let that = this;
        (async function() {
            for (let i = j*int; i < (j+1)*int; i++) {
                if (i > that.width * that.height) break;
                let x = Math.floor(i / that.height);
                let y = i % that.height;
        
                let i2 = x + y*that.width;
        
                let block = mainTiles.tiles[that.blocks[i]];
        
                let temp = that.temp[i];
        
                if (block.color[0] != -1) {
        
                    let val = (temp + 310)/310;
                    if (val < -2.861) val = -2.861;
        
                    pixels[i2*4] = (block.color[0] - temp / 1e28) * val ;
                    pixels[i2*4+1] = (block.color[1] - temp / 1e28) * (val * 0.259 + 0.741);
                    pixels[i2*4+2] = (block.color[2] - temp / 1e28) *  (val * 0.023 + 0.977);
                    pixels[i2*4+3] = block.color[3] * 255 + Math.abs(val-1) * 100 || 255;
                } else {
                    let lg = Math.log(temp);
                    pixels[i2*4] = ((handler.ticks*69 ) % (lg*0.6969)) * 255 / (lg*0.6969);
                    pixels[i2*4+1] = ((handler.ticks*69)  % (lg*0.420420)) * 255 /(lg*0.420420);
                    pixels[i2*4+2] = ((handler.ticks*69)  % (lg*0.13371337)) * 255 /  (lg*0.13371337);
                    pixels[i2*4+3] = 255;
                }
            }
        })()
    }

    /* TODO: clean up */

    this.ctx.putImageData(imgData,0,0,0,0,this.width,this.height)

    if (window.loc2 && loc2.get('only') == 'true') {
        this.stopNow = true;
        document.querySelector('canvas').id = 'main2';
        document.querySelector('body').id = 'no-overflow';
        return;
    }

    let x = (this.pageX - this.elem.getBoundingClientRect().x - scrollX + this.x) - 0.5 - this.radius * this.upscale;
    let y = (this.pageY - this.elem.getBoundingClientRect().y - scrollY + this.y) - 0.5 - this.radius * this.upscale;

    
    this.ctx.globalAlpha = 1;

    this.ctx.strokeStyle = 'rgb(255,255,255)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x / this.upscale, y / this.upscale, this.radius * 2 + 2, this.radius * 2  + 2);

    let theX = Math.floor(x/this.upscale  + this.radius + 1);
    let theY = Math.floor(y/this.upscale   + this.radius + 1);



    let blok = mainTiles.tiles[this.getBlock(theX, theY)];
    let temp = this.getBlock(theX,theY, true);

    if (blok) {
        document.querySelector('.info').textContent = `${blok.namespace}; ${blok.id}; ${Math.round(temp+23)}deg Celsius`
    } else {
        document.querySelector('.info').textContent = `Unknown`
    }
  
}

/* TODO: cleanup again */
Canvas.prototype.click = function () {
    if (this.firstX == undefined) {
        this.firstX = this.pageX;
        this.firstY = this.pageY;
        return;
    }

    let x = (this.pageX - this.elem.getBoundingClientRect().x - scrollX + this.x) / this.upscale;
    let y = (this.pageY - this.elem.getBoundingClientRect().y - scrollY + this.y) / this.upscale;

    let x2 = (this.firstX - this.elem.getBoundingClientRect().x - scrollX + this.x) / this.upscale;
    let y2 = (this.firstY - this.elem.getBoundingClientRect().y - scrollY + this.y) / this.upscale;

    x = Math.floor(x);
    y = Math.floor(y);

    let x3 = x2 = Math.floor(x2);
    let y3 = y2 = Math.floor(y2);

    do {
        if (Math.abs(x3 - x) > Math.abs(y3 - y)) {
            x3 += Math.sign(x - x3)
        } else {
            y3 += Math.sign(y - y3)
        }

        for (let x4 = x3 - this.radius; x4 <= x3 + this.radius; x4++) {
            for (let y4 = y3 - this.radius; y4 <= y3 + this.radius; y4++) {

                let blox = this.getBlock(x4, y4);

                if (blox == -1) continue;

                this.setBlock(x4, y4, mainTiles.tiles[mainTiles.sel].attributes.temperature, true);
                this.setBlock(x4, y4, mainTiles.sel);
            }
        }

    } while (x3 != x && y3 != y)

    this.firstX = this.pageX;
    this.firstY = this.pageY;
}

var canvas = new Canvas(240, 135, 4);
var handler = new TickHandler(canvas);

setInterval(() => {
    if (canvas.stopNow) return;
        handler.tick();
}, 1000 / 60);


setInterval(() => {
    if (canvas.stopNow) return;
    if (canvas.clicked) canvas.click();
    this.canvas.render();
}, 1000 / 60);