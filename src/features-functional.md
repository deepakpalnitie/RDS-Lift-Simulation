# Lift Simulation Features

## Overview
This document outlines the key features of the Lift Simulation project, providing a comprehensive guide to its functionality and implementation using functional programming principles.

## Features

1. User Input
   - Users can input the number of floors (2-10) and lifts (1-5)
   - Simulation starts with a "Start Simulation" button
   
   Reference:
   ```html
   File: src/index.html
   Element: #input-container
   ```

   Documentation:
   The user interface for input is created using HTML. It includes number inputs for floors and lifts, with set minimum and maximum values to ensure valid input. The "Start Simulation" button triggers the creation of the simulation based on the user's input.

2. Dynamic UI Generation
   - Creates a visual representation of floors and lifts based on user input
   - Each floor has up and down buttons (except for top and bottom floors)
   - Lifts are visually represented with opening and closing doors
   
   Reference:
   ```javascript
   File: src/js/main-functional.js
   Function: renderSimulation(state)
   ```

   Documentation:
   The `renderSimulation` function dynamically creates the HTML structure for the simulation. It generates floor elements with appropriate buttons and lift shafts based on the user's input. This function ensures that the UI accurately reflects the desired number of floors and lifts.

3. Lift Mechanics
   - Lifts move between floors at a speed of 2 seconds per floor
   - Lift doors open for 2.5 seconds and close for another 2.5 seconds at each stop
   - The simulation finds the nearest idle lift to respond to a floor call
   
   Reference:
   ```javascript
   File: src/js/main-functional.js
   Functions: moveLift(state, liftIndex, targetFloor), openCloseDoors(lift), findNearestIdleLift(state, floor)
   ```

   Documentation:
   The lift mechanics are implemented through several functions:
   - `moveLift`: Handles the vertical movement of lifts, using CSS transitions for smooth animation.
   - `openCloseDoors`: Manages the opening and closing of lift doors, including timing.
   - `findNearestIdleLift`: Determines the most efficient lift to respond to a call by calculating the nearest idle lift.

4. Call Management
   - Users can call lifts by clicking floor buttons
   - The system manages pending calls when all lifts are busy
   - Once a lift becomes idle, it checks for any pending calls
   
   Reference:
   ```javascript
   File: src/js/main-functional.js
   Functions: attachEventListeners(state, callLift), callLift(state, floor, direction), checkPendingCalls(state)
   ```

   Documentation:
   Call management is handled through a series of functions:
   - `attachEventListeners`: Sets up click events for floor buttons.
   - `callLift`: Processes a lift call, either assigning an idle lift or queueing the call.
   - `checkPendingCalls`: Checks for and processes any queued calls when a lift becomes available.

5. Responsive Design
   - Mobile-friendly design using flexbox layout
   
   Reference:
   ```css
   File: src/css/main.css
   Selectors: body, #simulation-container, .floor
   ```

   Documentation:
   The CSS utilizes flexbox to create a responsive layout that adapts to different screen sizes. This ensures that the simulation is usable on both desktop and mobile devices.

6. Visual Feedback
   - Lift movement is animated using CSS transitions
   - Lift doors open and close with animations
   
   Reference:
   ```css
   File: src/css/main.css
   Selectors: .lift, .lift-door
   ```

   Documentation:
   CSS transitions are used to create smooth animations for lift movement and door operations. This provides visual feedback to the user, making the simulation more intuitive and engaging.

7. State Management
   - Keeps track of each lift's current floor and status (idle or moving)
   - Efficiently stores and manages floor calls
   
   Reference:
   ```javascript
   File: src/js/main-functional.js
   Function: createInitialState(floors, lifts)
   ```

   Documentation:
   The `createInitialState` function initializes and maintains the state of the entire system:
   - `liftStates`: An array of objects representing each lift's current floor and status.
   - `floorCalls`: An array tracking active calls for each floor.
   - `pendingCalls`: A queue of calls that cannot be immediately serviced.

## Conclusion
These features fulfill the requirements specified in the README.md file, including both Milestone 1 and Milestone 2 objectives. The implementation provides a fully functional lift simulation with an intuitive user interface and efficient lift management system. The use of functional programming principles allows for better modularity, testability, and potential for future extensions.