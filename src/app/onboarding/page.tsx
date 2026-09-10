'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Compass } from 'lucide-react';
import { Button, Panel, Spinner } from '@/components/ui/primitives';
import { useIndex } from '@/lib/useLibrary';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const SESSION_SIZES = [10, 20, 30, 50];
const NEW_CAPS = [5, 12, 20, 40];

export default function Onboarding() {
  const router = useRouter();
  const { index, error } = useIndex();
  const [step, setStep] = useState(0);

  const displayName = useStore((s) => s.displayName);
  const setDisplayName = useStore((s) => s.setDisplayName);
  const selected = useStore((s) => s.selectedTopics);
  const toggleTopic = useStore((s) => s.toggleTopic);
  const setSelectedTopics = useStore((s) => s.setSelectedTopics);
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const totalCards = useMemo(() => {
    if (!index) return 0;
    return index.topics.filter((t) => selected.includes(t.id)).reduce((n, t) => n + t.cardCount, 0);
  }, [index, selected]);

  if (error) {
    return (
      <Panel className="text-center">
        <p className="text-red-300">{error}</p>
        <p className="mt-2 text-sm muted">Run `npm run content` and reload.</p>
      </Panel>
    );
  }
  if (!index) return <Spinner label="Loading the library…" />;

  const steps = ['Who are you?', 'What do you want to learn?', 'How hard do you want to go?'];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="text-center">
        <div className="text-5xl">🃏</div>
        <h1 className="mt-2 text-3xl font-semibold">CodeCards</h1>
        <p className="mt-1 text-sm muted">
          {index.totalCards} cards across {index.topics.length} topics — scheduled by FSRS so you
          revise the moment before you would have forgotten.
        </p>
      </header>

      <div className="flex items-center justify-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full text-xs font-semibold',
                i < step
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : i === step
                    ? 'bg-sky-500/25 text-sky-200'
                    : 'bg-white/5 muted',
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            {i < steps.length - 1 ? <span className="h-px w-8 bg-white/10" /> : null}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {step === 0 ? (
          <Panel className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">{steps[0]}</h2>
            <p className="text-sm muted">
              Only used to greet you. Nothing leaves this browser — there is no account and no
              server.
            </p>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={24}
              className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-lg outline-none focus:border-sky-400/60"
            />
          </Panel>
        ) : step === 1 ? (
          <Panel className="flex flex-col gap-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-medium">{steps[1]}</h2>
              <span className="text-xs muted">
                {selected.length} topics · {totalCards} cards selected
              </span>
            </div>
            <p className="text-sm muted">
              Pick generously — the scheduler decides what you actually see, and you can change
              this any time from the Library.
            </p>

            {index.categories.map((category) => {
              const topics = index.topics.filter((t) => category.topics.includes(t.id));
              const allOn = topics.every((t) => selected.includes(t.id));
              return (
                <section key={category.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-widest muted">
                      {category.name}
                    </h3>
                    <button
                      type="button"
                      className="text-xs text-sky-300 hover:underline"
                      onClick={() =>
                        setSelectedTopics(
                          allOn
                            ? selected.filter((id) => !category.topics.includes(id))
                            : [...new Set([...selected, ...category.topics])],
                        )
                      }
                    >
                      {allOn ? 'Clear' : 'Select all'}
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {topics.map((topic) => {
                      const on = selected.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => toggleTopic(topic.id)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                            on
                              ? 'border-sky-400/50 bg-sky-500/10'
                              : 'border-white/8 bg-white/4 hover:bg-white/8',
                          )}
                        >
                          <span className="text-xl">{topic.icon}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{topic.name}</span>
                            <span className="block text-xs muted">{topic.cardCount} cards</span>
                          </span>
                          {on ? <Check className="h-4 w-4 shrink-0 text-sky-300" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </Panel>
        ) : (
          <Panel className="flex flex-col gap-6">
            <h2 className="text-lg font-medium">{steps[2]}</h2>

            <div>
              <div className="mb-2 text-sm">Cards per session</div>
              <div className="flex flex-wrap gap-2">
                {SESSION_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSettings({ cardsPerSession: size })}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm transition-colors',
                      settings.cardsPerSession === size
                        ? 'border-sky-400/50 bg-sky-500/15'
                        : 'border-white/8 bg-white/4 hover:bg-white/8',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm">New cards per session</div>
              <p className="mb-2 text-xs muted">
                The single biggest lever on workload. Every new card becomes ~8 future reviews.
              </p>
              <div className="flex flex-wrap gap-2">
                {NEW_CAPS.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setSettings({ newPerSession: cap })}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm transition-colors',
                      settings.newPerSession === cap
                        ? 'border-sky-400/50 bg-sky-500/15'
                        : 'border-white/8 bg-white/4 hover:bg-white/8',
                    )}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </motion.div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < 2 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && selected.length === 0}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                completeOnboarding();
                router.push('/');
              }}
            >
              Skip calibration
            </Button>
            <Button
              onClick={() => {
                completeOnboarding();
                router.push('/study?mode=calibration');
              }}
            >
              <Compass className="h-4 w-4" /> Take the calibration quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
