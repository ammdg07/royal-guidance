# Architecture rules
- Letter generation returns structured sender fields alongside the letter sections; the preview and clipboard share a signature formatter so supplied details remain consistent.
- Required letter forms are validated server-side and sender values are assigned deterministically after generation to avoid model omissions.
- Locked letter bodies remain server-only; authenticated preview reads exclude content and unlock endpoints fail closed without verified merchant payments.
- Account settings and histories are owned by authenticated users under RLS; clients cannot grant themselves paid access.
- The application uses visualViewport height for its fixed shell so the composer remains visible when mobile keyboards open.