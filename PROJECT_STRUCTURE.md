# AgriSmart AI - Project Structure Verification

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
│   │   ├── app/                          # Next.js App Router (page.js, layout.js, globals.css)
│   │   ├── components/                   # React Components (HeroSection, Navbar, Chatbot, etc.)
│   │   ├── context/                      # React Context (LanguageContext.js)
│   │   └── lib/                          # Utilities (api.js, translations.js, mockData.js)
│   ├── next.config.mjs                   # Next.js configuration
│   ├── package.json                      # Node dependencies
│   └── ... (Tailwind & PostCSS configs)
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
├── .gitattributes                        # Git LFS tracking configuration
├── .gitignore                            # Excluded files (node_modules, venv, etc.)
├── README.md                             # Setup and run instructions
└── requirements.txt                      # Python dependencies for the backend
```

## Quick Verification Checklist

- [ ] Does `model/agrismart_model.onnx.data` exist and is it roughly ~350MB?
- [ ] Does `frontend/public/hero_video.mp4` exist and is it roughly ~194MB?
- [ ] Have you created `api/.env` and added your API key?
- [ ] Is `requirements.txt` in the root folder (not inside `/api/`)?
- [ ] Are all the `.md` documentation files neatly organized inside `trainning_docs_agrismart/`?
