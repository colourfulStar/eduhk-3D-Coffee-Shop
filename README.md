# SHOEGAZERS — 3D Coffee Shop

*An interactive low-poly 3D virtual cafe that runs entirely in the browser.*

## Overview

SHOEGAZERS is a fully interactive low-poly virtual cafe built with Three.js. Every object — from the furniture to the outdoor city park — is procedurally generated from basic geometries, with zero external 3D models. Walk around in first person, order and drink a coffee, and unwind to procedurally generated jazz.

## Features

- **First-person exploration** — pointer-lock mouse look with WASD movement, Box3 collision detection, and smooth wall-sliding
- **Center-screen raycast interaction** — look at an object to see a prompt, left-click to open the door, view the poster, play the TV video, and more
- **Order & drink coffee** — pick one of six coffees at the machine, pick up your cup (steam included), and press `E` to drink
- **Procedurally generated jazz** — walking bass, chord pads, syncopated melody, swing ride cymbal, and vinyl crackle, all synthesized live with the Web Audio API — no audio files
- **Cinema atmosphere** — rotating projector reels, a flickering light beam with drifting dust, projection screen, TV video, and poster lightbox
- **Outdoor city park** — fountain spray particles, trees, benches, flower beds, street lamps, and a distant skyline

## Tech Stack

- Three.js r160 (CDN, ES Modules)
- PointerLockControls (first-person)
- Web Audio API (procedural jazz)
- Box3 collision + wall sliding
- BufferGeometry particle systems
- Canvas 2D → CanvasTexture

## Controls

`WASD` move · Mouse look · Left click interact · `E` drink coffee · `M` toggle music

## How to Run

Serve this folder with any static server and open it in a browser (internet required for the CDN).
