# Lift Simulation Features

## Author Information
**Name:** Deepak Pal
**Date:** 30-Aug-2024
**GitHub:** [deepakpalnitie](https://github.com/deepakpalnitie)
**Project:** Lift Simulation
**Version:** 1.0

## Overview
This document outlines the key features of the Lift Simulation project, providing a comprehensive guide to its functionality and implementation using object-oriented programming principles.

## Features

1. User Input
   - Users can input the number of floors (2-9) and lifts (1-5)
   - Simulation starts with a "Start Simulation" button
   
   Reference:
   ```html:src/index.html
   Element: #input-container
   ```

   Documentation:
   The user interface for input is created using HTML. It includes number inputs for floors and lifts, with set minimum and maximum values to ensure valid input. The "Start Simulation" button triggers the creation of the simulation based on the user's input.

2. Dynamic UI Generation
   - Creates a visual representation of floors and lifts based on user input
   - Each floor has up and down buttons (except for top and bottom floors)
   - Lifts are visually represented with opening and closing doors
   
   Reference:
   ```javascript:src/js/main.js
   Class: LiftSimulation
   Method: renderSimulation()
   ```

   Documentation:
   The `renderSimulation()` method dynamically creates the HTML structure for the simulation. It generates floor elements with appropriate buttons and lift shafts based on the user's input. This method ensures that the UI accurately reflects the desired number of floors and lifts.

3. Input Validation
   - Validates user input for floors (2-9) and lifts (1-5)
   - Displays error messages for invalid inputs
   
   Reference:
   ```javascript:src/js/main.js
   startLine: 228
   endLine: 244
   ```

   Documentation:
   The input validation is handled in the JavaScript file. It checks if the input values are within the specified ranges and displays an error message if they are not. This ensures that the simulation only starts with valid inputs.

4. Visual Feedback for Active Lifts
   - Highlights the lift number when the lift is in use
   
   Reference:
   ```javascript:src/js/main.js
   Class: LiftSimulation
   Method: moveLift()
   ```

   Documentation:
   When a lift is moving, its number is highlighted by adding an 'in-use' class. This provides a visual cue to users about which lifts are currently active. The highlight is removed when the lift becomes idle again.

5. Smooth Lift Movement
   - Lifts move between floors with smooth acceleration and deceleration
   - Lifts move at a speed of 2 seconds per floor
   
   Reference:
   ```javascript:src/js/main.js
   Class: LiftSimulation
   Method: moveLift()
   ```

   Documentation:
   The lift movement is implemented using CSS transitions with an ease-in-out timing function. This creates a more natural and smooth movement, where the lift starts slowly, speeds up in the middle of its journey, and then slows down as it approaches the target floor. This enhances the visual realism of the simulation.

6. Realistic Door Movement
   - Lift doors open and close with variable speeds
   - Door opening: Quick start with a gradual slowdown (2.5 seconds)
   - Door closing: Slow start with gradual acceleration (2.5 seconds)
   
   Reference:
   ```javascript:src/js/main.js
   Class: LiftSimulation
   Method: openCloseDoors()
   ```

   Documentation:
   The lift door movements are simulated using CSS transitions with custom cubic-bezier timing functions. This creates a more realistic effect where doors open quickly but decelerate as they reach full opening, and close slowly at first but accelerate towards the end. This adds to the overall realism of the lift simulation.

7. Call Management
   - Users can call lifts by clicking floor buttons
   - The system manages pending calls when all lifts are busy
   - Once a lift becomes idle, it checks for any pending calls
   
   Reference:
   ```javascript:src/js/main.js
   Class: LiftSimulation
   Methods: attachEventListeners(), callLift(), checkPendingCalls()
   ```

   Documentation:
   Call management is handled through a series of methods:
   - `attachEventListeners()`: Sets up click and touch events for floor buttons.
   - `callLift()`: Processes a lift call, either assigning an idle lift or queueing the call.
   - `checkPendingCalls()`: Checks for and processes any queued calls when a lift becomes available.

8. Responsive Design
   - Mobile-friendly design using flexbox layout
   
   Reference:
   ```css:src/css/main.css
   Selectors: body, #simulation-container, .floor
   ```

   Documentation:
   The CSS utilizes flexbox to create a responsive layout that adapts to different screen sizes. This ensures that the simulation is usable on both desktop and mobile devices.

9. Visual Feedback
   - Lift movement is animated using CSS transitions
   - Lift doors open and close with animations
   - Floor buttons change color when pressed and revert when the lift arrives
   
   Reference:
   ```css:src/css/main.css
   Selectors: .lift, .lift-door, .floor-buttons button.pressed
   ```

   Documentation:
   CSS transitions are used to create smooth animations for lift movement and door operations. The floor buttons change color when pressed, providing immediate visual feedback to the user. When a lift arrives at the called floor, the button color reverts to its original state. This comprehensive visual feedback makes the simulation more intuitive and engaging.

10. State Management
    - Keeps track of each lift's current floor and status (idle or moving)
    - Efficiently stores and manages floor calls
    - Manages pending calls when all lifts are busy
   
    Reference:
    ```javascript:src/js/main.js
    Class: LiftSimulation
    Properties: liftStates, floorCalls, pendingCalls
    ```

    Documentation:
    The `LiftSimulation` class maintains the state of the entire system:
    - `liftStates`: An array of objects representing each lift's current floor and status.
    - `floorCalls`: An array tracking active calls for each floor.
    - `pendingCalls`: A queue of calls that cannot be immediately serviced.

## Conclusion
These features fulfill the requirements specified in the README.md file, including both Milestone 1 and Milestone 2 objectives. The implementation provides a fully functional lift simulation with an intuitive user interface and efficient lift management system. The use of object-oriented programming principles allows for better organization, encapsulation, and potential for future extensions.
