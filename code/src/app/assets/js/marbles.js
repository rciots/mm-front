var socket = io();

socket.on('connect', function() {
    console.log('Connected to server');
});

// Desconectar el socket cuando el usuario navega a otra ruta
window.addEventListener('beforeunload', function() {
    socket.disconnect();
    console.log('Socket disconnected due to navigation');
});

let activePlayer = false;
let gameTimer = null;
let remainingTime = 90;

// Objeto para mantener el estado de las flechas y el pad
let movementState = {
    up: false,
    down: false,
    left: false,
    right: false
};

// Función para enviar el movimiento actual
function sendMovement() {
    if (!activePlayer) return;
    socket.emit('movement', movementState);
}

// Función para actualizar el estado de movimiento
function updateMovementState(direction) {
    // Reset all directions
    movementState.up = false;
    movementState.down = false;
    movementState.left = false;
    movementState.right = false;

    // Set active directions based on the input
    switch(direction) {
        case 'N':
            movementState.up = true;
            break;
        case 'S':
            movementState.down = true;
            break;
        case 'E':
            movementState.right = true;
            break;
        case 'W':
            movementState.left = true;
            break;
        case 'NE':
            movementState.up = true;
            movementState.right = true;
            break;
        case 'NW':
            movementState.up = true;
            movementState.left = true;
            break;
        case 'SE':
            movementState.down = true;
            movementState.right = true;
            break;
        case 'SW':
            movementState.down = true;
            movementState.left = true;
            break;
        case 'center':
            // All directions are already false
            break;
    }

    // Send the movement
    sendMovement();

    // Update pad position if available
    if (window.updatePadPosition) {
        window.updatePadPosition(direction);
    }
}

// Exponer la función updateMovementState al scope global
window.updateMovementState = updateMovementState;

socket.on('phase', function(phase) {
    console.log("phase:", phase);
    if (phase == 'preStart') {
        // start countdown function
        startCountdown();
    } else if (phase == 'start') {
        activePlayer = true;
        remainingTime = 90; // Reset timer
        startGameTimer();
        const event = new CustomEvent('startGame');
        window.dispatchEvent(event);
    } else if (phase == 'end') {
        // set direction to center and arrows to false
        direction = 'center';
        movementState.up = false;
        movementState.down = false;
        movementState.left = false;
        movementState.right = false;
        sendMovement();
        if (window.updatePadPosition) {
            window.updatePadPosition('center');
        }
        activePlayer = false;
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
        const event = new CustomEvent('endGame');
        window.dispatchEvent(event);
    } else if (phase == 'idle') {
        activePlayer = false;
        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
        // Reset game timer state
        const event = new CustomEvent('updateGameTimer', { 
            detail: { 
                time: null,
                isEnded: false
            } 
        });
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

// Manejadores de eventos para las teclas de flecha
document.addEventListener('keydown', function(event) {
    if (!activePlayer) return;
    
    let direction = 'center';
    
    if (event.code == 'ArrowUp') {
        movementState.up = true;
        if (movementState.right) direction = 'NE';
        else if (movementState.left) direction = 'NW';
        else direction = 'N';
    } else if (event.code == 'ArrowDown') {
        movementState.down = true;
        if (movementState.right) direction = 'SE';
        else if (movementState.left) direction = 'SW';
        else direction = 'S';
    } else if (event.code == 'ArrowLeft') {
        movementState.left = true;
        if (movementState.up) direction = 'NW';
        else if (movementState.down) direction = 'SW';
        else direction = 'W';
    } else if (event.code == 'ArrowRight') {
        movementState.right = true;
        if (movementState.up) direction = 'NE';
        else if (movementState.down) direction = 'SE';
        else direction = 'E';
    }

    sendMovement();
    if (window.updatePadPosition) {
        window.updatePadPosition(direction);
    }
});

document.addEventListener('keyup', function(event) {
    if (!activePlayer) return;
    
    let direction = 'center';
    
    if (event.code == 'ArrowUp') {
        movementState.up = false;
        if (movementState.right) direction = 'E';
        else if (movementState.left) direction = 'W';
        else if (movementState.down) direction = 'S';
    } else if (event.code == 'ArrowDown') {
        movementState.down = false;
        if (movementState.right) direction = 'E';
        else if (movementState.left) direction = 'W';
        else if (movementState.up) direction = 'N';
    } else if (event.code == 'ArrowLeft') {
        movementState.left = false;
        if (movementState.up) direction = 'N';
        else if (movementState.down) direction = 'S';
        else if (movementState.right) direction = 'E';
    } else if (event.code == 'ArrowRight') {
        movementState.right = false;
        if (movementState.up) direction = 'N';
        else if (movementState.down) direction = 'S';
        else if (movementState.left) direction = 'W';
    }

    sendMovement();
    if (window.updatePadPosition) {
        window.updatePadPosition(direction);
    }
});

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

function startCountdown() {
    let countdown = 3;
    const interval = setInterval(() => {
        const event = new CustomEvent('countdownUpdate', { detail: { count: countdown } });
        window.dispatchEvent(event);
        countdown--;
        if (countdown < 0) {
            activePlayer = true;
            clearInterval(interval);
            const startEvent = new CustomEvent('countdownUpdate', { detail: { count: 'GO!' } });
            window.dispatchEvent(startEvent);
        }
    }, 1500);
}

function startGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    gameTimer = setInterval(() => {
        remainingTime--;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        console.log("timeString:", timeString);
        const event = new CustomEvent('updateGameTimer', { 
            detail: { 
                time: timeString,
                isEnded: remainingTime <= 0
            } 
        });
        window.dispatchEvent(event);
        
        if (remainingTime <= 0) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
    }, 1000);
}