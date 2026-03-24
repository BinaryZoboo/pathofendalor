# Design System Specification: The Kinetic HUD

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic HUD."** 

This is not a traditional website; it is an immersive, high-fidelity interface that feels like a tactical overlay projected onto the user's retina. By leaning into the 'Ready Player One' aesthetic, we reject the soft, rounded "friendly" web of the last decade. Instead, we embrace a high-contrast, hard-edged, and data-dense environment. 

The experience is defined by **Intentional Asymmetry** and **Optical Depth**. By layering cinematic Minecraft shader captures behind dark, glassmorphic modules, we create a sense of scale. The layout should feel modular—like a series of interlocking tech components that have been "plugged into" a master grid.

---

## 2. Colors & Atmospheric Lighting
The palette utilizes high-energy neon accents against a deep, multi-tiered dark void. The role of color here is "Emissive"—every primary or secondary color should feel like it is emitting light.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for structural sectioning. Boundaries between content areas must be defined through:
1.  **Background Shifts:** Transitioning from `surface` to `surface_container_low`.
2.  **Luminous Glows:** Using a 1px `primary` or `secondary` glow that fades out (box-shadow with 0 spread).
3.  **Tonal Transitions:** Defining the edge of a section by placing a `surface_bright` element against a `surface_container_lowest` background.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent glass panes.
*   **Root Level:** `surface` (#0b0e14) – The "void" or base layer.
*   **Sectional Level:** `surface_container_low` (#10131a) – Large content blocks.
*   **Module Level:** `surface_container_highest` (#22262f) – Focused interactive cards or modals.
*   **The Glass Rule:** For floating HUD elements, use `surface_variant` at 40-60% opacity with a `backdrop-filter: blur(20px)`. This allows the cinematic Minecraft imagery to bleed through while maintaining legibility.

### Signature Textures
Apply a subtle 10% opacity **Grid Pattern** (using `outline_variant`) over `surface_container_lowest` areas to evoke a digital "blueprint" feel. For main CTAs, use a linear gradient from `primary` (#8ff5ff) to `primary_container` (#00eefc) to give the button a sense of internal energy.

---

## 3. Typography: Technical Editorial
We utilize a high-contrast pairing to balance futuristic aggression with high-performance readability.

*   **Headings (Space Grotesk):** These are your "Data Readouts." Use `display-lg` and `headline-lg` in All Caps for major sections. The geometric, open nature of Space Grotesk feels like a military-grade terminal.
*   **Body (Manrope):** Use Manrope for all functional content. It is a modern, high-legibility sans-serif that grounds the "tech" aesthetic in human-readable comfort.
*   **Labels (Space Grotesk):** Use `label-md` for metadata (e.g., "SERVER STATUS", "PLAYER COUNT"). Always Uppercase with +10% letter spacing to enhance the HUD feel.

---

## 4. Elevation & Depth
In this system, depth is conveyed through **Tonal Layering** and **Light Pollution** rather than traditional shadows.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface_container_lowest` card sitting on a `surface` background creates a "recessed" look. Conversely, a `surface_bright` element on a `surface` background creates "lift."
*   **Ambient Shadows:** If a floating element requires a shadow, it must be tinted. Use a blur of 40px-60px with a low opacity (8%) version of `primary` or `secondary`. This mimics the way a neon light casts a glow on a dark metal surface.
*   **The "Ghost Border" Fallback:** If containment is absolutely necessary, use a "Ghost Border." This is a 1px border using `outline_variant` at 15% opacity. It should look like a faint scan-line, not a structural box.
*   **Corner Treatment:** All `roundedness` tokens are set to **0px**. Every element must be perfectly rectangular to maintain the high-tech, brutalist cyberpunk feel.

---

## 5. Components

### Buttons (Tactile Triggers)
*   **Primary:** Background `primary`, text `on_primary`. No border. On hover, add a `box-shadow` glow using the `primary` color.
*   **Secondary:** Ghost style. 1px border of `secondary` (#ff59e3) at 50% opacity. Text is `secondary`. On hover, the background fills with `secondary` at 10% opacity.
*   **Shape:** Strictly square (0px).

### Chips (Data Tags)
*   Used for server versions or mod types.
*   Background: `surface_container_high`.
*   Border: 1px `outline_variant` at 20%.
*   Typography: `label-sm` (Space Grotesk).

### Input Fields (Terminal Entries)
*   Background: `surface_container_lowest` (pure black).
*   Active State: 1px bottom-border of `primary` with a subtle outer glow.
*   Placeholder Text: `on_surface_variant` at 50% opacity.

### Cards & Lists (Content Modules)
*   **Forbid Divider Lines:** Use `spacing-6` (2rem) of vertical space or a background shift from `surface_container_low` to `surface_container_high` to separate items.
*   **HUD Accents:** Add a 2px wide vertical "Power Strip" of `primary` or `secondary` color on the far left or right edge of a card to denote its priority level.

---

## 6. Do's and Don'ts

### Do
*   **DO** use asymmetric layouts (e.g., a 7-column main content area with a 5-column secondary HUD sidebar).
*   **DO** use `secondary` (#ff59e3) sparingly as an "Error" or "Warning" accent to contrast against the `primary` cyan.
*   **DO** leverage `backdrop-blur` on all overlays to maintain the "Glassmorphism" depth.
*   **DO** use cinematic Minecraft screenshots with heavy "God-rays" or fog as the base background layer.

### Don't
*   **DON'T** use rounded corners. Even a 2px radius destroys the "Kinetic HUD" aesthetic.
*   **DON'T** use 100% opaque grey borders. They feel "template-like" and break the immersion.
*   **DON'T** use standard drop shadows. If it doesn't look like light is causing the shadow, don't use it.
*   **DON'T** crowd the interface. Cyberpunk is about data density, but high-end design is about breathing room. Use the Spacing Scale (`20` or `24`) to let the key visuals shine.