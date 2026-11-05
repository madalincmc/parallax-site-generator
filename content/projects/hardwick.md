---
title: Hardwick
description: Custom furniture portfolio site for a Baia Mare workshop, with content managed entirely in Sanity and an architecture built to scale to hundreds of projects.
category: Websites
technologies:
  - Next.js
  - React
  - TypeScript
  - Sanity
  - Tailwind CSS
  - shadcn/ui
  - Framer Motion
  - Resend
githubUrl: https://github.com/madalincmc/hardwick
liveUrl: https://www.hardwick.ro
coverImage:
  path: "/images/projects/hardwick/cover.png"
  width: 1600
  height: 1000
gallery:
  - path: "/images/projects/hardwick/portfolio.png"
    alt: "Portfolio grid with category filters and search"
    width: 1600
    height: 1000
  - path: "/images/projects/hardwick/project-detail.png"
    alt: "Project detail page with gallery and info panel"
    width: 1600
    height: 1000
  - path: "/images/projects/hardwick/services.png"
    alt: "Services page — design, production, and installation"
    width: 1600
    height: 1000
publishedAt: 2026-07-22
---

A marketing site for Hardwick, a custom furniture workshop in Baia Mare, built as a portfolio that can scale to hundreds of projects with zero duplicated effort. Portfolio content is edited entirely from an embedded Sanity Studio at `/studio` — no redeploy needed for a new project.

## Features

- Portfolio grid with category filtering, search, and sorting, rendered server-side from the URL query string so filtered views stay shareable
- Project detail pages (location, year, materials, client requirements) with a fullscreen gallery lightbox
- Sanity Studio embedded at `/studio` for editing content — title, category, images, description — with no code changes
- Tag-based revalidation with a Sanity webhook for near-instant updates on publish, plus an hourly time-based fallback
- Contact form with validation (react-hook-form + zod), spam protection (honeypot, per-IP rate limiting), and delivery via Resend
- Dark mode, Framer Motion animations, UI built on shadcn/ui

## Architecture

The marketing routes (home, portfolio, project detail, about, services, contact) share a single `(site)` layout. Project pages are statically generated at build time for known slugs but stay `dynamicParams`, so a project published afterward appears without a rebuild. The category list is defined in both the app's types and the Studio's schema, since Sanity Studio bundles its config separately and can't resolve the app's `@/*` import alias.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript, Sanity as the portfolio CMS, Tailwind CSS v4 + shadcn/ui, Framer Motion for animation, yet-another-react-lightbox for the gallery, react-hook-form + zod for the contact form, Resend for email delivery.
