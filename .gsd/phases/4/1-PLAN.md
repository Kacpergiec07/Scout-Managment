---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Professional PDF Reporting

## Objective
Enable scouts to export high-quality compatibility reports as PDF files for sharing with club directors.

## Context
- .gsd/SPEC.md
- components/scout/report-button.tsx
- lib/utils/pdf-generator.ts

## Tasks

<task type="auto">
  <name>Implement PDF Export Utility</name>
  <files>lib/utils/pdf-generator.ts</files>
  <action>
    1. Install `jspdf` and `html2canvas`.
    2. Implement a `downloadAnalysisReport(elementId, playerName)` function.
    3. The utility should hide UI elements (buttons, sidebar) during capture and apply a "Print Mode" theme to ensure readability.
  </action>
  <verify>Call the function from the analysis page and verify a PDF is downloaded with the correct chart and text content.</verify>
  <done>Scouts can export analysis views as branded PDF documents.</done>
</task>

<task type="auto">
  <name>Add Export UI to Analysis Page</name>
  <files>app/(dashboard)/analysis/page.tsx, components/scout/report-button.tsx</files>
  <action>
    1. Create a `ReportButton` component that triggers the PDF generation.
    2. Place the button prominently in the Analysis header.
    3. Show a "Generating Report..." loading state during the export process.
  </action>
  <verify>Click the button on an analysis page and confirm the PDF accurately reflects the current state of charts and tables.</verify>
  <done>User-facing "Export PDF" functionality integrated into the analysis workflow.</done>
</task>

## Success Criteria
- [ ] PDF includes the Radar Chart and Compatibility Rankings.
- [ ] Layout is optimized for A4 paper size.
- [ ] Scout Pro branding (logo/footer) is included in the exported file.
