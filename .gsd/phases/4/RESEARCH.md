# Research: Phase 4 — Reports & Alerts

> **Discovery Level**: 2 (Standard Research)
> **Date**: 2026-04-14

## Overview
Phase 4 focuses on output professionalization (PDF Reports) and user retention (Alerts).

## Findings

### 1. PDF Generation (REQ-07)
- **Choice:** `jspdf` + `html2canvas`. 
- **Rationale:** Allows "What You See Is What You Get" generation of the dashboard analysis view without rebuilding templates in `@react-pdf`. For Phase 4, speed of implementation and UI fidelity are priority.
- **Workflow:** User clicks "Download Report" -> Client-side capture of the `AnalysisPage` DOM -> Generation of PDF bytes -> Browser download.

### 2. Transfer Alerts & Notifications (REQ-09)
- **Strategy:** Polling-based change detection (Mock for MVP) or Supabase Realtime.
- **Trigger:** When a player on the user's `watchlist` has a change in their `statoriumId` metadata (indicating a move) or a significant change in the derived `Compatibility Score` (daily check).
- **UI:** A "Notification Bell" in the sidebar with a dropdown of recent alerts.

### 3. SEO & Meta (REQ-13)
- **Implementation:** Next.js `generateMetadata` function.
- **Static Meta:** Root layout title/desc.
- **Dynamic Meta:** Individual player analysis pages should have titles like `Scout Pro | Analysis: Erling Haaland`.

## Technology Choices
- **PDF:** `jspdf`, `html2canvas`.
- **Notifications:** `sonner` (Toasts) + Sidebar list.
- **SEO:** Next.js Metadata API.

## Risks
- **PDF Quality:** `html2canvas` can sometimes struggle with fonts or gradients. Custom CSS overrides might be needed during the capture phase to ensure a clean white-background "Print" version of the report.
- **Data Latency:** Statorium API credits. We should only check for alerts once per day per user to avoid burning API keys.
