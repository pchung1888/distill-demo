import { CuratedExamples } from "@/components/CuratedExamples";
import { TryYourOwnForm } from "@/components/TryYourOwnForm";
import { CompareSection } from "@/components/CompareSection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-14 px-6 py-12 sm:px-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">distill</h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            A provider-agnostic agentic knowledge-ingestion service. Turns a URL, YouTube video,
            or PDF into a verified, structured{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
              KnowledgeDoc
            </code>{" "}
            through an extract -&gt; validate -&gt; critic -&gt; structure pipeline, metering
            every LLM call along the way. This page is a portfolio demo frontend for the{" "}
            <a
              href="https://github.com"
              className="font-medium text-blue-600 underline hover:no-underline dark:text-blue-400"
            >
              distill
            </a>{" "}
            backend -- see the README for how the two repos relate.
          </p>
        </header>

        <CuratedExamples />

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <TryYourOwnForm />

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <CompareSection />
      </main>

      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        distill-demo is a stateless frontend. Live runs are rate-limited per visitor by distill&apos;s
        server-side SQLite counter, not by anything in this app.
      </footer>
    </div>
  );
}
