var socket = io();

socket.on('connect', function() {
    console.log('Connected to server');
}
);
// create arrows object with up, down, left and right
var arrows = {
    up: false,
    down: false,
    left: false,
    right: false
};
// capture when a arrow key is pressed and released and print in console
document.addEventListener('keydown', function(event) {
    if  ((event.code == 'ArrowUp') && (arrows.up == false)) {
        arrows.up = true;
        console.log('ArrowUp pressed');
    }else if ((event.code == 'ArrowDown') && (arrows.down == false)) {
        arrows.down = true;
        console.log('ArrowDown pressed');
    }else if ((event.code == 'ArrowLeft') && (arrows.left == false)) {
        arrows.left = true;
        console.log('ArrowLeft pressed');
    }else if ((event.code == 'ArrowRight') && (arrows.right == false)) {
        arrows.right = true;
        console.log('ArrowRight pressed');
    }else {
        return;
    }
    moveArrow();
}
);
document.addEventListener('keyup', function(event) {
    if ((event.code == 'ArrowUp') && (arrows.up == true)) {
        arrows.up = false;
        console.log('ArrowUp released');
    }else if ((event.code == 'ArrowDown') && (arrows.down == true)) {
        arrows.down = false;
        console.log('ArrowDown released');
    }else if ((event.code == 'ArrowLeft') && (arrows.left == true)) {
        arrows.left = false;
        console.log('ArrowLeft released');
    }else if ((event.code == 'ArrowRight') && (arrows.right == true)) {
        arrows.right = false;
        console.log('ArrowRight released');
    }else {
        return;
    }
    moveArrow();
}
);


// create function to be called when arrow key is pressed
function moveArrow() {
    console.log(arrows);
    socket.emit('movement', arrows);
    let direction = 'center';
    // set direction based on arrow keys pressed with optimal code, with one of: N, S, E, W, NE, NW, SE, SW 
    const verticalConflict = arrows.up && arrows.down;
    const horizontalConflict = arrows.left && arrows.right;
    if (verticalConflict || horizontalConflict) {
        direction = 'center';
    } else {
        const vertical = arrows.up ? 'N' : arrows.down ? 'S' : '';
        const horizontal = arrows.left ? 'W' : arrows.right ? 'E' : '';
        direction = vertical + horizontal;
        if (direction === '') {
            direction = 'center';
        }

    }
    console.log(direction);
    // set RosaVientosEstrellas direction
    const customEvent = new CustomEvent('changeDirection', { detail: { direction } });
    window.dispatchEvent(customEvent);
}