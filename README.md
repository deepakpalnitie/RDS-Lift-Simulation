# Lift-Simulation

This project is a fork of the original [@Real-Dev-Squad/Lift-Simulation](https://github.com/Real-Dev-Squad/Lift-Simulation). I have **implemented** it **using both class-based and functional components**.

## Features

1. User input for number of floors (2-9) and lifts (1-5)
2. Dynamic UI generation based on user input
3. Interactive lift calling system
4. Smooth lift movement with acceleration and deceleration
5. Realistic door opening and closing animations
6. Efficient call management system
7. Visual feedback for active lifts and button presses
8. Responsive design for mobile and desktop
9. State management for lift positions and statuses
10. Input validation and error handling

For more detailed information about the implementations, please refer to `features-functional.md` and `features.md` in the `src` directory.

## Implementation Details

- The project is implemented using both class-based and functional approaches.
- Code is properly documented with comments explaining key functionalities.
- `src/features-functional.md` explains the main features in the function-based implementation.
- `src/features.md` explains the main features in the class-based approach.
- Both feature files reference and point to the usage and context of the code.

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser
3. Input the desired number of floors and lifts
4. Click "Start Simulation" to begin



# Original README.md content:

## Lift-Simulation
Create a web app where you can simulate lift mechanics for a client

## UI Example
![Lift Simulation Example](Lift-Simulation-Example.png "Lift Simulation Example")

## Requirements
  1. Have a page where you input the number of floors and lifts from the user
  2. An interactive UI is generated, where we have visual depictions of lifts and buttons on floors
  3. Upon clicking a particular button on the floor, a lift goes to that floor

  Milestone 1:
   - Data store that contains the state of your application data
   - JS Engine that is the controller for which lift goes where
   - Dumb UI that responds to controller's commands
   
  Milestone 2:
   - Lift having doors open in 2.5s, then closing in another 2.5s
   - Lift moving at 2s per floor
   - Lift stopping at every floor where it was called
   - Mobile friendly design





