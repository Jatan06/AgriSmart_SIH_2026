# AgriSmart AI - Known Limitations & Failure Cases (Team Brute Force)

*(As required by SIH 2026 Problem Statement Section 7.3: Honest failure cases)*

We have identified the following real-world boundaries where our model currently degrades or struggles in field scenarios:

1. **Co-occurring Diseases / Multi-Infection:** In a real field, a leaf may suffer from both Early Blight and Septoria Leaf Spot simultaneously. Because our classification head currently outputs a single-label softmax distribution, the model is forced to pick the dominant disease, effectively masking the secondary pathogen.
2. **Dense Field Clutter & Non-Leaf Backgrounds:** In field conditions, when soil, farmer hands, stems, or overlapping weeds heavily dominate the camera frame, background noise can reduce prediction confidence on subtle lesions.
3. **Severe Midday Sun Glare (Overexposure):** Direct tropical sunlight creates specular white reflections on waxy cuticles (e.g., Apple and Citrus leaves), occasionally blinding the model to early powdery mildew or subtle fungal discolorations.
4. **Early-Stage Morphological Ambiguity:** Very early chlorosis (leaf yellowing) before distinct concentric necrotic rings develop is visually indistinguishable from simple nitrogen or nutrient deficiency, leading to occasional false positives for disease.
