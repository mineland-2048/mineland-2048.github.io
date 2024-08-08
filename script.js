function bgInit() {
    const bg = document.getElementById("background");
    bg.className = 'background';


    let index = 100 / 17;
    for (let i=1; i < 17; i++) {

        let order = i*70;
        
        let element = document.createElement("bgElement");
            
        let size = 5 + (10 * Math.random());
        
        let posX = 100 * Math.random();
        let posY = (index * i) + (5 * Math.random());
        
        element.style.setProperty('--bgImage', `url('background/shape${i}.svg')`)
        element.style.width = `${size}vh`;
        element.style.height = `${size}vh`;
        
        element.style.left = `${posX}vw`;
        element.style.top = `${posY}vh`;
        element.style.rotate = '' + (360 * Math.random()) + 'deg';
        element.style.setProperty('--delay', `${order}s`)
        let rot = 1;
        if (size < 10) { rot = -1;}
        element.style.setProperty('--rotation', `${rot}`)
        element.style.setProperty('--rotation-speed', `${Math.round(size) * 5}s`)
        
            
            
            
        setTimeout(() => { bg.appendChild(element);}, order)
    }
}
