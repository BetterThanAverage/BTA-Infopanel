# BTA InfoPanel for OBS

This project provides infopanes & a control panel for OBS web sources, allowing BTA info to be displayed *well* and certain things to be automated.

## Running

1. Install nodejs.

2. `npm install`

3. `npm start`

It's that simple.

## Using

Navigate to `localhost:8080/ControlPanel` to control things

Add any of the following pages as websources to OBS (`localhost:8080/InfoPane/<pane>`)
| Pane        | Description                    |
| ----------- | ------------------------------ |
| `block`     | The chopping block             |
| `division`  | The current division           |
| `objective` | The current objective          |
| `players`   | The current player list        |
| `levels`    | Currently available level list |
