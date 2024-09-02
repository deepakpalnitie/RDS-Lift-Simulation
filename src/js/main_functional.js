/**
 * Creates the initial state for the lift simulation
 * @param {number} floors - The number of floors in the building
 * @param {number} lifts - The number of lifts in the building
 * @returns {Object} The initial state of the simulation
 */
function createInitialState(floors, lifts) {
    return {
        floors,
        lifts,
        liftStates: Array(lifts).fill().map(() => ({ currentFloor: 1, status: 'idle' })),
        floorCalls: Array(floors + 1).fill().map(() => ({ up: false, down: false })),
        pendingCalls: []
    };
}

/**
 * Renders the simulation UI
 * @param {Object} state - The current state of the simulation
 */
function renderSimulation(state) {
    const container = document.getElementById('simulation-container');
    container.innerHTML = '';

    for (let i = 1; i <= state.floors; i++) {
        const floor = document.createElement('div');
        floor.className = 'floor';
        floor.innerHTML = `
            <div class="floor-buttons" data-floor="${i}">
                ${i < state.floors ? `<button class="up-button" data-floor="${i}">Up</button>` : ''}
                ${i > 1 ? `<button class="down-button" data-floor="${i}">Down</button>` : ''}
            </div>
            <div class="floor-number">Floor ${i}</div>
        `;

        for (let j = 0; j < state.lifts; j++) {
            const liftShaft = document.createElement('div');
            liftShaft.className = 'lift-shaft';
            if (i === 1) {
                const lift = document.createElement('div');
                lift.className = 'lift';
                lift.id = `lift-${j + 1}`;
                lift.style.bottom = '0px';
                lift.innerHTML = `
                    <div class="lift-number">${j + 1}</div>
                    <div class="lift-door left"></div>
                    <div class="lift-door right"></div>
                `;
                liftShaft.appendChild(lift);
            }
            floor.appendChild(liftShaft);
        }

        container.appendChild(floor);
    }
}

/**
 * Attaches event listeners to floor buttons
 * @param {Object} state - The current state of the simulation
 * @param {Function} callLift - The function to call when a lift is requested
 */
function attachEventListeners(state, callLift) {
    document.querySelectorAll('.up-button, .down-button').forEach(button => {
        const handleEvent = (e) => {
            e.preventDefault(); // Prevent default touch behavior
            const floor = parseInt(e.target.dataset.floor);
            const direction = e.target.classList.contains('up-button') ? 'up' : 'down';
            callLift(state, floor, direction);
        };

        button.addEventListener('click', handleEvent);
        button.addEventListener('touchstart', handleEvent);
    });
}

/**
 * Finds the nearest idle lift to respond to a call
 * @param {Object} state - The current state of the simulation
 * @param {number} floor - The floor where the call was made
 * @returns {number} The index of the nearest idle lift, or -1 if no idle lifts
 */
function findNearestIdleLift(state, floor) {
    let nearestLift = -1;
    let minDistance = Infinity;

    for (let i = 0; i < state.lifts; i++) {
        if (state.liftStates[i].status === 'idle') {
            const distance = Math.abs(state.liftStates[i].currentFloor - floor);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLift = i;
            }
        }
    }

    return nearestLift;
}

/**
 * Opens and closes the doors of a lift
 * @param {HTMLElement} lift - The lift element
 */
