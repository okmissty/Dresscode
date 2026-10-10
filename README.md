# 💗 DressCode 💗

## About: 
A simple web-based dress up game where users can drag and drop clothes and accessories onto a character. 

WIP: DressCode is my mini personal project that I came up with my senior year of highschool primarily catered towards a feminine audience who are interested in coding. It will be a fully custom Dress up game that implements and teaches the fundamentals of programming. This project combines my love for fashion, programming, art, and making a difference! 

### Built With
Built with HTML, CSS, and JavaScript.

## How to Play
- Open `index.html` in your browser.
- Drag clothing and accessory items onto the character to dress them up.
- Mix and match different items for fun combinations!

## Features
- Drag and drop interface
- Multiple clothing and accessory options
- Modern, visually appealing UI

## Notes


## Studio update
This version stays in plain HTML, CSS, and JavaScript with no build step or dependencies.

- Responsive fitting room and wardrobe; tap, keyboard, and desktop drag-and-drop controls.
- Fixed clothing layer order and a permanent eyes layer.
- Seven editable SVG sample pieces alongside the original artwork.
- Shuffle, undo (last 30 outfit edits), remove, reset, and three backdrops.
- A lookbook holding up to 12 named outfits, plus automatic browser-local saving.
- PNG outfit downloads and an educational panel showing the current outfit object.

### Run locally
Open `index.html` to play. For reliable image exports, use a local server:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000. Outfits are saved only in the current browser and origin; they do not sync between devices. Clearing browser data removes saved looks. If browser storage is unavailable, play and PNG exports still work.

### Replace the sample artwork
All layers share a transparent **400 × 600** canvas. Keep clothing at its fitted position on that canvas; do not crop the file. The samples are in `assets/placeholders/`. Replace a sample file, or update its path in the `catalog` in `script.js`. Keep item IDs stable so saved outfits keep working. Thumbnail crop bounds are also defined in `showItems()`.

### HTML/JS or Godot?
For this browser-first wardrobe and JavaScript learning concept, the existing web stack is a good fit. Consider Godot when the project needs animated characters, scene transitions, quests, minigames, or native desktop/mobile releases. Migration would mean rebuilding the interface and state logic; it will not solve a shortage of clothing artwork. A future Godot prototype can reuse the aligned PNG and SVG artwork and catalog structure. Check current web-export requirements before migrating: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html.

### Changes and authorship
These are uncommitted working-copy edits. No GitHub commits, pushes, or pull requests were created. Commit the changes yourself when ready.


## Accessibility and character samples
Settings beside Home offers higher contrast, larger text, reduced motion, and simplified backgrounds. The dialog supports Escape, contains keyboard focus while open, and returns focus to Settings on close. Preferences persist locally. Reduced motion from the operating system is always respected.

The Body category includes the original build and curvy/broad SVG samples. The Skin category now has nine tones. Body and skin are independently stored in looks; shuffle only changes clothing, hair, and accessories. Old saved looks default to the original body. Placeholder clothes are fitted approximately with horizontal scaling, including PNG downloads. For finished art, draw each garment specifically for each body type, then replace the approximate scaling with body-specific asset paths. These samples are sketch guides, not finished anatomical illustrations.

### Art dimensions
- Character, body, and fitted clothing: 400 × 600 px transparent canvas (or draw at 1200 × 1800 and export down consistently).
- Home background, desktop: recommended 2560 × 1440 px (16:9); 1920 × 1080 is sufficient for a smaller file.
- Optional separate mobile background: 1080 × 1920 px (9:16). Add a mobile CSS media query to switch assets when you draw it.
- The current background uses centered `cover`, so edges are cropped differently on wide and tall screens. Keep important art near the center and allow generous space around it. Keep title and button text in HTML rather than painting them into the background.

Next ideas: themed styling prompts without appearance-based scoring, a first-play guided tutorial, body-specific clothing drawings, and small coding challenges connecting wardrobe interactions to variables and conditionals.


## Two game modes
**Style Studio** is freeplay: mix pieces, save looks, and explore without objectives.
**Style Stories** combines three themes with beginner JavaScript lessons:
1. Café invitation: a string variable equips a bow or necklace.
2. Gallery after hours: an array lists the top, bottom, and shoe categories to check.
3. Rainy night market: a conditional equips boots when the weather is rainy.

Run code accepts the small grammar described by each lesson, with either single or double quotes and an optional semicolon. It is a guided learning exercise, not a general JavaScript interpreter. No player-supplied code is executed. Hints reveal a working example; there are no timers or appearance scores. Body type and skin tone never affect chapter completion.

Check my outfit requires a solved coding lesson and all brief items. Next chapter unlocks on completion; previous chapters remain replayable. Switching modes preserves the current outfit, and story progress and code drafts are saved in this browser. Settings → How to play opens a replayable six-step tutorial, also reachable from the home screen.

## Reliable artwork loading
`asset-data.js` embeds the 42 character, clothing, and sample SVG images. Both the fitting room and wardrobe use these self-contained images, including PNG exports, so local-file image restrictions and partial asset-folder copies do not break them. Original editable files remain in `assets/`.
After changing or adding artwork, run `python tools/build-assets.py` to refresh the embedded copies. This generated file must sit alongside `index.html` and `script.js`. Extract the entire ZIP before opening `index.html`; do not run the page from inside the ZIP preview.
