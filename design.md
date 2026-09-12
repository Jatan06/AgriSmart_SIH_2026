# AgriSmart AI - Frontend Design System

This document outlines the visual aesthetic, typography, and animation logic for the frontend, heavily inspired by premium organic websites like carmowood.com.

## 1. Aesthetic & UX Direction (The "Living Earth" Theme)

We are combining high-end "Eco/Agriculture" aesthetics with buttery smooth interactions.

*   **Color Palette:**
    *   **Backgrounds:** Warm Off-White / Cream (`#F5F3ED` or similar).
    *   **Accents:** Earthy Olive Green and rich Coffee Brown.
    *   **Text:** Deep Coffee / Charcoal (Avoid pure `#000000`).
*   **Typography:**
    *   **Headings:** An elegant, modern serif (e.g., *Playfair Display*, *Lora*, or *Cormorant*) for that premium, organic feel.
    *   **Body & UI:** A clean, geometric sans-serif (e.g., *Outfit* or *Manrope*) for high legibility on the dashboard metrics.
*   **Hero Section:**
    *   A full-screen, highly optimized, looping background video of a lush jungle or vibrant farm crop. 
    *   This provides a massive "WOW" factor and makes the site feel alive without the heavy GPU overhead of WebGL/Three.js.
    *   The main "Upload Leaf" dropzone and text will float elegantly over this video.
*   **Animations (Lenis & GSAP):**
    *   **Lenis:** Installed at the root layout for buttery smooth, luxurious scrolling.
    *   **GSAP:** Used for grid stagger animations when the Result Dashboard loads, and for smooth "zoom in/out" parallax effects on any images/cards.
