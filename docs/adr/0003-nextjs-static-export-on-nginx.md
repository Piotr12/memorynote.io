# ADR 0003: Next.js static export on the nginx pipeline

Status: accepted

## Context

Issue #4 replaces the static page with a design system site: a
showcase page, a theme toggle that persists across reloads, and
self-hosted fonts. The previous page is one HTML file. The new site
needs component code, two build-time values inlined into the footer, and
tests that run against a built artifact.

Two shapes were on the table. A Next.js standalone server changes the
container: a node runtime on port 3000 instead of nginx on port 80.
The kamal proxy health-checks the app on `app_port`, which defaults to
80. A port change would touch the proxy configuration and the image
contract at the same time. A Next.js static export keeps the existing
nginx image, the port, the `/up` endpoint, and the kamal configuration;
only the build stage changes.

## Decision

The site is a Next.js App Router application built with React,
TypeScript, and plain CSS custom properties as the single token source.
The build uses `output: "export"` and produces a static site in `out/`.
The image is two-stage: `node:22-alpine` runs `next build`, and
`nginx:1.27-alpine` serves the export on port 80.

The footer reads `NEXT_PUBLIC_BUILD_BRANCH` and
`NEXT_PUBLIC_BUILD_COMMIT`, which Next.js inlines at build time. Kamal
reads build args from the config file only. The checked-in configs
carry empty defaults. The deploy workflow stamps the branch and commit
into the file before every deploy. Without values, the footer omits the
build line instead of showing placeholders.

The theme toggle is a client component. An inline script in the head
sets `data-theme` on `<html>` from `localStorage`, then from
`prefers-color-scheme`, before first paint. The token values shown on
the page come from one TypeScript module that the unit tests cross-check
against the CSS custom properties.

## Consequences

- The nginx image, the port, and the `/up` contract stay as they are.
- The footer shows the branch and commit of the deployed image.
- The static export cannot use server-only features. This site needs none.
- Reopen this ADR when a page needs a request or a response.
- A manual local deploy serves the empty defaults. The footer then shows its first line only.
- A unit test checks the tokens module against the CSS and fails on drift.
