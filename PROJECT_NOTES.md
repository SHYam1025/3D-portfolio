# 3D Portfolio Project Notes

## Current Project Overview

This repository is a personal portfolio built with React, TypeScript, Vite, Three.js, and GSAP. It uses a custom loading screen, a 3D character scene, scroll-driven animations, and multiple page sections including About, What I Do, Career, Work, Tech Stack, and Contact.

## Current Status

- App entry: `src/main.tsx`
- Data structure: page sections are separate components under `src/components`
- 3D scene: `src/components/Character/Scene.tsx`
- Loading provider: `src/context/LoadingProvider.tsx`
- Scroll animation utilities: `src/components/utils/GsapScroll.ts`
- Text animation/split logic: `src/components/utils/splitText.ts`
- Tech stack 3D canvas: `src/components/TechStack.tsx`

## Immediate Fixes Applied / Required

### 1. Broken Contact link
- `src/components/Contact.tsx` currently has an anchor with `href=""`.
- Fix: replace with a valid LinkedIn or email link.

### 2. `WhatIDo` event listener cleanup bug
- `src/components/WhatIDo.tsx` removes click listeners using a new callback instead of the original function reference.
- This means cleanup does not actually remove listeners.
- Fix by storing the handler and removing the exact same function.

### 3. Mobile optimization
- The site uses GSAP ScrollSmoother and a heavy React Three Fiber canvas.
- That is okay for desktop but may hurt mobile performance.
- Recommendation: use a simpler static tech stack list on mobile or lazy-load the canvas.

### 4. Content personalization
- `About.tsx` is already using your current internship and AI focus. Keep it concise and personal with:
  - your role
  - what you build
  - your goals
  - your current company and team

- `WhatIDo.tsx` should reflect your real focus areas and tools.
- `Career.tsx` should include actual projects or impact statements from current and past roles.
- `Work.tsx` should list your own projects, with updated images and links.
- `Contact.tsx` should include a working email or contact form plus social links.
- `TechStack.tsx` should show tools you actually use and not unrelated assets.

## Section-by-section checklist

### About
- Confirm the role text matches your current title.
- Add a short line about the type of work you do day-to-day.
- Mention your playbook (LLMs, RAG pipelines, agents, product focus).

### What I Do
- Keep 2–3 cards/cards of your core areas.
- Replace generic words with your true specialties.
- Ensure each card has clear value for a recruiter or hiring manager.

### Career
- Replace any placeholder companies or older roles with only relevant experience.
- Add impact statements for each role.
- Keep recent experience first.

### Work
- Update `projects` array in `src/components/Work.tsx`.
- Use real URLs and real project images from `public/images`.
- Remove anything not owned by you or outdated.
- Add your own project descriptions and tools.

### Tech Stack
- Confirm the icons/images in `src/components/TechStack.tsx` match your actual stack.
- If a tool is not used often, remove it.
- Consider showing the list as plain HTML on mobile for better performance.

### Contact
- Use a working LinkedIn link.
- Add your email with `mailto:` if you want direct contact.
- Keep your social links accurate.
- Use a strong CTA like: “Let’s build AI products together.”

## Mobile and desktop support

### Desktop
- The 3D scene is shown separately on desktop.
- `MainContainer` uses `window.innerWidth > 1024` to switch the layout.
- ScrollSmoother is active, so the desktop experience is smooth.

### Mobile
- On mobile, the character is embedded inside the hero section.
- Performance risk: `TechStack` canvas can be expensive on low-end devices.
- Recommendation:
  - hide or replace the 3D tech stack with static cards on mobile,
  - ensure text is readable,
  - simplify animations where possible.

## Deployment plan

### Build locally
- `npm install`
- `npm run build`
- `npm run preview`

### Deploy to Vercel
1. Create a free Vercel account.
2. Connect the GitHub repository or import the local project.
3. Choose Vite as the framework.
4. Configure build command: `npm run build` and output directory: `dist`.
5. Deploy.

### Custom domain
- Use Vercel’s free `vercel.app` domain immediately.
- Add your own domain in Vercel if you have one.
- Update DNS records as instructed by Vercel.
- Use the Vercel dashboard to verify the domain.

## Next steps

1. Update content in `About.tsx`, `WhatIDo.tsx`, `Career.tsx`, `Work.tsx`, `Contact.tsx`, and `TechStack.tsx`.
2. Replace outdated work entries with your real projects.
3. Improve mobile performance by simplifying `TechStack` on small screens.
4. Fix any broken links and verify image assets.
5. Deploy to Vercel and connect your domain.

## Helpful file references

- `src/components/About.tsx`
- `src/components/WhatIDo.tsx`
- `src/components/Career.tsx`
- `src/components/Work.tsx`
- `src/components/Contact.tsx`
- `src/components/TechStack.tsx`
- `src/components/Character/Scene.tsx`
- `src/components/utils/GsapScroll.ts`
- `src/components/utils/splitText.ts`
- `src/context/LoadingProvider.tsx`
- `src/components/Loading.tsx`
