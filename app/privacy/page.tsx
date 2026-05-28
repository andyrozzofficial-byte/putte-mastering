import type { Metadata } from "next";

import { STUDIO_CONTACT_EMAIL, STUDIO_CONTACT_MAILTO } from "@/lib/brand/contact";

export const metadata: Metadata = {
  title: "Privacy — First Listen Mastering",
  description: "How we collect, use, and protect your data and files.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 md:py-16 lg:px-10">
        <div className="mx-auto max-w-2xl space-y-8">
          <header className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              Legal
            </p>
            <h1 className="text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-black sm:text-[2.25rem]">
              Privacy
            </h1>
            <p className="text-[13px] leading-[1.7] text-gray-600 sm:text-sm">
              This page explains what we collect and how we handle your files and
              information.
            </p>
          </header>

          <div className="space-y-6 text-[13px] leading-[1.7] text-gray-600 sm:text-sm sm:leading-relaxed">
            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Data we collect
              </h2>
              <p>
                We may collect contact information you provide (such as name and
                email), order details, and technical data needed to run the site
                securely (such as basic logs and identifiers).
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Audio uploads and storage
              </h2>
              <p>
                Uploaded audio files are stored in private storage for the
                purpose of completing your mastering order and delivering your
                master. Access to uploaded files is restricted.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Email usage
              </h2>
              <p>
                If you provide an email address, we may use it to send order
                updates, delivery links, and essential service communications. We
                do not sell your email address.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                File privacy
              </h2>
              <p>
                We treat your audio files as confidential. We do not share your
                uploads publicly. We only use the files to provide the mastering
                service and related support.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Contact
              </h2>
              <p>
                Questions about privacy? Contact{" "}
                <a className="underline underline-offset-4" href={STUDIO_CONTACT_MAILTO}>
                  {STUDIO_CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

