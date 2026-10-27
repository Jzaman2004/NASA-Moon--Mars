# SPACE MINERS // NASA ABANDONED HARDWARE

> **Abandoned but not forgotten.**
>
> An interactive deep-space archive for the 2026 NASA Space Apps Challenge. Explore historic hardware left on the Moon and Mars, rotate the celestial bodies, inspect holographic equipment models, and test your mission knowledge.

**Team:** Jawad Zaman, Sofia Calidayan, and Shahreen Zaman

## Mission Brief

Space Miners turns a static list of retired spacecraft into an explorable mission archive. The homepage presents the Moon and Mars as interactive 3D bodies with illuminated site markers. Each marker opens a story-driven equipment record with mission telemetry, scientific context, current condition, a school-age quiz, and an interactive hardware hologram.

The experience is designed to make planetary science approachable without losing the engineering detail behind each artifact:

- **Navigate** between the Moon and Mars from the orbital command interface.
- **Rotate and inspect** each world using the Three.js orbit controls.
- **Select a beacon** to reveal a specific abandoned spacecraft or instrument.
- **Launch the full equipment page** for a deeper 3D and educational view.
- **Follow the official NASA source** attached to every artifact record.

## Archive Inventory

### Lunar artifacts

| Artifact | Archive ID | Official source |
| --- | --- | --- |
| Apollo 11 Lunar Module Descent Stage ("Eagle") | `apollo-11` | [NASA Apollo 11](https://www.nasa.gov/mission/apollo-11/) |
| Apollo 15 Lunar Roving Vehicle ("Moon Buggy") | `apollo-15-lrv` | [NASA NSSDC Apollo LRV](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html) |
| Surveyor 3 Robotic Lander | `surveyor-3` | [NASA Surveyor 3](https://science.nasa.gov/mission/surveyor-3/) |
| Ranger 4 Lunar Impact Probe | `ranger-4` | [NASA Ranger 4](https://science.nasa.gov/mission/ranger-4/) |

### Martian artifacts

| Artifact | Archive ID | Official source |
| --- | --- | --- |
| Ingenuity Mars Helicopter ("Ginny") | `ingenuity` | [NASA Ingenuity](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/) |
| Opportunity Mars Exploration Rover (MER-B) | `opportunity` | [NASA Opportunity](https://science.nasa.gov/mission/mer-opportunity/) |
| Sojourner Microrover and Pathfinder Lander | `sojourner` | [NASA Mars Pathfinder](https://science.nasa.gov/mission/mars-pathfinder/) |
| InSight Mars Geophysical Lander | `insight` | [NASA InSight](https://science.nasa.gov/mission/insight/) |

## Experience Systems

### Orbital command interface

[`index.html`](./index.html) is the entry point. It supplies the navigation shell, hero presentation, responsive team badge, planet-selection controls, modal artifact preview, and the WebGL canvas container.

[`script.js`](./script.js) powers the command interface:

- Procedurally generates Moon and Mars textures in the browser.
- Builds the starfield, lighting, rings, labels, and planetary spheres.
- Converts latitude and longitude into 3D marker positions.
- Manages the homepage state transitions between deep space, planetary orbit, and artifact preview.
- Connects every marker to its full equipment page.

### Equipment telemetry

[`equipment.html`](./equipment.html) is a data-driven equipment page. One template serves all eight artifacts through the `id` query parameter:

```text
equipment.html?id=apollo-11
equipment.html?id=ingenuity
```

Each record includes:

- Landing site, coordinates, mission dates, and mass.
- Mission story and scientific significance.
- Current condition or final known status.
- Interactive quiz content.
- A procedural Three.js hologram selected by `modelType`.
- A direct official NASA source link.

### Visual language

[`style.css`](./style.css) defines the homepage visual system: glass navigation, orbital HUD panels, cyan and amber telemetry accents, responsive controls, animated overlays, and the Space Miners team card. The equipment page keeps its page-specific styles inline so the standalone telemetry view can be opened independently.

## Technology Stack

- HTML5 for the application structure.
- CSS3 for the responsive sci-fi interface and glass-panel presentation.
- Vanilla JavaScript for state management and data rendering.
- [Three.js r128](https://threejs.org/) for planetary scenes and equipment holograms.
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) for drag-to-rotate navigation.
- [Bootstrap 5.3.3](https://getbootstrap.com/) for layout utilities and responsive scaffolding.
- [GSAP 3.12.2](https://greensock.com/gsap/) for homepage motion effects.
- Google Fonts: Orbitron and Rajdhani.

Dependencies are loaded from public CDNs; there is no package manager or build step in this repository.

## Launch Locally

The project is a static website. From the repository root, start any local HTTP server. Python's built-in server is sufficient:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

Useful direct routes:

```text
http://localhost:8000/index.html
http://localhost:8000/equipment.html?id=apollo-11
```

Opening through a local HTTP server is recommended instead of double-clicking the HTML files, because it provides consistent browser behavior for scripts, navigation, and external resources.

## Navigation Controls

| Control | Action |
| --- | --- |
| Moon / Mars launch button | Focuses the selected planet and reveals its four site markers |
| Planet drag gesture | Rotates the globe |
| Glowing site marker | Opens the artifact preview |
| Full equipment page button | Opens the detailed telemetry and hologram view |
| Artifact switcher | Changes directly between all eight equipment records |
| Return to orbit | Goes back to the selected planet's orbital view |

## Project Layout

```text
NASA-Moon--Mars/
├── index.html       # Homepage and orbital command interface
├── equipment.html   # Data-driven artifact telemetry and holograms
├── script.js        # Three.js scene, planet data, markers, and navigation
├── style.css        # Homepage theme and responsive presentation
└── README.md        # Project documentation
```

## Development Notes

Artifact content is maintained in two data collections:

- `equipmentData` in [`script.js`](./script.js) controls homepage markers, preview cards, and navigation.
- `catalog` in [`equipment.html`](./equipment.html) controls full equipment pages, quizzes, hologram types, and NASA source links.

When adding or changing an artifact, update both collections so the orbital preview and full telemetry page remain synchronized. Use the same archive ID in both places and verify the corresponding `equipment.html?id=...` route.

For new hologram forms, add a `modelType` to the catalog and extend the model-building branches in `equipment.html`. Keep source links pointed at authoritative NASA pages and preserve the `target="_blank"` plus `rel="noopener noreferrer"` behavior for external links.

## Verification Checklist

Before sharing a change:

1. Start the local server and load the homepage.
2. Visit both planet views and confirm all four markers appear for each.
3. Open each artifact preview and full equipment page.
4. Confirm telemetry, quiz content, hologram, and NASA source link match the selected artifact.
5. Test the layout at desktop and mobile widths.
6. Run `git diff --check` to catch whitespace errors.

## Credits and Sources

The artifact links in the application point to official NASA or NASA NSSDC mission pages. Mission facts are presented as an educational summary; consult the linked NASA pages for primary mission documentation and further technical detail.

Built by **Team Space Miners** for the **2026 NASA Space Apps Challenge**.