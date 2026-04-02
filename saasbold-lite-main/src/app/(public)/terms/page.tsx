export const metadata = {
  title: "Terms | WhatsBoard",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
        Terms
      </h1>
      <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)]">
        WhatsBoard helps online sellers run structured operations. By using the
        product, you agree to use it for lawful business activities and keep
        account and workspace access secure.
      </p>
      <div className="mt-8 wb-shell-card p-6">
        <p className="text-sm leading-7 text-[var(--color-wb-text-muted)]">
          Pricing, plan limits, and feature availability may vary by plan tier.
          Contact{" "}
          <a
            href="mailto:hello@whatsboard.africa"
            className="font-semibold text-[var(--color-wb-primary)]"
          >
            hello@whatsboard.africa
          </a>{" "}
          for enterprise terms.
        </p>
      </div>
    </main>
  );
}
