/*
    Code for saving and loading data.

    Features a somewhat efficient compression algorithm.
*/

function save() {
    let jason = {
        'pal': [],
        'data': [],
        'width': canvas.width,
        'height': canvas.height
    };

    for (let item of mainTiles.tiles) {
        jason.pal.push([
            item.namespace,
            item.id
        ])
    }

    let json = jason.data;

    for (let i = 0; i < canvas.blocks.length; i += 128) {
        let arr = canvas.blocks.slice(i, i + 128);

        let pal = Object.values(arr.filter((v, i, a) => a.findIndex(v2 => (v2 === v)) === i).sort());
        let otherArray;
        if (pal.length < 9 && pal.length > 1) {
            otherArray = new Uint8Array(64);

            for (let i in otherArray) {
                otherArray[i] = (((pal.indexOf(arr[i*2]) * 8) + pal.indexOf(arr[i*2+1])) + 'A'.charCodeAt()) % 128;
            }

        } else if (pal.length > 8) {
            otherArray = new Uint8Array(128);

            for (let i in otherArray) {
                otherArray[i] = (pal.indexOf(arr[i]) + 'A'.charCodeAt()) % 128;
            }

        }


        json[i / 128] = {
            'pal': pal,
            'dat': otherArray ? new TextDecoder('ascii').decode(otherArray) : undefined
        };
    }

    document.querySelector('#code').value = JSON.stringify(jason);
}

function load() {
    let jason = JSON.parse(document.querySelector('#code').value);

    let json = jason.data;

    canvas.width = jason.width;
    canvas.height = jason.height;
    canvas.resize();
    
    let mainPal = jason.pal.map(x => mainTiles.resolveID(x[0],x[1]));

    console.log(mainPal);

    for (let i in json) {
        let data = json[i];
        let pal = data.pal;
        let dat = new TextEncoder('ascii').encode(data.dat);

        let otherArray = new Uint16Array(128);

        if (pal.length < 2) {
            for (let i in otherArray) {
                otherArray[i] =  mainPal[(pal[0])];
            }
            
        } else if (pal.length < 9) {
            for (let i in dat) {
                otherArray[i*2] = mainPal[pal[((dat[i] - 'A'.charCodeAt()) & 0x38) / 8]];
                otherArray[i*2+1] =  mainPal[pal[(dat[i] - 'A'.charCodeAt()) & 0x7]];
            }
            
        } else {
            for (let i in dat) {
                otherArray[i] =  mainPal[pal[(dat[i] - 'A'.charCodeAt()) & 0x7F]];
            }
        }

        canvas.blocks.set(otherArray,Math.min(i*128,canvas.blocks.length - 128));
    }

    for (let i in canvas.temp) {
        canvas.temp[i] = mainTiles.tiles[canvas.blocks[i]].attributes.temperature;
    }
}

var loc3 = new URL(window.location).searchParams;
let loc = loc3.get("embed");
if (loc3.get('oops') == 'true') {
    alert('Oh no!');
}
var loc2;

if (loc) {
    (async function() {
        document.querySelector('#code').value = await fetch(loc).then(x => x.text());
        load();
        loc2 = loc3;
    })()
}