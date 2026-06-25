"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  isPaid: boolean;
  createdAt: string;
  _count: { friends: number };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      });
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FF1A6C" }}>
        <div className="text-4xl animate-bounce">🎀</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FF1A6C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-white font-extrabold text-lg tracking-tight">
          Gift Calculator
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm hidden sm:block truncate max-w-[200px]">{session?.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="text-white/50 hover:text-white text-xs transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-12">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-8 gap-4">
          <div className="min-w-0">
            <h1 className="text-white font-extrabold text-2xl">My Events</h1>
            <p className="text-white/60 text-sm mt-1">
              Create and manage your gift calculators
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="bg-white text-[#0f0a0a] font-bold px-5 py-3 rounded-full text-sm transition-all hover:bg-[#FFE600] hover:scale-105 whitespace-nowrap flex-shrink-0"
          >
            + New Event
          </Link>
        </div>

        {/* Event list */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎂</div>
            <p className="text-white/70 text-lg mb-2">No events yet</p>
            <p className="text-white/50 text-sm mb-6">
              Create your first gift calculator and share it with friends!
            </p>
            <Link
              href="/dashboard/new"
              className="inline-block bg-white text-[#0f0a0a] font-bold px-8 py-3 rounded-full transition-all hover:bg-[#FFE600]"
            >
              Create Your First Event →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/${event.id}`}
                className="block bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all hover:bg-white/15 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-white font-bold text-lg">{event.title}</h2>
                  {!event.isPaid && (
                    <span className="text-xs bg-yellow-300/20 text-yellow-300 px-2.5 py-0.5 rounded-full font-semibold">
                      Free
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white/50 text-sm">
                  <span>{event._count.friends} friends</span>
                  <span>·</span>
                  <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="font-mono text-xs">/{event.slug}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
