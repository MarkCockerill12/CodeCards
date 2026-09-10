'use client';

import { useRef, useState } from 'react';
import { Cookie, Download, HardDriveDownload, RotateCcw, Trash2 } from 'lucide-react';
import { Button, Panel } from '@/components/ui/primitives';
import { useStore } from '@/lib/store';
import { download } from '@/lib/utils';
import { cn } from '@/lib/utils';

const SESSION_SIZES = [10, 20, 30, 50, 100];
const NEW_CAPS = [0, 5, 12, 20, 40];

export default function SettingsPage() {
  const store = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const [confirmReset, setConfirmReset] = useState(false);

  const set = store.setSettings;
  const s = store.settings;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm muted">Everything here is stored on this device only.</p>
      </header>

      <Panel className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <label className="flex flex-col gap-1 text-sm">
          Display name
          <input
            value={store.displayName}
            onChange={(e) => store.setDisplayName(e.target.value)}
            maxLength={24}
            className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 outline-none focus:border-sky-400/60"
          />
        </label>
      </Panel>

      <Panel className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold">Study</h2>

        <Choice
          label="Cards per session"
          options={SESSION_SIZES}
          value={s.cardsPerSession}
          onChange={(v) => set({ cardsPerSession: v })}
        />
        <Choice
          label="New cards per session"
          hint="Each new card generates roughly eight future reviews. This is your workload dial."
          options={NEW_CAPS}
          value={s.newPerSession}
          onChange={(v) => set({ newPerSession: v })}
        />

        <Toggle
          label="Show interval preview"
          hint="Displays when each grade would bring the card back."
          value={s.showIntervalPreview}
          onChange={(v) => set({ showIntervalPreview: v })}
        />
        <Toggle
          label="Reveal explanation with the answer"
          value={s.autoRevealExplanation}
          onChange={(v) => set({ autoRevealExplanation: v })}
        />
        <Toggle
          label="Show session timer"
          value={s.showTimer}
          onChange={(v) => set({ showTimer: v })}
        />
      </Panel>

      <Panel className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold">Presentation</h2>
        <Toggle label="Sound effects" value={s.soundEnabled} onChange={(v) => set({ soundEnabled: v })} />
        <Toggle
          label="Reduce motion"
          hint="Disables card flip animations and background effects."
          value={s.reduceMotion}
          onChange={(v) => set({ reduceMotion: v })}
        />
      </Panel>

      <Panel className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Cookie className="h-4 w-4 text-amber-300" /> Storage &amp; privacy
        </h2>
        <p className="text-sm muted">
          CodeCards sets <strong>no cookies</strong>, has no accounts, no analytics and no server.
          Your progress is written to this browser&apos;s local storage; the content files it
          downloads are static JSON served from the same origin. Nothing about your answers ever
          leaves this device.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => store.setConsent('accepted')}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm transition-colors',
              store.consent === 'accepted'
                ? 'border-sky-400/50 bg-sky-500/15'
                : 'border-white/8 hover:bg-white/8',
            )}
          >
            Remember my progress
          </button>
          <button
            onClick={() => store.setConsent('session')}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm transition-colors',
              store.consent === 'session'
                ? 'border-sky-400/50 bg-sky-500/15'
                : 'border-white/8 hover:bg-white/8',
            )}
          >
            This session only
          </button>
        </div>
        {store.consent === 'session' ? (
          <p className="text-xs text-amber-300">
            Session-only mode: progress is held in memory and lost when you close this tab. Export
            below if you want to keep it.
          </p>
        ) : null}
      </Panel>

      <Panel className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Your data</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              download(`codecards-backup-${new Date().toISOString().slice(0, 10)}.json`, store.exportData());
              setMessage('Exported.');
            }}
          >
            <Download className="h-4 w-4" /> Export JSON
          </Button>

          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <HardDriveDownload className="h-4 w-4" /> Import JSON
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              setMessage(store.importData(text) ? 'Import complete.' : 'That file could not be read.');
              e.target.value = '';
            }}
          />

          <Button
            variant="ghost"
            onClick={() => {
              store.resetProgress();
              setMessage('Progress reset. Cosmetics kept.');
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset progress
          </Button>

          <Button
            variant={confirmReset ? 'danger' : 'ghost'}
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                return;
              }
              store.resetEverything();
              setConfirmReset(false);
              setMessage('Everything erased.');
            }}
          >
            <Trash2 className="h-4 w-4" />
            {confirmReset ? 'Tap again to erase everything' : 'Erase everything'}
          </Button>
        </div>
        {message ? <p className="text-xs text-emerald-300">{message}</p> : null}
        <p className="text-xs muted">
          &quot;Reset progress&quot; clears XP, coins, schedules and history but keeps your unlocked
          cosmetics. &quot;Erase everything&quot; returns the app to a fresh install.
        </p>
      </Panel>
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors',
          value ? 'bg-sky-500' : 'bg-white/15',
        )}
      >
        <span
          className={cn(
            'block h-5 w-5 rounded-full bg-white transition-transform',
            value && 'translate-x-5',
          )}
        />
      </button>
      <span>
        <span className="block text-sm">{label}</span>
        {hint ? <span className="block text-xs muted">{hint}</span> : null}
      </span>
    </label>
  );
}

function Choice({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: number[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-sm">{label}</div>
      {hint ? <p className="mb-2 text-xs muted">{hint}</p> : <div className="mb-2" />}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-xl border px-4 py-1.5 text-sm transition-colors',
              value === option
                ? 'border-sky-400/50 bg-sky-500/15'
                : 'border-white/8 bg-white/4 hover:bg-white/8',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
