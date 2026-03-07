function applyKioskMode() {
  const styleId = 'kiosk-mode-styles';

  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* ── Hide top app bar (Headlamp logo + search + settings + user icon) ── */
    nav.MuiAppBar-root,
    nav[aria-label="Appbar Tools"] {
      display: none !important;
    }

    /* ── Hide left sidebar / navigation drawer ── */
    div.MuiDrawer-root,
    nav[aria-label="Navigation"],
    .MuiDrawer-docked {
      display: none !important;
    }

    /* ── Hide the sidebar footer (version number + shrink button) ── */
    /* It sits as a sibling of <main> inside css-1xd9zsj */
    .MuiBox-root.css-1xd9zsj > *:not(main) {
      display: none !important;
    }

    /* ── Expand main content to full viewport ── */
    main {
      margin-left: 0 !important;
      padding: 16px !important;
      width: 100% !important;
      max-width: 100% !important;
      flex: 1 !important;
    }

    /* ── Remove top padding left over from the now-hidden AppBar ── */
    .MuiBox-root.css-1uqao6u {
      padding-top: 0 !important;
      flex-direction: row !important;
    }

    /* ── Make the content+sidebar row fill full height ── */
    .MuiBox-root.css-1xd9zsj {
      width: 100% !important;
    }
  `;

  document.head.appendChild(style);
}

// ── Auto-redirect to Flux overview on every navigation ──
function redirectToFlux() {
  const path = window.location.pathname;
  // Only redirect from the cluster root (e.g. /c/main), not from other pages
  if (!/^\/c\/[^/]+\/?$/.test(path)) return;

  // Wait until the Flux plugin has registered its routes (link appears in sidebar DOM)
  const maxWait = 5000;
  const interval = 100;
  let elapsed = 0;

  const poll = setInterval(() => {
    elapsed += interval;
    const fluxLink = document.querySelector('a[href*="/flux/overview"]');
    if (fluxLink || elapsed >= maxWait) {
      clearInterval(poll);
      // Dispatch a real bubbling click — React Router handles it even on hidden elements
      const link = document.querySelector('a[href*="/flux/overview"]');
      if (link) {
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }
    }
  }, interval);
}

if (typeof window !== 'undefined') {
  applyKioskMode();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyKioskMode);
  }

  // Re-apply after React hydration / lazy chunks land
  setTimeout(applyKioskMode, 100);
  setTimeout(applyKioskMode, 500);
  setTimeout(applyKioskMode, 1500);

  // Re-apply on every SPA route change (MutationObserver on body)
  const observer = new MutationObserver(() => {
    applyKioskMode();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Redirect cluster root → /flux/overview
  redirectToFlux();
  window.addEventListener('popstate', redirectToFlux);
}
