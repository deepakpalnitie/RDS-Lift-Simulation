class LiftSimulation {
    constructor(floors, lifts) {
        this.floors = floors;
        this.lifts = lifts;
        this.liftStates = Array(lifts).fill().map(() => ({ currentFloor: 1, status: 'idle' }));
        this.floorCalls = Array(floors + 1).fill().map(() => ({ up: false, down: false }));
    }

    init() {
        this.renderSimulation();
        this.attachEventListeners();
    }

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

    attachEventListeners() {
        document.querySelectorAll('.up-button, .down-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const floor = parseInt(e.target.dataset.floor);
                const direction = e.target.classList.contains('up-button') ? 'up' : 'down';
                this.callLift(floor, direction);
            });
        });
    }

    callLift(floor, direction) {
        this.floorCalls[floor][direction] = true;
        const nearestLift = this.findNearestIdleLift(floor);
        if (nearestLift !== -1) {
            this.moveLift(nearestLift, floor);
        }
    }

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
        liftState.status = 'idle';

        await this.openCloseDoors(lift);

        this.floorCalls[targetFloor].up = false;
        this.floorCalls[targetFloor].down = false;
    }

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
}

document.getElementById('start-simulation').addEventListener('click', () => {
    const floors = parseInt(document.getElementById('floors').value);
    const lifts = parseInt(document.getElementById('lifts').value);
    const simulation = new LiftSimulation(floors, lifts);
    simulation.init();
});
