# Architecture rules
- Letter generation returns structured sender fields alongside the letter sections; the preview and clipboard share a signature formatter so supplied details remain consistent.
- Required letter forms are validated server-side and sender values are assigned deterministically after generation to avoid model omissions.
- Authenticated owners can read full unpaid drafts with a client watermark; export controls remain payment-gated and unlock endpoints fail closed without verified merchant payments. Watermarks and selection blocking are deterrents, not content secrecy.
- The application enforces one appearance independent of stored profile theme preferences so all accounts see the same design.
- Account settings and histories are owned by authenticated users under RLS; clients cannot grant themselves paid access.
- The application uses visualViewport height for its fixed shell so the composer remains visible when mobile keyboards open.