async function openCloseDoors(lift) {
    const leftDoor = lift.querySelector('.lift-door.left');
    const rightDoor = lift.querySelector('.lift-door.right');

    // Open doors - quick start, slow finish
    leftDoor.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    rightDoor.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    leftDoor.classList.add('open');
    rightDoor.classList.add('open');

    // Add tom.gif background
    const background = document.createElement('div');
    background.className = 'lift-background';
    lift.appendChild(background);

    // Show the background
    setTimeout(() => {
        background.style.opacity = 1;
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Close doors - slow start, quick finish
    leftDoor.style.transition = 'transform 2.5s cubic-bezier(0.75, 0, 0.75, 0.9)';
    rightDoor.style.transition = 'transform 2.5s cubic-bezier(0.75, 0, 0.75, 0.9)';
    leftDoor.classList.remove('open');
    rightDoor.classList.remove('open');

    

    await new Promise(resolve => setTimeout(resolve, 2500));
    // Hide the background after doors start closing
    setTimeout(() => {
        background.style.opacity = 0;
    }, 100);

    // Remove the background after doors are fully closed
    lift.removeChild(background);
}

/**
 * Moves a lift to the target floor
 * @param {Object} state - The current state of the simulation
 * @param {number} liftIndex - The index of the lift to move
 * @param {number} targetFloor - The floor to move the lift to
 */
async function moveLift(state, liftIndex, targetFloor) {
    const lift = document.getElementById(`lift-${liftIndex + 1}`);
    const liftState = state.liftStates[liftIndex];
    liftState.status = 'moving';

    // Highlight the lift number
    const liftNumber = lift.querySelector('.lift-number');
    liftNumber.classList.add('in-use');

    const floorsToMove = Math.abs(targetFloor - liftState.currentFloor);
    const moveTime = floorsToMove * 2000; // 2 seconds per floor

    const floorHeight = document.querySelector('.floor').offsetHeight;
    const newPosition = (targetFloor - 1) * floorHeight;

    // Use ease-in-out for smooth acceleration and deceleration
    lift.style.transition = `bottom ${moveTime}ms cubic-bezier(0.42, 0, 0.58, 1)`;
    lift.style.bottom = `${newPosition}px`;

    await new Promise(resolve => setTimeout(resolve, moveTime));

    liftState.currentFloor = targetFloor;

    // Open and close doors only at the target floor
    await openCloseDoors(lift);

    liftState.status = 'idle';

    // Remove highlight from the lift number
    liftNumber.classList.remove('in-use');

    // Update floor calls and button states
    state.floorCalls[targetFloor].up = false;
    state.floorCalls[targetFloor].down = false;

    // Remove 'pressed' class from all buttons on the target floor
    const floorButtons = document.querySelectorAll(`.floor-buttons[data-floor="${targetFloor}"] button`);
    floorButtons.forEach(button => {
        button.classList.remove('pressed');
    });

    // Check for pending calls after the lift becomes idle
    checkPendingCalls(state);
}

/**
 * Processes a lift call
 * @param {Object} state - The current state of the simulation
 * @param {number} floor - The floor where the call was made
 * @param {string} direction - The direction of the call ('up' or 'down')
 */
function callLift(state, floor, direction) {
    if (!state.floorCalls[floor][direction]) {
        state.floorCalls[floor][direction] = true;
        const button = document.querySelector(`.floor-buttons[data-floor="${floor}"] .${direction}-button`);
        if (button) {
            button.classList.add('pressed');
        }
        const nearestLift = findNearestIdleLift(state, floor);
        if (nearestLift !== -1) {
            moveLift(state, nearestLift, floor);
        } else {
            // Store the call if all lifts are busy
            state.pendingCalls.push({ floor, direction });
        }
    }
}

/**
 * Checks for pending calls and assigns them to idle lifts
 * @param {Object} state - The current state of the simulation
 */
function checkPendingCalls(state) {
    if (state.pendingCalls.length > 0) {
        const nextCall = state.pendingCalls.shift();
        const nearestLift = findNearestIdleLift(state, nextCall.floor);
        if (nearestLift !== -1) {
            moveLift(state, nearestLift, nextCall.floor);
        } else {
            // If still no idle lift, put the call back in the queue
            state.pendingCalls.unshift(nextCall);
        }
    }
}

/**
 * Initializes the lift simulation
 * @param {number} floors - The number of floors in the building
 * @param {number} lifts - The number of lifts in the building
 */
function initSimulation(floors, lifts) {
    const state = createInitialState(floors, lifts);
    renderSimulation(state);
    attachEventListeners(state, callLift);
}

// Event listener for the start simulation button
document.getElementById('start-simulation').addEventListener('click', () => {
    const floors = parseInt(document.getElementById('floors').value);
    const lifts = parseInt(document.getElementById('lifts').value);
    
    if (isNaN(floors) || floors < 2 ) {
        document.getElementById('error-message').textContent = 'Please enter a valid number of floors (Atleast 2).';
        return;
    }
    
    if (isNaN(lifts) || lifts < 1 ) {
        document.getElementById('error-message').textContent = 'Please enter a valid number of lifts (Atleast 1).';
        return;
    }
    
    document.getElementById('error-message').textContent = ''; // Clear error message
    initSimulation(floors, lifts);
});

// Initialize simulation with default values on page load
// document.addEventListener('DOMContentLoaded', () => {
//     const floors = parseInt(document.getElementById('floors').value);
//     const lifts = parseInt(document.getElementById('lifts').value);
//     initSimulation(floors, lifts);
// });

