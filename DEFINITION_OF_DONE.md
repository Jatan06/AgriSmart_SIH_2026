# Definition of Done (DoD) Checklist

**INSTRUCTIONS FOR DEVELOPERS:**
A feature is NOT complete just because "it works on my machine." A feature is only complete when it passes this checklist. Your AI agent must be instructed to run through this checklist mentally before telling you it is finished.

---

### 1. Code Quality & Consistency
- [ ] Does this code strictly adhere to the stack defined in `SYSTEM_ARCHITECTURE_MEGA_DOC.md`?
- [ ] Does the architecture of this feature follow SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion)?
- [ ] Did I avoid adding any unapproved npm packages or libraries?
- [ ] Are there zero inline styles? (Everything must use our global styling system).
- [ ] Have I removed all `console.log()` statements and debugging code?

### 2. Architecture & Collisions
- [ ] Does this component overlap, hide, or break the z-index of global components (like the Navbar or Footer)?
- [ ] Have I tested this feature for race conditions (e.g., clicking a submit button rapidly 5 times)?
- [ ] If this feature fetches data, is there a Loading state and an Error state?
- [ ] Have I verified that my state management does not conflict with other developers' state (e.g., overriding global user data)?

### 3. Build & Integration
- [ ] Does the application successfully build locally when I run the build command?
- [ ] Have I pulled the latest `main` branch into my feature branch and resolved all merge conflicts locally?

### 4. AI Verification
- [ ] Has my AI agent explicitly confirmed that this code introduces no circular dependencies?
- [ ] Has my AI agent explicitly confirmed that this code is modular and not tightly coupled to unrelated features?
