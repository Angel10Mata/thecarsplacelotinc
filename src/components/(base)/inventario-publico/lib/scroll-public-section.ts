export function syncPublicSectionHash(hash: string, mode: "push" | "replace" = "replace") {
  const normalized = hash.startsWith("#") ? hash : `#${hash}`;
  const url = `${window.location.pathname}${window.location.search}${normalized}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current === url) return;
  if (mode === "push") {
    window.history.pushState(null, "", url);
  } else {
    window.history.replaceState(null, "", url);
  }
}

export function scrollToPublicSection(hash: string): boolean {
  const normalized = hash.startsWith("#") ? hash : `#${hash}`;
  const id = normalized.slice(1);
  if (!id) return false;

  const el = document.getElementById(id);
  if (!el) return false;

  el.scrollIntoView({ behavior: "smooth", block: "start" });
  syncPublicSectionHash(normalized, "push");
  return true;
}
