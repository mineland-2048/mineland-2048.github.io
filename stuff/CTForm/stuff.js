//  This stores the textures themselves.
let textureList = [];

//  This stores what blocks use what textures;
//  It uses an id system to look up what entry in the textureList it should pull stuff from
let blockMap = {};      


class Block {
    constructor(x, y, id) {
        if (id != null && id != ""){
            this.id = id;           // namespace:block
        } else { 
            this.id = "minecraft:air" 
        }

        this.setTexture();      // texture applied. May be a texture class
        this.connections = "";  // blocks which connect
        this.state = "";        // top, bottom, left, right, corner, inner
        this.config = "";       // <MCP | Fusion | Athena | Chisel> class

        if(typeof(x) != 'number' || typeof(y) != 'number') {
            this.x = 0;
            this.y = 0;
            return;
        }

        this.x = x;
        this.y = y;
    }


    getBlock(grid, x, y) {
        if (x<0 || x >= grid[0].length || y<0 || y >= grid.length) return "minecraft:air";
        return grid[x][y].id;
    }

    updateAdjacentBlocks(grid) {
        let x = this.x; 
        let y = this.y;
        let space = {
            // topLeft,    top,    topRight,
            // left,               right,
            // bottomLeft, bottom, bottomRight
        };
        space.pos = `${x} ${y}`;
    
        space.topLeft     = this.getBlock(grid, x-1, y+1);
        space.top         = this.getBlock(grid, x,   y+1);
        space.topRight    = this.getBlock(grid, x+1, y+1);
    
        space.left        = this.getBlock(grid, x-1, y  );
        // space.center   = grid[x]  [y];  should probably delete this. Useless
        space.right       = this.getBlock(grid, x+1, y  );
    
        space.bottomLeft  = this.getBlock(grid, x-1, y-1);
        space.bottom      = this.getBlock(grid, x,   y-1);
        space.bottomRight = this.getBlock(grid, x+1, y-1);
        this.adjacentBlocks = space;
        return this.adjacentBlocks
    }

    getAdjacentBlocks(grid) {
        if (!this.adjacentBlocks) { this.updateAdjacentBlocks(grid); }
        return this.adjacentBlocks;
    }

    isSame(id){ return (blockMap[this.id] == blockMap[id]) }

    getTexture() {
        let composite = new Image();
        // console.log(this.texture);
        if (!this.texture) { return composite; }

        let blocks = [
            [
                this.isSame(this.adjacentBlocks.topLeft), 
                this.isSame(this.adjacentBlocks.top),
                this.isSame(this.adjacentBlocks.topRight)
            ],

            [
                this.isSame(this.adjacentBlocks.left),
                true,
                this.isSame(this.adjacentBlocks.right)
            ],

            [
                this.isSame(this.adjacentBlocks.bottomLeft),
                this.isSame(this.adjacentBlocks.bottom),
                this.isSame(this.adjacentBlocks.bottomRight)
            ]

        ]
        
        switch (this.texture.properties.format) {
            case 'MCP':
                composite.src = MCP.getTexture(this.texture, blocks).toDataURL();
                break;

        }

        return composite;



    }
    
    setTexture() {         
        let textureId = blockMap[this.id];
        this.texture = textureList[textureId];
    }
}

class Grid {
    grid = [];
    gridElement = document.createElement("grid");

    constructor(width, height) {
        if (typeof(width) != "number") { width = 3; }
        if (typeof(height) != "number") { height = 3; }

        this.width = width;
        this.height = height;

        for (let x=0; x<width; x++) {
            this.grid[x] = []

            for (let y=0; y<height; y++) {
                let block = new Block(x, y);
                this.grid[x][y] = block;
            }
        }

        this.updateView();
    }

    addBlock(block) {
        this.grid[block.x][block.y] = block;
        this.updateView();

    }



    updateView() {
        this.gridElement.replaceChildren();

        for(let y=0; y<this.height; y++) {
            let row = document.createElement("row");
            this.gridElement.appendChild(row);

            for (let x=0; x<this.width; x++) {
                let element = document.createElement("block");
                let block = this.grid[x][y];

                let texture = `${block.texture}`;

                this.grid[x][y].updateAdjacentBlocks(this.grid)

                texture = this.grid[x][y].getTexture();
                // THIS HERE IS WHERE THE TEXTURE IS APPLIED
                
                element.style.backgroundImage = `url(${texture.src})`;
                element.setAttribute("x", x);
                element.setAttribute("y", y);
                row.appendChild(element);
            }
        }


    }

}



class Texture {
    width = 0;
    height = 0;
    
    constructor(type, fileSrc, properties) {
        let texture = this;

        this.type = type;
        this.image = fileSrc;

        if (properties == 'none' || !properties) { this.properties = ''; } else {


        let h = "";
        h = properties.raw;

        // regex sorcery

        h = h.replace(/(\w+)\s*=\s*([^]+?)\s*(?=\w+=|$)/g, '"$1":"$2"');
        h = h.replace(/""/g, '","');
        h = h.replace(/\s+/g, ' ');
        h = '{' + h + '}';
        

        
        // console.log(h);

        let propertiesJSON = JSON.parse(h);

        let matchBlocks = propertiesJSON.matchBlocks;
        matchBlocks = '{"applies":["' + matchBlocks.replace(/ /g, '","') + '"]}';

        // console.log(matchBlocks);

        matchBlocks = JSON.parse(matchBlocks);

        this.applies = matchBlocks.applies;
        
        // console.log(matchBlocks);

        properties.value = propertiesJSON;

        this.properties = properties;

        matchBlocks.applies.forEach(element => {
            // console.log(element);
            blockMap[element] = textureList.length;

        });
    }
        textureList.push(texture);
        // console.log(textureList);

    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    split(method) {
        let sprite = [];
        
        let source = new Image();
        source.src = this.image

        let canvas = document.createElement("canvas");
        let canvaContext = canvas.getContext("2d");
        
        canvas.width = source.width;
        canvas.height = source.height;
        canvaContext.drawImage(source, 0, 0);
        
        // document.body.insertAdjacentElement("afterbegin", canvas);
        // console.log("load image");

        let blocklength = 0;
        let blockheight = 0;

        switch (method) {
            case "ctm":
                blocklength = 12;
                blockheight = 4;
                break;

            case "ctm_compact":
                blocklength = 5;
                blockheight = 1;
                break;

            case "overlay":
                blocklength = 7;
                blockheight = 3;
                break;

            default: // horizontal, vertical
                blocklength = 4;
                blockheight = 1;
                break;
        }
        // console.log(method);
        let sizedWidth = (source.width) / (blocklength);
        let sizedHeight = (source.height) / (blockheight);

        // console.info("STARTING THING NOW");
        // console.log(`originalSize: ${source.width} * ${source.height} -> ${blocklength}*${blockheight}`)
        // console.log(`textureSize: ${sizedWidth} * ${sizedHeight}`)

        for (let i = 0; i < blockheight; i ++) {
            // console.info("i LOOP: ", i);
            for (let j = 0; j < blocklength; j ++) {
                // console.info('j LOOP', j);

                try {
                    let posX = - j*sizedWidth;
                    let posY = - i*sizedHeight;

                    let element = document.createElement('canvas');
                    let context = element.getContext('2d');

                    element.width = sizedWidth;
                    element.height = sizedHeight;
                    context.drawImage(source, posX, posY);

                    sprite.push(element);

                } catch (e) { console.error(e); }
            }
        }
        
        // console.info("sprite about to be returned")
        this.width = sizedWidth;
        this.height = sizedHeight;
        this.sprite = sprite;
        return sprite;
    }
}


