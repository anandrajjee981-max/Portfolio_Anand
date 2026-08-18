# Cinematic Portfolio Implementation Plan

This plan outlines the architecture, visual style, and execution steps to build an Awwwards-winning cinematic portfolio for **Anand Raj** (Full Stack Developer). The site will be built using a **Hollywood-inspired, cyberpunk superhero aesthetic** with dark neon colors, glowing webs, volumetric fog, dynamic camera animations, and high-performance WebGL.

## Visual Design & Aesthetics

- **Color Palette**: Deep Jet Black, Navy Blue shadow gradients, Electric Cyan, Neon Purple, and a warm Golden Sunrise transition for the Contact section.
- **Lighting**: Cinematic depth with volumetric fog, lightning flashes that cast dynamic reflections on skyscraper surfaces, and glowing neon emissive materials.
- **Atmosphere**: Cyberpunk rain, fog, and lightning in a dark, towering metropolis.
- **Intro Sequence**: A scripted slow-motion rescue sequence (falling silhouettes, lightning strike, glowing web catch, rooftop landing) that transitions smoothly to the active portfolio view.

## Technology Stack

1. **Build Tool**: Vite (Vanilla JavaScript template) for fast, unoverhead bundle sizes and rapid development.
2. **3D Engine**: `three.js` for WebGL rendering of the city, rain, lightning, webs, and holographic nodes.
3. **Animations**: `gsap` (GreenSock) + `ScrollTrigger` for timeline-controlled camera flights along the web paths, node pulsing, hover interactions, and intro sequence triggers.
4. **Icons**: FontAwesome or custom SVG graphics embedded in CSS/HTML.
5. **Styling**: Vanilla CSS with premium glassmorphism (`backdrop-filter`), custom typography (Outfit and Inter), and custom mouse interactive cursor.

---

## User Review Required

> [!IMPORTANT]
> The WebGL graphics will run best on hardware-accelerated browsers. I will optimize performance by using low-poly structures, instance meshes, and optimized shader logic to ensure it runs smoothly even on mid-range devices.
> Please review the project structure and let me know if you would prefer a React-based setup (Vite React + React Three Fiber) or a Vanilla JS setup. (Vanilla JS is recommended for raw WebGL performance and ease of camera scripting with GSAP).

---

## Proposed Changes

We will create a clean, modern Vite project containing the following files:

### Project Configuration
#### [NEW] [package.json](file:///c:/Users/Anand Raj/OneDrive/Desktop/anand/protfolio3/package.json)
Contains project metadata and dependencies: `three`, `gsap`, and dev dependencies for Vite.

### HTML Structure
#### [NEW] [index.html](file:///c:/Users/Anand Raj/OneDrive/Desktop/anand/protfolio3/index.html)
Main HTML file containing the Three.js Canvas container, the glassmorphic overlay UI (Navbar, Hero text, interactive modal elements, and contact section), and the custom cursor element.

### Styling
#### [NEW] [style.css](file:///c:/Users/Anand Raj/OneDrive/Desktop/anand/protfolio3/style.css)
Custom Vanilla CSS implementation:
- Implements variables for the cyberpunk color palette.
- Sets up typography (Outfit & Inter fonts).
- Creates glassmorphic styles (`backdrop-filter: blur()`).
- Responsive layout rules.
- Custom cursor styles, loading screen, and scrolling indicators.

### JavaScript Application
#### [NEW] [main.js](file:///c:/Users/Anand Raj/OneDrive/Desktop/anand/protfolio3/main.js)
The entry point of the app: initializes the WebGL renderer, loading manager, and starts the simulation.

#### [NEW] [webgl-engine.js](file:///c:/Users/Anand Raj/OneDrive/Desktop/anand/protfolio3/webgl-engine.js)
The core 3D engine handling:
- Three.js Scene, Camera, and Renderer setup.
- Neon Rain particle system (using custom Points material and shader).
- Skyscraper meshes (built dynamically with procedural neon windows).
- Volumetric fog effect and dynamic lightning flash system.
- Glowing web strand meshes (procedurally generated curves with glowing shaders).
- Silhouette models (hero and heroine silhouettes) loaded or procedurally drawn.
- Skills Web (3D force-directed or circular layout of floating holographic nodes).
- 3D Skyscrapers for Projects and Experience tracking.
- Sunrise scene transformation (gradual ambient light and fog color shifting).

#### [NEW] [animation-manager.js](file:///c:/Users/Anand Raj/OneDrive/Desktop/anand/protfolio3/animation-manager.js)
Manages GSAP timelines and ScrollTrigger bounds:
- **Intro Timeline**: Controls the falling sequence, web catch animation, camera zoom, hero landing, and hero stance transition.
- **Scroll Timeline**: Maps the camera's translation and rotation along a 3D Spline representing the web navigation path.
- **Interaction Animations**: Hover and click interactions (scaling nodes, lighting up skyscrapers, page-turn effects).

#### [NEW] [data.js](file:///c:/Users/Anand Raj/OneDrive/Desktop/anand/protfolio3/data.js)
Contains static configurations for Skills, Projects, Experience, Achievements, and Social Links.

---

## Verification Plan

### Automated Verification
- Run local Vite dev server and check for console errors.
- Test loading speeds and WebGL frame rates (target 60fps).

### Manual Verification
- Verify the intro sequence triggers properly, displays slow-motion action, catches the heroine, and lands on the rooftop.
- Verify scrolling along the web path works seamlessly, aligning the camera with respective sections.
- Verify skyscraper interactions (projects) display their details in glassmorphic cards.
- Verify experience towers climb when scrolling or clicking.
- Verify the Contact section triggers the sunrise transformation, shifting the sky and fog to warm colors.
- Test responsive layout on mobile, tablet, and desktop views.
