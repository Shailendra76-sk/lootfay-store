const WA_URL = "https://whatsapp.com/channel/0029VbCy92nBadmau8nw0v3j";

export function WhatsAppFab() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join Loot Alerts on WhatsApp"
      // Extra bottom offset on mobile so it doesn't collide with the Lovable edit badge.
      className="fixed right-4 bottom-28 sm:bottom-8 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-black font-semibold px-4 py-3 shadow-2xl shadow-[#25D366]/40 hover:scale-105 transition animate-glow-wa"
    >
      <svg viewBox="0 0 32 32" className="size-6 fill-current" aria-hidden>
        <path d="M19.11 17.36c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.61.14-.18.27-.7.89-.86 1.07-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01s-.48.07-.73.34c-.25.27-.96.94-.96 2.29 0 1.35.98 2.66 1.12 2.84.14.18 1.93 2.94 4.67 4.13.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.62-.66 1.85-1.3.23-.64.23-1.19.16-1.3-.07-.11-.25-.18-.52-.32zM16 4C9.37 4 4 9.37 4 16c0 2.12.55 4.17 1.6 5.98L4 28l6.18-1.61A11.94 11.94 0 0016 28c6.63 0 12-5.37 12-12S22.63 4 16 4zm0 21.82c-1.9 0-3.76-.51-5.37-1.47l-.39-.23-3.66.95.98-3.57-.25-.41A9.83 9.83 0 016.18 16C6.18 10.6 10.6 6.18 16 6.18S25.82 10.6 25.82 16 21.4 25.82 16 25.82z" />
      </svg>
      <span className="hidden sm:inline">Join Loot Alerts</span>
      <span className="absolute -top-1 -right-1 size-3 rounded-full bg-discount animate-pulse ring-2 ring-background" />
    </a>
  );
}
