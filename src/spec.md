# Specification

## Summary
**Goal:** Simplify the Planning tab into per-user, title-based plans with freeform notes and optional saved links, replacing the holiday-style planning workflow while preserving existing users’ data.

**Planned changes:**
- Replace the backend Planning data model with a lightweight plan model containing: id, title, notes (freeform text), optional links list, createdAt, updatedAt; keep existing per-user authorization checks and stable storage keyed by caller Principal.
- Update backend Planning endpoints to support: list caller plans, create plan (title only), update plan (title/notes/links), delete plan; remove or deprecate PlanningStats usage so the Planning UI no longer depends on holiday stats.
- Add an upgrade-time, conditional migration that converts existing holiday plans into the new plan format (e.g., title from location, notes combining prior notes and relevant legacy fields as plain text).
- Redesign the Planning tab UI to show a simple list of plan titles with a create-by-title input, plus a plan editor view for editing notes and adding/removing clickable saved links (open in new tab); remove holiday-specific fields and stats cards.
- Update Planning-related frontend types and React Query hooks/mutations to match the new backend model/endpoints, including cache invalidation/refetch on create/update/delete to keep list and editor in sync.

**User-visible outcome:** Users can create a plan by entering a short title (e.g., “Dubai”), open it to type freeform notes, and save/manage a list of links; existing Planning entries are preserved and appear as converted plans.
