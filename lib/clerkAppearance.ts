/**
 * Shared Clerk appearance so the hosted auth widgets match the MockOffer
 * dark-first design system.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#e6b24a",
    colorText: "#f5f5f6",
    colorTextSecondary: "#a2a4ac",
    colorBackground: "#131418",
    colorInputBackground: "#0a0b0d",
    colorInputText: "#f5f5f6",
    colorNeutral: "#f5f5f6",
    borderRadius: "10px",
    fontFamily: "var(--font-neue-haas), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: "bg-transparent shadow-none",
    rootBox: "w-full",
    headerTitle: "text-[color:var(--color-fg)]",
    headerSubtitle: "text-[color:var(--color-fg-muted)]",
    socialButtonsBlockButton:
      "border border-[color:var(--color-line-strong)] bg-[color:var(--color-inset)] hover:bg-[color:var(--color-elevated)] text-[color:var(--color-fg)]",
    dividerLine: "bg-[color:var(--color-line)]",
    dividerText: "text-[color:var(--color-fg-subtle)]",
    formFieldLabel: "text-[color:var(--color-fg-muted)]",
    formFieldInput:
      "bg-[color:var(--color-inset)] border border-[color:var(--color-line-strong)] text-[color:var(--color-fg)]",
    formButtonPrimary:
      "bg-[linear-gradient(180deg,#f5cd6b,#e6b24a)] text-[#1a1405] font-semibold hover:opacity-95 shadow-none normal-case",
    footerActionLink: "text-[color:var(--color-gold-bright)] hover:text-[color:var(--color-gold)]",
    footer: "hidden",
    identityPreviewEditButton: "text-[color:var(--color-gold-bright)]",
  },
} as const;
