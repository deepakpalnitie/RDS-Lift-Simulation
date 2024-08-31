/**
 * LiftSimulation class
 * Manages the entire lift simulation system
 */
class LiftSimulation {
    /**
     * Constructor for LiftSimulation
     * @param {number} floors - The number of floors in the building
     * @param {number} lifts - The number of lifts in the building
     */
    constructor(floors, lifts) {
        this.floors = floors;
        this.lifts = lifts;
        this.liftStates = Array(lifts).fill().map(() => ({ currentFloor: 1, status: 'idle' }));
        this.floorCalls = Array(floors + 1).fill().map(() => ({ up: false, down: false }));
        this.pendingCalls = [];
    }

    /**
     * Initialize the simulation
     * Renders the UI and sets up event listeners
     */
    init() {
        this.renderSimulation();
        this.attachEventListeners();
    }

    /**
     * Render the simulation UI
     * Creates visual representation of floors, buttons, and lifts
     */
    renderSimulation() {
        const container = document.getElementById('simulation-container');
        container.innerHTML = '';

        for (let i = 1; i <= this.floors; i++) {
            const floor = document.createElement('div');
            floor.className = 'floor';
            floor.innerHTML = `
                <div class="floor-buttons" data-floor="${i}">
                    ${i < this.floors ? `<button class="up-button" data-floor="${i}">Up</button>` : ''}
                    ${i > 1 ? `<button class="down-button" data-floor="${i}">Down</button>` : ''}
                </div>
                <div class="floor-number">Floor ${i}</div>
            `;

            for (let j = 0; j < this.lifts; j++) {
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
     * Attach event listeners to floor buttons
     */
    attachEventListeners() {
        document.querySelectorAll('.up-button, .down-button').forEach(button => {
            const handleEvent = (e) => {
                e.preventDefault(); // Prevent default touch behavior
                const floor = parseInt(e.target.dataset.floor);
                const direction = e.target.classList.contains('up-button') ? 'up' : 'down';
                this.callLift(floor, direction);
            };

            button.addEventListener('click', handleEvent);
            button.addEventListener('touchstart', handleEvent);
        });
    }

    /**
     * Process a lift call
     * @param {number} floor - The floor where the call was made
     * @param {string} direction - The direction of the call ('up' or 'down')
     */
    callLift(floor, direction) {
        if (!this.floorCalls[floor][direction]) {
            this.floorCalls[floor][direction] = true;
            const button = document.querySelector(`.floor-buttons[data-floor="${floor}"] .${direction}-button`);
            if (button) {
                button.classList.add('pressed');
            }
            const nearestLift = this.findNearestIdleLift(floor);
            if (nearestLift !== -1) {
                this.moveLift(nearestLift, floor);
            } else {
                // Store the call if all lifts are busy
                this.pendingCalls.push({ floor, direction });
            }
        }
    }

    /**
     * Find the nearest idle lift to respond to a call
     * @param {number} floor - The floor where the call was made
     * @returns {number} The index of the nearest idle lift, or -1 if no idle lifts
     */
    findNearestIdleLift(floor) {
        let nearestLift = -1;
        let minDistance = Infinity;

        for (let i = 0; i < this.lifts; i++) {
            if (this.liftStates[i].status === 'idle') {
                const distance = Math.abs(this.liftStates[i].currentFloor - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestLift = i;
                }
            }
        }

        return nearestLift;
    }

    /**
     * Move a lift to the target floor
     * @param {number} liftIndex - The index of the lift to move
     * @param {number} targetFloor - The floor to move the lift to
     */
    async moveLift(liftIndex, targetFloor) {
        const lift = document.getElementById(`lift-${liftIndex + 1}`);
        const liftState = this.liftStates[liftIndex];
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
        await this.openCloseDoors(lift);

        liftState.status = 'idle';

        // Remove highlight from the lift number
        liftNumber.classList.remove('in-use');

        // Update floor calls and button states
        this.floorCalls[targetFloor].up = false;
        this.floorCalls[targetFloor].down = false;

        // Remove 'pressed' class from all buttons on the target floor
        const floorButtons = document.querySelectorAll(`.floor-buttons[data-floor="${targetFloor}"] button`);
        floorButtons.forEach(button => {
            button.classList.remove('pressed');
        });

        // Check for pending calls after the lift becomes idle
        this.checkPendingCalls();
    }

    /**
     * Open and close the doors of a lift
     * @param {HTMLElement} lift - The lift element
     */
    async openCloseDoors(lift) {
        const leftDoor = lift.querySelector('.lift-door.left');
        const rightDoor = lift.querySelector('.lift-door.right');

        // Open doors - quick start, slow finish
        leftDoor.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        rightDoor.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        leftDoor.classList.add('open');
        rightDoor.classList.add('open');

        await new Promise(resolve => setTimeout(resolve, 2500));

        // Close doors - slow start, quick finish
        leftDoor.style.transition = 'transform 2.5s cubic-bezier(0.75, 0, 0.75, 0.9)';
        rightDoor.style.transition = 'transform 2.5s cubic-bezier(0.75, 0, 0.75, 0.9)';
        leftDoor.classList.remove('open');
        rightDoor.classList.remove('open');

        await new Promise(resolve => setTimeout(resolve, 2500));
    }

    /**
     * Check for pending calls and assign them to idle lifts
     */
    checkPendingCalls() {
        if (this.pendingCalls.length > 0) {
            const nextCall = this.pendingCalls.shift();
            const nearestLift = this.findNearestIdleLift(nextCall.floor);
            if (nearestLift !== -1) {
                this.moveLift(nearestLift, nextCall.floor);
            } else {
                // If still no idle lift, put the call back in the queue
                this.pendingCalls.unshift(nextCall);
            }
        }
    }
}

// Event listener for the start simulation button
document.getElementById('start-simulation').addEventListener('click', () => {
    const floors = parseInt(document.getElementById('floors').value);
    const lifts = parseInt(document.getElementById('lifts').value);
    
    if (isNaN(floors) || floors < 2 || floors > 9) {
        document.getElementById('error-message').textContent = 'Please enter a valid number of floors (2-9).';
        return;
    }
    
    if (isNaN(lifts) || lifts < 1 || lifts > 5) {
        document.getElementById('error-message').textContent = 'Please enter a valid number of lifts (1-5).';
        return;
    }
    
    document.getElementById('error-message').textContent = ''; // Clear error message
    const simulation = new LiftSimulation(floors, lifts);
    simulation.init();
});

// Initialize simulation with default values on page load
document.addEventListener('DOMContentLoaded', () => {
    const floors = parseInt(document.getElementById('floors').value);
    const lifts = parseInt(document.getElementById('lifts').value);
    const simulation = new LiftSimulation(floors, lifts);
    simulation.init();
});
