---
name: frontend-design
description: >-
  Expert guidelines and procedures for designing, redesigning, and implementing
  production-grade, accessible, responsive frontend UI/UX in modern React applications.
  Use this skill whenever working on UI/UX redesigns, design systems, visual hierarchy,
  accessibility improvements, and browser visual QA.
---

# Frontend Design & UI/UX Engineering Skill

A comprehensive runbook and design standard for building and refactoring production-grade SaaS user interfaces.

## 1. Core Design Principles

- **Restrained Visual Language**: Emphasize clarity, purpose, and content over excessive ornamentation. Avoid AI-generated visual clichés such as rainbow gradients, excessive glassmorphism, heavy drop shadows, and unnecessary floating blobs.
- **Hierarchy & Proportions**: Establish clear typomorphic scales ($11px \to 12px \to 14px \to 16px \to 20px \to 24px \to 32px$). Use font weight (400, 500, 600) and muted text colors (`text-muted-foreground`, `text-zinc-400/500`) to guide the user's eye naturally.
- **Surface Elevation System**:
  - Base Background: `bg-background` / `bg-zinc-950`
  - Sidebar / Secondary Surface: `bg-surface-secondary` / `bg-zinc-900/50`
  - Elevated Cards / Popovers: `bg-card` / `bg-zinc-900` with subtle border `border-border/60`
  - Active / Hover States: `hover:bg-accent/10`, `bg-accent/15`
- **Spacing & Alignment**: Use strict 4px grid increments (`gap-1`, `gap-2`, `gap-3`, `gap-4`, `p-3`, `p-4`, `p-6`). Ensure optical vertical alignment for icons and labels (`items-center gap-2`).

## 2. Component Standards

- **Buttons**: Clear visual hierarchy between `default` (primary action), `secondary`, `outline`, and `ghost`. Active/focus rings must be visible for keyboard accessibility (`focus-visible:ring-2`).
- **Cards & Containers**: Flat borders (`border border-zinc-800/80`) with subtle rounded corners (`rounded-lg` or `rounded-xl`). Avoid nested high-contrast borders.
- **Empty States**: Must provide clear context, a friendly icon, a descriptive heading, a helpful subtitle, and an actionable primary CTA.
- **Loading & Skeletons**: Use smooth skeleton loaders matching the exact shape of final components to avoid layout shifts (CLS).
- **Error States**: Inline error banners with icon, readable error summary, and recovery actions (e.g. Retry, Back).

## 3. Responsive & Accessibility Standards

- **Mobile First Adaptation**:
  - Collapsible drawer sidebars for screens `< 1024px` (`lg`).
  - No horizontal scrolling on mobile viewports ($375px \to 430px$).
  - Full-width mobile dialogs and touch-friendly target sizes ($\ge 44px$).
- **Accessibility (A11y)**:
  - Valid semantic HTML tags (`<header>`, `<main>`, `<aside>`, `<nav>`, `<article>`).
  - Accessible icon buttons with `aria-label` or `<span className="sr-only">`.
  - Proper ARIA attributes on modals (`role="dialog"`, `aria-modal="true"`).
  - High-contrast text compliance with WCAG AA standard.

## 4. Visual QA & Verification Checklist

1. Verify layout across Mobile (375px), Tablet (768px), and Desktop (1280px+).
2. Verify interactive states: Hover, Active, Focus-visible, Disabled.
3. Check browser console for zero React hydration or key warnings.
4. Verify all routes remain functional and data flows remain intact.
