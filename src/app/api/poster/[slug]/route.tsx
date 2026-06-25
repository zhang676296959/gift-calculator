import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      tiers: { orderBy: { order: "asc" } },
      friends: {
        orderBy: { createdAt: "desc" },
        include: {
          selections: { include: { gift: true } },
        },
      },
    },
  });

  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  const totalFriends = event.friends.length;
  const friendNames = event.friends
    .filter((f) => !f.isAnonymous && f.name)
    .slice(0, 5)
    .map((f) => f.name);

  const tierSummary = event.tiers.map((tier) => {
    const count = event.friends.filter((f) => f.selectedTierKey === tier.key).length;
    return { label: tier.label, emoji: tier.emoji, count };
  });

  // QR code pointing to signup (viral loop)
  const qrUrl =
    "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://giftcalc.app/sign-up&choe=UTF-8";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF1A6C 0%, #e0145a 100%)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          padding: 60,
          position: "relative",
        }}
      >
        {/* Title */}
        <div style={{ fontSize: 52, marginBottom: 8 }}>
          {event.title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          🎁 Received {totalFriends} gifts from friends!
        </div>

        {/* Stats boxes */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 40,
          }}
        >
          {tierSummary
            .filter((t) => t.count > 0)
            .slice(0, 3)
            .map((tier) => (
              <div
                key={tier.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 16,
                  padding: "16px 24px",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <div style={{ fontSize: 32 }}>{tier.emoji}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>
                  {tier.count}
                </div>
                <div
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}
                >
                  {tier.label}
                </div>
              </div>
            ))}
        </div>

        {/* Friends names */}
        {friendNames.length > 0 && (
          <div
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.8)",
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            Thanks {friendNames.join(", ")}
            {event.friends.length > 5
              ? ` and ${event.friends.length - 5} more friends!`
              : "!"}
          </div>
        )}

        {/* Bottom row: QR code + tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 16,
          }}
        >
          {/* QR code — scan to make your own */}
          <img
            src={qrUrl}
            alt="QR"
            width={120}
            height={120}
            style={{ borderRadius: 12 }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>
              Make your own 🎀
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              Scan to create your gift calculator
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                marginTop: 8,
              }}
            >
              giftcalc.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
