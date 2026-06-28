import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Users, Heart, MessageSquare, Bell, Compass, X } from 'lucide-react';
import { LiveEvent, StoreName } from '../types';

interface LiveActivityFeedProps {
  events: LiveEvent[];
  onClearEvents?: () => void;
  floating?: boolean;
}

const STORE_COLORS: Record<StoreName, string> = {
  'Amazon': 'text-sky-500 font-bold',
  'Mercado Libre': 'text-amber-500 font-bold',
  'AliExpress': 'text-rose-500 font-bold',
  'Temu': 'text-orange-500 font-bold'
};

export default function LiveActivityFeed({
  events,
  floating = false
}: LiveActivityFeedProps) {
  const [minimized, setMinimized] = useState(false);

  // Take the most recent 6 events to display elegantly without crowding
  const displayEvents = [...events].reverse().slice(0, 6);

  if (floating && minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-40 flex items-center space-x-2 rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white shadow-xl hover:bg-zinc-800 transition-transform active:scale-95"
        id="restore-activity-feed"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Radio className="h-4 w-4 text-emerald-400" />
        <span>Live Feed ({events.length})</span>
      </button>
    );
  }

  return (
    <div
      className={`flex flex-col bg-white border border-gray-100 rounded-2xl p-4.5 shadow-sm dark:bg-zinc-900/40 dark:border-zinc-800 transition-all ${
        floating 
          ? 'fixed bottom-4 right-4 z-40 w-80 max-h-[400px] shadow-2xl border-emerald-100 dark:border-zinc-800' 
          : 'w-full'
      }`}
      id="live-activity-feed"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-50 dark:border-zinc-800/60 mb-3.5">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-emerald-500" />
            <span>Shopper Live Activity</span>
          </h3>
        </div>

        {floating && (
          <button 
            onClick={() => setMinimized(true)}
            className="p-1 rounded bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Events Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px]">
        {displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
            <Compass className="h-6 w-6 text-gray-300 dark:text-zinc-700 mb-1 animate-pulse" />
            <p className="text-[11px] font-medium">Listening for real-time shopper updates...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayEvents.map((evt) => {
              // Icon mapping based on event type
              let Icon = Compass;
              let iconBg = 'bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400';
              let textNode = null;

              if (evt.type === 'user_join') {
                Icon = Users;
                iconBg = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
                textNode = (
                  <span>
                    <span className="font-bold text-zinc-950 dark:text-white">@{evt.username}</span> joined the global dashboard
                  </span>
                );
              } else if (evt.type === 'bookmark') {
                Icon = Heart;
                iconBg = 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400';
                textNode = (
                  <span>
                    <span className="font-bold text-zinc-950 dark:text-white">@{evt.username}</span> bookmarked{' '}
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{evt.productTitle}</span> on{' '}
                    <span className={evt.store ? STORE_COLORS[evt.store] : ''}>{evt.store}</span>
                  </span>
                );
              } else if (evt.type === 'comment') {
                Icon = MessageSquare;
                iconBg = 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400';
                textNode = (
                  <span>
                    <span className="font-bold text-zinc-950 dark:text-white">@{evt.username}</span> commented: "{evt.text}" on{' '}
                    <span className="font-medium">{evt.productTitle}</span>
                  </span>
                );
              } else if (evt.type === 'price_alert') {
                Icon = Bell;
                iconBg = 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';
                textNode = (
                  <span>
                    <span className="font-bold text-zinc-950 dark:text-white">@{evt.username}</span> set an alert on{' '}
                    <span className="font-medium">{evt.productTitle}</span>
                  </span>
                );
              }

              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -15, y: -5 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-start space-x-3 text-xs leading-normal"
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 text-gray-500 dark:text-zinc-400">
                    <p className="text-[11px] leading-tight">{textNode}</p>
                    <span className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 block mt-0.5">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
