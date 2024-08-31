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
        // Initialize lift states: each lift starts at floor 1 and is idle
        this.liftStates = Array(lifts).fill().map(() => ({ currentFloor: 1, status: 'idle' }));
        // Initialize floor calls: each floor starts with no calls
        this.floorCalls = Array(floors + 1).fill().map(() => ({ up: false, down: false }));
        // Queue for storing pending calls when all lifts are busy
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
                <div class="floor-buttons">
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
     * Attach event listeners to floor buttons
     */
    attachEventListeners() {
        document.querySelectorAll('.up-button, .down-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const floor = parseInt(e.target.dataset.floor);
                const direction = e.target.classList.contains('up-button') ? 'up' : 'down';
                this.callLift(floor, direction);
            });
        });
    }

    /**
     * Process a lift call
     * @param {number} floor - The floor where the call was made
     * @param {string} direction - The direction of the call ('up' or 'down')
     */
    callLift(floor, direction) {
        this.floorCalls[floor][direction] = true;
        const nearestLift = this.findNearestIdleLift(floor);
        if (nearestLift !== -1) {
            this.moveLift(nearestLift, floor);
        } else {
            // Store the call if all lifts are busy
            this.pendingCalls.push({ floor, direction });
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

        const floorsToMove = Math.abs(targetFloor - liftState.currentFloor);
        const moveTime = floorsToMove * 2000; // 2 seconds per floor

        lift.style.transition = `bottom ${moveTime}ms linear`;
        lift.style.bottom = `${(targetFloor - 1) * 100 + 5}px`;

        await new Promise(resolve => setTimeout(resolve, moveTime));

        liftState.currentFloor = targetFloor;

        // Open and close doors only at the target floor
        await this.openCloseDoors(lift);

        liftState.status = 'idle';

        this.floorCalls[targetFloor].up = false;
        this.floorCalls[targetFloor].down = false;

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
    const simulation = new LiftSimulation(floors, lifts);
    simulation.init();
});
