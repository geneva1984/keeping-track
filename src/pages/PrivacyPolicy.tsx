export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.location.hash = ''
          }}
          className="text-sm text-accent hover:text-accent-dark underline underline-offset-2"
        >
          ← Back
        </a>

        <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8 mt-4">
          <h1 className="font-serif text-2xl font-semibold mb-1">Privacy Policy</h1>
          <p className="text-xs text-ink-soft mb-6">CareCrew by Third Act Exchange · Last updated 15 September 2026</p>

          <div className="rounded-lg bg-gold-soft border border-gold/30 px-4 py-3 mb-6">
            <p className="text-sm text-ink leading-relaxed">
              <strong>This is an early test version of CareCrew.</strong> We're still finalising our data security
              and privacy practices, so please use placeholder names and general descriptions rather than real
              medical, financial, or identifying details about your parents for now — data may be reset or removed
              as we continue building. By continuing, you understand this is a test build and agree not to enter
              real sensitive information about your parents at this stage.
            </p>
          </div>

          <div className="space-y-6 text-sm text-ink leading-relaxed">
            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">Who runs CareCrew</h2>
              <p>
                CareCrew is provided by Third Act Exchange
                [insert legal entity name / ABN]. If you have questions about this policy or your data, contact us
                at [insert contact email].
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">What information we collect</h2>
              <p className="mb-2">When you and your family use CareCrew, we collect:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Your account details</strong> — your email address (used to sign you in via a one-time link — we never see or store a password) and the display name you choose.</li>
                <li>
                  <strong>Information about the person receiving care</strong> — whatever your family chooses to
                  record, which may include their name, date of birth, health history, allergies, medications,
                  mobility needs, emergency contacts, daily routine, and photos. This is entered by family members,
                  not by the person themselves.
                </li>
                <li><strong>Logbook entries</strong> — records of calls, visits, and correspondence with care providers that your family logs, including any photos or documents attached.</li>
                <li><strong>Calendar and to do items</strong> — appointments and tasks your family creates, including who they're assigned to.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">Why we collect it</h2>
              <p>
                Solely to provide the service: keeping one shared, up-to-date record that everyone in a family can
                see and update, so care coordination doesn't rely on one person remembering everything. We do not
                use this data for advertising, and we do not sell or share it with third parties for their own
                purposes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">Who can see your family's data</h2>
              <p>
                Only people who have joined your family's log using its share code. This is enforced at the
                database level (Row Level Security) — it isn't just a setting in the app that could be
                misconfigured, and even someone with access to the raw database couldn't read across families
                without deliberately bypassing that protection. No other family using CareCrew can see your data,
                and there is no public or shared view.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">Where your data is stored</h2>
              <p>
                Data is stored with Supabase (database, authentication, and file storage) and the app itself is
                hosted on Vercel. These are our sub-processors — they store and transmit the data on our behalf
                under their own security and privacy commitments, but do not use it for their own purposes. Data
                is encrypted in transit (HTTPS). The physical region your data is stored in depends on which
                Supabase project region was selected when this family log was set up — [insert region, e.g.
                Sydney, Australia] — check your Supabase project settings to confirm.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">About information regarding someone else</h2>
              <p>
                If you enter information about a parent, relative, or anyone else, you confirm that you have the
                right or authority to do so (for example, as their carer, holder of power of attorney, or with
                their consent) and that you'll only record what's reasonably needed for their care coordination.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">How long we keep it, and deletion</h2>
              <p>
                Data is kept for as long as your family log exists. There is currently no self-service "delete my
                account" button in the app — to request deletion of your account or your family's data, contact us
                at [insert contact email] and we'll action it. A family administrator can also remove individual
                entries, appointments, to do items, or handbook photos directly within the app at any time.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">Your rights</h2>
              <p>
                You can ask to access, correct, or delete the personal information we hold about you by contacting
                [insert contact email]. If you believe information about the care recipient should be corrected or
                removed and you're not able to do so yourself in the app, contact your family's administrator or
                us directly.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold mb-2">Changes to this policy</h2>
              <p>
                If this policy changes, we'll update the date at the top of this page. Significant changes will be
                communicated to users where practical.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
