# AGENTS.md

This file serves as the unified source of truth for all AI agents (Claude Code, Gemini CLI, etc.) working on the Rayuela project.

## Project Overview

Rayuela is a full-stack citizen science platform with adaptive gamification for crowdsourced data collection. It is composed of three main packages:

- `rayuela-NodeBackend/` — NestJS + TypeScript REST API (MongoDB + Garage S3)
- `rayuela-frontend/` — Vue 3 + Vite SPA (Vuetify + Vuex) — Dedicated to **Administrator and Researcher profiles** for project setup, task configuration, gamification strategies, and analytics. *(Note: Although contributors can technically authenticate, the contributor experience is routed to the mobile app).*
- `rayuela-mobile/` — Flutter Mobile App (Riverpod + GoRouter) — Dedicated to **Citizen Science Contributors and Volunteers** for field data collection and missions.

**GitHub Project:** [Rayuela Workspace Board](https://github.com/orgs/Rayuela-v2/projects/1/views/1)

## Mandatory Development Rules
- **ORG REPOSITORIES:** ALWAYS work exclusively in the repositories under the `Rayuela-v2` organization. NEVER perform actions in `cientopolis` source repositories.
- **CLIENT APPLICATION SCOPES & TARGET AUDIENCE:**
  * `rayuela-frontend` is exclusively intended for **Administrator and Researcher profiles** (project configuration, spatial/temporal task constraints, adaptive gamification setup, badge fading dashboards, and admin oversight). Do not design contributor data collection workflows for the web frontend; contributors can technically log in, but their participation experience is delegated to the mobile app.
  * `rayuela-mobile` is the official client for **Contributors** (field observations and GPS check-ins).
- **ACTOR TERMINOLOGY (`Persona colaboradora` / `Contributor`):**
  * When referring to the citizen science participant role in documentation, diagrams, or UI copy: ALWAYS use **"Persona colaboradora"** in Spanish and **"Contributor"** in English.
- **ISSUE TRACKING:** All issues are tracked in the GitHub Project: [Rayuela Workspace Board](https://github.com/orgs/Rayuela-v2/projects/1). Note that the Project Board view is filtered to display issues from the `Rayuela-v2/rayuela-NodeBackend` repository. Therefore, even for Mobile or Frontend tasks, always create the issue in `Rayuela-v2/rayuela-NodeBackend` and link it to the project board.
- **NO AI SIGNATURES:** Do not include agent signatures or attribution lines in PR descriptions or commits.
- **LOCALIZATION / i18n (ZERO HARDCODED STRINGS):**
  * **NEVER hardcode user-facing text** in Vue templates (`<template>`) or scripts (`<script>`)—including labels, buttons, placeholders, table headers, tooltips, snackbars/alerts, dialogs, empty states, and form validation errors.
  * **ALWAYS use `vue-i18n`** (`$t('key')` in templates or `t('key')` / `this.$t('key')` in scripts).
  * Every time you introduce or update user-facing text, you **MUST** add or update the corresponding translation keys in **ALL THREE** locale files: `src/locales/es.json`, `src/locales/en.json`, and `src/locales/pt.json`.
  * Never leave un-translated strings or raw translation keys in the UI.
- **BREADCRUMBS ON ALL PAGES:**
  * **Every page/view in `rayuela-frontend` MUST include breadcrumbs** (using `src/components/utils/BreadCrumb.vue` or `<v-breadcrumbs>`) at the top of the view to improve hierarchical navigation and allow users to easily return to parent sections.
  * Whenever you create or update a view (`src/views/**`), ensure its breadcrumb trail is defined in `src/components/utils/BreadCrumb.vue` with localized `t('...')` titles (defined in `es.json`, `en.json`, and `pt.json`) and rendered in the page header.

## Development Commands

### Backend (`rayuela-NodeBackend/`)
- `npm run start:dev` — Development with watch mode
- `npm run build` — Compile TypeScript to dist/
- `npm run test` — Jest unit tests
- `npm run test:e2e` — End-to-end tests
- `npm run lint` — ESLint with auto-fix
- `npm run format` — Prettier formatting
- **Infrastructure:** `docker-compose up -d mongodb garage` (then `bash ../init-garage.sh` if first time)

### Frontend (`rayuela-frontend/`)
- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — Production build
- `npm run test:unit` — Vitest unit tests
- `npm run test:e2e` — Playwright e2e tests
- `npm run lint` — ESLint with auto-fix

## Architecture

### Backend (NestJS)
- API Prefix: `/v1`
- Swagger Docs: `/docs`
- Pattern: `controller → service → DAO/schema (persistence/) → entities/ + dto/`
- **Gamification Engine:** Pluggable strategy-pattern engine in `src/module/gamification/entities/engine/`.

### Frontend (Vue 3)
- UI Library: Vuetify 3
- State: Vuex
- API Layer: `src/services/`
- i18n: `src/locales/{es,en,pt}.json` (ES, EN, PT — all mandatory)

## Environment Variables
- Backend uses `.env.development` or `.env.production`.
- Frontend uses `.env` with `VITE_` prefix.
- Key secrets: `DB_CONNECTION`, `JWT_SECRET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
