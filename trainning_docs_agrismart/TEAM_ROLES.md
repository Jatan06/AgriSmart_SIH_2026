# AgriSmart AI: Team Roles & Responsibilities (6 Members)

For a 6-person team executing a 5-day hackathon, dividing into specialized, siloed roles is the only way to avoid merge conflicts and wasted time. We are dividing the team into **6 exact seats** across 4 domains.

*   **Rule of Engagement:** You may not do another role's job. If a backend engineer tries to tweak the frontend CSS, the team loses time. Stay in your lane. All 6 members work simultaneously on Day 1 because the interfaces (JSON schema) are already agreed upon.

---

## The ML Core Team (Members 1 & 2)

**Member 1: Data & Pipeline Engineer**
*   **Job:** Make sure the data is perfect before the model ever sees it.
*   **Tasks:** Download PlantVillage/PlantDoc. Write the PyTorch `Dataset` and `DataLoader` classes. Implement the `Albumentations` pipeline (MotionBlur, ISONoise, ResizedCrop).
*   **Do NOT:** Write the training loop or worry about ONNX. 

**Member 2: Architecture & Training Engineer**
*   **Job:** Train the model and export it.
*   **Tasks:** Instantiate the `ConvNeXt-V2` backbone. Write the `Focal Loss` function. Write the training/validation loop. Connect `WandB` for logging. Export the final weights to `.onnx`. Write the `predict.py` script.
*   **Do NOT:** Worry about data augmentation or downloading datasets. 

*Simultaneous Workflow:* Member 1 builds the data pipeline returning dummy tensors. Member 2 builds the training loop using dummy tensors. By Day 2, you plug them together.

---

## The Backend Team (Members 3 & 4)

**Member 3: FastAPI & Inference Engineer**
*   **Job:** Handle the incoming request and run the ML model.
*   **Tasks:** Initialize the FastAPI app. Build the `POST /api/v1/detect` route using `python-multipart`. Use `Pillow` and `numpy` to resize the image to `(1, 3, 224, 224)`. Load the `.onnx` file using `onnxruntime` and get the prediction. 
*   **Do NOT:** Call external APIs or worry about Gemini.

**Member 4: Agentic Integration Engineer**
*   **Job:** Gather context and talk to the AI.
*   **Tasks:** Write the `httpx` async function to get Open-Meteo weather. Write the `google-generativeai` prompt. Define the strict Pydantic JSON schema for Gemini. Merge the ML result (from Member 3) with the Gemini JSON and return it to the frontend.
*   **Do NOT:** Process the image or touch ONNX. 

*Simultaneous Workflow:* Member 3 builds the API route and returns a hardcoded "Early Blight" string. Member 4 takes that hardcoded string, hits the Weather API, hits Gemini, and returns JSON. On Day 3, you connect the real ONNX output to Member 4's function.

---

## The Frontend Team (Member 5)

**Member 5: Frontend UX Engineer**
*   **Job:** Build the "Wow Factor."
*   **Tasks:** Initialize Next.js 14. Build the UI using TailwindCSS and Shadcn UI. Implement `react-dropzone` for the image upload. Grab coordinates via `navigator.geolocation`. Fetch the API and render the JSON into beautiful UI cards.
*   **Do NOT:** Write Redux/Zustand logic. Do not write custom complex CSS. Do not wait for the backend—use the mock JSON from `SYSTEM_ARCHITECTURE_MEGA_DOC.md` to build your UI on Day 1.

---

## The Build Protocol (All Members Follow This)

This is not optional. Every member and every AI assistant on this project follows these rules, every day, for every feature.

### Rule 1: One Phase at a Time, Never in Bulk
*   A feature is NEVER built all at once. It is always broken into the smallest possible working phase.
*   **Example:** "Build the backend" → Wrong. "Build the `fetch_weather` function, test it returns the correct JSON, then stop." → Correct.
*   A member may only advance to the next phase after the current phase is verified working.

### Rule 2: Open-Ended Q&A Before Every Phase
*   Before writing any code for a phase, every developer and AI must surface ALL unknowns as questions.
*   **No assumption is ever acceptable.** If something is not in the `SYSTEM_ARCHITECTURE_MEGA_DOC.md` and has not been explicitly answered, it must be asked before building.
*   Questions get answered by the PM (Member 6) or the relevant owning member.

### Rule 3: Zero Hardcoded Values, Zero Fake Data
*   If a real value is not yet available (e.g., the actual dataset path, the actual API key), the code does NOT ship with a made-up placeholder that looks real. Use a clearly named constant (`DATASET_ROOT = "REPLACE_ME_WITH_ACTUAL_PATH"`) that would fail loudly if not configured.
*   Fake data that looks real is the most dangerous form of technical debt in a hackathon.

### Rule 4: No TODO Comments
*   If something cannot be implemented yet, it does not appear in the codebase. A `TODO` is a promise that never gets kept under a deadline. Remove the function entirely and add it in the next phase.

---

## The Operations Team (Member 6)

**Member 6: Project Manager & Presenter**
*   **Job:** Protect the team from scope creep, enforce rules, and build the deliverables that actually get graded.
*   **Tasks:** Write the exhaustive `README.md`. Collect metrics from Members 1 & 2 to write the 1-page PDF Report. Record and edit the 3-5 minute demo video. Review all Pull Requests against the `DEFINITION_OF_DONE.md`. 
*   **Do NOT:** Write feature code on Days 3, 4, or 5. Your job is packaging the product, not building it.

---

## Protocol: Conflict & Abnormality Resolution

In a high-pressure 5-day environment, things *will* break. Follow these protocols strictly:

### 1. "The Backend and Frontend are disagreeing on data format."
*   **The Conflict:** Member 5's frontend crashes because Member 4's backend returned a different JSON key than expected.
*   **The Resolution:** The `SYSTEM_ARCHITECTURE_MEGA_DOC.md` is the law. Neither developer gets to "just change it on their end." You both look at Section 4 of the Spec. Whoever is not matching the Spec must change their code. If you must change the Spec, Member 6 (PM) must approve it, and both developers update their code at the exact same time.

### 2. "We have a Git Merge Conflict that is breaking the app."
*   **The Conflict:** Two people edited the same file and Git is throwing `<<<<<<< HEAD` errors.
*   **The Resolution:** STOP. Do **not** use `git push --force`. Do not blindly accept incoming changes. 
    1. Both developers physically sit together (or jump on a call).
    2. Member 6 (PM) screenshares the conflict.
    3. Resolve line-by-line, test locally, and *then* push.

### 3. "The ML Model isn't getting good accuracy and it's Day 3." (Abnormality)
*   **The Conflict:** Members 1 & 2 are stuck tuning the model and haven't given Member 3 the `.onnx` file. The backend is blocked.
*   **The Resolution:** **Hard Freeze.** Hackathons are about the end-to-end product, not a perfect model. If it's Day 3 and accuracy is only 75%, export the `.onnx` file anyway. Give it to the backend so they can finish the app. Members 1 & 2 can keep training a *new* model in the background, and if they get 90% on Day 4, simply swap the `.onnx` file. Never block the integration pipeline.
