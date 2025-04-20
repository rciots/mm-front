var socket = io();

socket.on('connect', function() {
    console.log('Connected to server');
});
let activePlayer = false;
socket.on('phase', function(phase) {
    if (phase == 'preStart') {
        // start countdown function
        startCountdown();
    } else if (phase == 'start') {
        activePlayer = true;
        const event = new CustomEvent('startGame');
        window.dispatchEvent(event);
    } else if (phase == 'end') {
        activePlayer = false;
        const event = new CustomEvent('endGame');
        window.dispatchEvent(event);
    }
});

socket.on('usersList', function(usersList) {
    // Disparar evento personalizado con la lista de usuarios
    const event = new CustomEvent('updatePlayersQueue', { detail: { usersList } });
    window.dispatchEvent(event);
});

socket.on('currentPlayers', function(currentPlayers) {
    // Disparar evento personalizado con los jugadores actuales
    const event = new CustomEvent('updateCurrentPlayers', { detail: { currentPlayers } });
    window.dispatchEvent(event);
});
socket.on('userValidation', function(userValidation) {
    if (!userValidation.valid) {
        const event = new CustomEvent('showJoinForm', { 
            detail: { 
                show: true,
                error: userValidation.message || 'El nombre de usuario ya está en uso'
            } 
        });
        window.dispatchEvent(event);
    }
});
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
    if (!activePlayer) {
        return;
    }
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

function validatePlayerName(name) {
    if (!name || name.length < 4) {
        const event = new CustomEvent('showJoinForm', { 
            detail: { 
                show: true,
                error: 'El nombre de usuario debe tener al menos 4 caracteres'
            } 
        });
        window.dispatchEvent(event);
        return false;
    }
    return true;
}

setTimeout(startCountdown, 2000);
// create countdown function without using DOM elements, I want it integrated with REACT
function startCountdown() {
    let countdown = 3;
    const interval = setInterval(() => {
        const event = new CustomEvent('countdownUpdate', { detail: { count: countdown } });
        window.dispatchEvent(event);
        countdown--;
        if (countdown < 0) {
            clearInterval(interval);
            const startEvent = new CustomEvent('countdownUpdate', { detail: { count: 'GO!' } });
            window.dispatchEvent(startEvent);
        }
    }, 1500);
}