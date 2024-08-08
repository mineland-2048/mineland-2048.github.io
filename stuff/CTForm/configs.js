class mcpConfig {
    // constructor(filename) {
    //     if (filename != "") {
    //         this.filename = filename;       // Sets the name of the config 
    //     }

    //     this.matchTiles = [];           // List of matching tile names
    //     this.matchBlocks = [];          // List of blocks + optional properties
    //     this.weight = 0;                // Weight for tie-breaking
    //     this.method = "";               // Method for choosing a block's replacement texture
    //     this.tiles = [];                // List of replacement tiles
    //     this.connect = "";              // Connect type

    //     this.connectTiles = [];         // Connect tiles (only for overlay method)
    //     this.connectBlocks = [];        // Connect blocks (only for overlay method)

    //     this.faces = "";                // Faces to limit the mod to
    //     this.biomes = [];               // Biome restrictions
    //     this.heights = [];              // Height restrictions
    //     this.ctm = {};                  // Compact CTM tile replacement (only for ctm_compact method)

    //     this.tintIndex = -1;            // Tint index (only for overlay method)
    //     this.tintBlock = "";            // Tint block (only for overlay method)
    //     this.layer = "cutout_mipped";   // Layer (only for overlay method)
    //     this.name = "";                 // Name (only for nameable tile entities)
    
    //     // Specific ctm methods
    //     this.ctmMethod = "";            // Method for connected textures
    //     this.ctmTiles = [];             // List of tiles for connected textures
    //     this.innerSeams = false;        // Show seams on inner edges or not

    //     this.randomLoops = 0;           // Random loops (only for random method)
    //     this.symmetry = "none";         // Symmetry for faces (only for random method)
    //     this.linked = false;            // Linked property (only for random method)

    //     this.repeatWidth = 0;           // Width of the repeating pattern (only for repeat method)
    //     this.repeatHeight = 0;          // Height of the repeating pattern (only for repeat method)
    //     this.repeatTiles = [];          // List of tiles for repeating pattern (only for repeat method)
    // }

    getTexture(texture, grid) {
        let result = "img";
        switch (texture.type) {
            case "ctm_compact":
                // console.log("type is compact");
                result = this.ctmCompact(texture, grid); 
            break;
        }
        // console.log("bruh");
        return result;
    }

    ctmCompact(texture, grid) {
        let composite = document.createElement('canvas');
        composite.width = texture.width;
        composite.height = texture.height;

        let quadWidth = texture.width / 2;
        let quadHeight = texture.height / 2;

        let compositeContext = composite.getContext('2d');
        
        // let top = false;
        // let side = false;
        // let corner = false;
        
        let quads = {
            topLeft: {
                x: 0,
                y: 0,
                top:    grid[0][1],
                side:   grid[1][0],
                corner: grid[0][0],
            },
            topRight: {
                x: quadWidth,
                y: 0,
                top:    grid[0][1],
                side:   grid[1][2],
                corner: grid[0][2]
            },
            bottomLeft: {
                x: 0,
                y: quadHeight,
                top:    grid[2][1],
                side:   grid[1][0],
                corner: grid[2][0]
            },
            bottomRight: {
                x: quadWidth,
                y: quadHeight,
                top:    grid[2][1],
                side:   grid[1][2],
                corner: grid[2][2]
            }
        }

        //  TEXTURE MAPPING
        // 0 = none
        // 1 = all
        // 2 = side only
        // 3 = top only
        // 4 = side and top only
        let setQuad = (edge) => {
            if (!quads[edge].side && !quads[edge].top) { return 0; }
            if (quads[edge].top && quads[edge].side && quads[edge].corner) { return 1; }
            if (quads[edge].top && quads[edge].side) { return 4; } 
            if (quads[edge].side) { return 3; }
            if (quads[edge].top) { return 2; }
        }


        let cache = document.createElement('canvas');
        cache.width = quadWidth;
        cache.height = quadHeight;

        let cacheContext = cache.getContext('2d');

        for (const edge in quads) {
            cacheContext.drawImage(texture.sprite[setQuad(edge)], -quads[edge].x, -quads[edge].y);
            compositeContext.drawImage(cache, quads[edge].x, quads[edge].y);
            // console.log(edge);
        }    
 
        // console.log(quads);
        return composite;
    }
}
  
const MCP = new mcpConfig();

