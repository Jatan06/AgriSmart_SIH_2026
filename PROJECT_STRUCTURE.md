# AgriSmart AI - Project Structure Verification (Team Brute Force)

Use this file to verify that your local repository matches the exact structure required for the project to run successfully. 

> [!IMPORTANT]
> If you are missing the `agrismart_model.onnx.data` file (which is ~350MB) or the `hero_video.mp4` file, it means you did not pull the Git LFS files. Run `git lfs pull` to fix this.

## Complete Directory Tree

```text
AgriSmart_SIH_2026/
│
├── api/                                  # FastAPI Backend
│   ├── .env                              # (You must create this manually with GROQ_API_KEY)
│   ├── __init__.py
│   ├── inference.py                      # Loads the ONNX model and runs predictions
│   ├── main.py                           # FastAPI application and route endpoints
│   └── services.py                       # Weather API and Groq AI Agent logic
│
├── frontend/                             # Next.js UI
│   ├── public/                           # Static assets
│   │   ├── hero_video.mp4                # Background video for the hero section (LFS)
│   │   └── ... (SVG icons)
│   ├── src/
│   │   ├── app/                          # Next.js App Router
│   │   ├── components/                   # React Components
│   │   ├── context/                      # React Context
│   │   └── lib/                          # Utilities
│   ├── next.config.mjs                   # Next.js configuration
│   └── package.json                      # Node dependencies
│
├── model/                                # Machine Learning Models & Scripts
│   ├── agrismart_model.onnx              # Compiled ConvNeXt-V2 architecture
│   ├── agrismart_model.onnx.data         # The 350MB model weights (LFS)
│   ├── class_names.json                  # Disease label mappings
│   ├── augmentations.py                  # PyTorch data augmentation scripts
│   ├── dataset.py                        # Dataset loading logic
│   ├── export.py                         # PyTorch to ONNX conversion script
│   ├── model.py                          # PyTorch model definition
│   └── train.py                          # The training loop
│
├── report/                               # Documentation and Evaluation Assets
│   ├── assets/                           # High-res charts and logs
│   ├── AGENTIC_WORKFLOW.md               # Details on the 5-step agent logic
│   ├── LIMITATIONS.md                    # Known failure cases and edge-cases
│   └── MODEL_REPORT.md                   # ML validation metrics
│
├── README.md                             # Setup and run instructions
├── PROJECT_STRUCTURE.md                  # This file
└── requirements.txt                      # Python dependencies for the backend
```

## Quick Verification Checklist

- [ ] Does `model/agrismart_model.onnx.data` exist and is it roughly ~350MB?
- [ ] Does `frontend/public/hero_video.mp4` exist and is it roughly ~194MB?
- [ ] Have you created `api/.env` and added your API key?
- [ ] Are all the `.md` documentation files neatly organized inside `report/`?
