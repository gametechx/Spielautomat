const claw = document.getElementById('claw');
const coinsDisplay = document.getElementById('coins');
const triesDisplay = document.getElementById('tries');
const messageDisplay = document.getElementById('message');
const prizes = Array.from(document.querySelectorAll('.prize'));

let coins = 500;
let tries = 0;
let isGrabbing = false;
let clawPosition = { x: 350, y: 20 };

const settings = {
    moveSpeed: 10,
    costPerTry: 50,
    maxTries: 2,
    clawDownPosition: 350
};

// Initial position of prizes from HTML data attributes
prizes.forEach(prize => {
    const x = parseInt(prize.getAttribute('data-x'));
    const y = parseInt(prize.getAttribute('data-y'));
    prize.style.left = x + 'px';
    prize.style.bottom = y + 'px';
});

// Tastatursteuerung
document.addEventListener('keydown', (event) => {
    if (isGrabbing) return;

    let key = event.key.toLowerCase();

    // Check if coins are available for a new round
    if (tries >= settings.maxTries) {
        if (coins < settings.costPerTry) {
            messageDisplay.textContent = 'Nicht genug Münzen! Spiel beendet.';
            return;
        }
        messageDisplay.textContent = 'Du musst 50 Münzen bezahlen, um weitere 2 Versuche zu bekommen! Drücke Enter.';
        messageDisplay.classList.add('pulsate');
        
        if (key === 'enter') {
            payForTries();
        }
        return;
    }
    
    // Normal movement
    switch(key) {
        case 'a':
            if (clawPosition.x > 0) {
                clawPosition.x -= settings.moveSpeed;
            }
            break;
        case 'd':
            if (clawPosition.x < 740) {
                clawPosition.x += settings.moveSpeed;
            }
            break;
        case 's':
            if (clawPosition.y < 340) {
                clawPosition.y += settings.moveSpeed;
            }
            break;
        case 'w':
            if (clawPosition.y > 20) {
                clawPosition.y -= settings.moveSpeed;
            }
            break;
        case 'enter':
            handleGrab();
            break;
    }
    updateClawPosition();
});

function updateClawPosition() {
    claw.style.left = clawPosition.x + 'px';
    claw.style.top = clawPosition.y + 'px';
}

function handleGrab() {
    isGrabbing = true;
    messageDisplay.textContent = 'Greifarm senkt sich...';
    messageDisplay.classList.remove('pulsate');
    
    // Animiertes Senken des Greifarms
    claw.style.transition = 'top 1.5s ease-in';
    claw.style.top = settings.clawDownPosition + 'px';

    setTimeout(() => {
        let grabbedPrize = checkCollision();
        if (grabbedPrize) {
            handleSuccess(grabbedPrize);
        } else {
            handleFailure();
        }
    }, 1500); // Wartet auf die Greif-Animation
}

function handleSuccess(prize) {
    messageDisplay.textContent = 'Wow! Du hast etwas gefangen!';
    prize.classList.add('grabbed');
    setTimeout(() => {
        prize.style.display = 'none';
        messageDisplay.textContent = 'Glückwunsch! Du hast das Objekt zur Belohnung gebracht!';
        resetClaw();
    }, 1000);
}

function handleFailure() {
    messageDisplay.textContent = 'Leider nichts gefangen. Versuche es noch einmal!';
    resetClaw();
}

function resetClaw() {
    isGrabbing = false;
    // Setzt den Greifarm wieder in die Ausgangsposition
    claw.style.transition = 'top 1s ease-out, left 0.2s linear';
    claw.style.top = '20px';
    
    // Zählt den Versuch
    tries++;
    if (tries >= settings.maxTries) {
        messageDisplay.textContent = 'Versuche aufgebraucht. Drücke Enter, um 50 Münzen zu bezahlen.';
    }
    triesDisplay.textContent = `${tries} von ${settings.maxTries}`;
}

function payForTries() {
    coins -= settings.costPerTry;
    coinsDisplay.textContent = coins;
    tries = 0;
    messageDisplay.textContent = '50 Münzen bezahlt. Du hast 2 neue Versuche!';
    messageDisplay.classList.remove('pulsate');
    triesDisplay.textContent = `${tries} von ${settings.maxTries}`;
}

function checkCollision() {
    const clawRect = claw.getBoundingClientRect();
    const gameScreenRect = document.getElementById('game-screen').getBoundingClientRect();
    
    // Convert claw position to be relative to the game screen
    const clawX = clawRect.left - gameScreenRect.left;
    const clawY = clawRect.top - gameScreenRect.top;

    for (const prize of prizes) {
        if (prize.style.display === 'none') continue;
        
        const prizeRect = prize.getBoundingClientRect();
        
        const prizeX = prizeRect.left - gameScreenRect.left;
        const prizeY = prizeRect.top - gameScreenRect.top;

        // Simple collision check with a buffer
        if (
            clawX < prizeX + prizeRect.width &&
            clawX + clawRect.width > prizeX &&
            clawY < prizeY + prizeRect.height &&
            clawY + clawRect.height > prizeY
        ) {
            return prize;
        }
    }
    return null;
}