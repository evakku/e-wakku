"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RealtimeAnalyticsListenerProps {
  showBadge?: boolean;
}

export default function RealtimeAnalyticsListener({
  showBadge = true,
}: RealtimeAnalyticsListenerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
      setLastSynced(new Date());
    });
  };

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes across analytics tables
    const channel = supabase
      .channel("admin-realtime-analytics")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analytics_summary",
        },
        () => {
          startTransition(() => {
            router.refresh();
            setLastSynced(new Date());
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issue_analytics",
        },
        () => {
          startTransition(() => {
            router.refresh();
            setLastSynced(new Date());
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_events",
        },
        () => {
          startTransition(() => {
            router.refresh();
            setLastSynced(new Date());
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (!showBadge) return null;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
          isConnected
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-50 text-slate-600 border-slate-200"
        }`}
        title={
          isConnected
            ? `Live real-time updates active. Last synced at ${lastSynced.toLocaleTimeString()}`
            : "Connecting to real-time stream..."
        }
      >
        <Radio
          size={13}
          className={isConnected ? "text-emerald-500 animate-pulse" : "text-slate-400"}
        />
        <span>{isConnected ? "Live Sync" : "Syncing"}</span>
      </div>

      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={isPending}
        title="Force Refresh Data"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm disabled:opacity-50"
      >
        <RefreshCw size={12} className={isPending ? "animate-spin text-[#059669]" : ""} />
        <span>Refresh</span>
      </button>
    </div>
  );
}
