'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { readConsent, useStore } from '@/lib/store';

/**
 * Storage notice.
 *
 * CodeCards sets no cookies and makes no network calls beyond loading its own content
 * files — but it does keep progress in localStorage, which is exactly the kind of
 * client-side storage a cookie notice exists to disclose. "Session only" swaps in an
 * in-memory store so nothing touches disk.
 */
export function ConsentBanner() {
  const consent = useStore((s) => s.consent);
  const setConsent = useStore((s) => s.setConsent);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readConsent();
    if (stored !== 'unset' && stored !== consent) setConsent(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = mounted && consent === 'unset';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl"
          role="dialog"
          aria-label="Storage notice"
        >
          <div className="panel flex flex-col gap-3 p-4 shadow-2xl sm:flex-row sm:items-center">
            <Cookie className="h-5 w-5 shrink-0 text-amber-300" aria-hidden />
            <div className="flex-1 text-sm">
              <p>
                <strong>CodeCards stores your progress in your browser.</strong> No account, no
                server, no tracking, and no advertising cookies — your XP, coins, cosmetics and
                review schedule live in this device&apos;s local storage only.
              </p>
              {expanded ? (
                <ul className="mt-2 space-y-1 text-xs muted">
                  <li>
                    <strong>Accept &amp; remember</strong> — progress is written to localStorage and
                    survives closing the tab.
                  </li>
                  <li>
                    <strong>Session only</strong> — progress is held in memory and discarded when
                    you close the tab. Nothing is written to disk.
                  </li>
                  <li>
                    You can export, import or erase everything at any time from{' '}
                    <Link href="/settings" className="underline">
                      Settings
                    </Link>
                    .
                  </li>
                </ul>
              ) : (
                <button
                  className="mt-1 text-xs underline muted"
                  onClick={() => setExpanded(true)}
                  type="button"
                >
                  What exactly is stored?
                </button>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setConsent('session')}>
                <X className="h-3.5 w-3.5" /> Session only
              </Button>
              <Button size="sm" onClick={() => setConsent('accepted')}>
                Accept &amp; remember
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
