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

    // Open doors
    leftDoor.classList.add('open');
    rightDoor.classList.add('open');

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Close doors
    leftDoor.classList.remove('open');
    rightDoor.classList.remove('open');

    await new Promise(resolve => setTimeout(resolve, 2500));
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

    const floorsToMove = Math.abs(targetFloor - liftState.currentFloor);
    const moveTime = floorsToMove * 2000; // 2 seconds per floor

    const floorHeight = document.querySelector('.floor').offsetHeight;
    const newPosition = (targetFloor - 1) * floorHeight;

    lift.style.transition = `bottom ${moveTime}ms linear`;
    lift.style.bottom = `${newPosition}px`;

    await new Promise(resolve => setTimeout(resolve, moveTime));

    liftState.currentFloor = targetFloor;

    // Open and close doors only at the target floor
    await openCloseDoors(lift);

    liftState.status = 'idle';

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
    initSimulation(floors, lifts);
});
