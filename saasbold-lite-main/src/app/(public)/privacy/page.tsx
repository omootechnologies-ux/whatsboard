export const metadata = {
  title: "Privacy Policy | WhatsBoard",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="text-3xl font-black tracking-[-0.04em] text-[var(--color-wb-text)] sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-base leading-8 text-[var(--color-wb-text-muted)]">
        WhatsBoard stores seller operations data such as orders, customers,
        follow-ups, and payments to provide workflow visibility and team
        coordination. We do not sell your business data.
      </p>
      <div className="mt-8 wb-shell-card p-6">
        <p className="text-sm leading-7 text-[var(--color-wb-text-muted)]">
          For production support or privacy requests, contact{" "}
          <a
            href="mailto:hello@whatsboard.africa"
            className="font-semibold text-[var(--color-wb-primary)]"
          >
            hello@whatsboard.africa
          </a>
          .
        </p>
      </div>
    </main>
  );
}
