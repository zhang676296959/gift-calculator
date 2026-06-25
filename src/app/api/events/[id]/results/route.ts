import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
    include: {
      tiers: {
        orderBy: { order: "asc" },
        include: { gifts: { orderBy: { order: "asc" } } },
      },
      friends: {
        orderBy: { createdAt: "desc" },
        include: {
          selections: {
            include: { gift: true },
          },
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Compute statistics
  const totalFriends = event.friends.length;
  const tierBreakdown = event.tiers.map((tier) => {
    const count = event.friends.filter((f) => f.selectedTierKey === tier.key).length;
    return {
      key: tier.key,
      label: tier.label,
      emoji: tier.emoji,
      count,
      percentage: totalFriends > 0 ? Math.round((count / totalFriends) * 100) : 0,
    };
  });

  // Compute gift popularity
  const giftCounts: Record<string, number> = {};
  event.friends.forEach((friend) => {
    friend.selections.forEach((sel) => {
      const name = sel.gift.name;
      giftCounts[name] = (giftCounts[name] || 0) + 1;
    });
  });

  // Build gift wall data (by tier)
  const giftWall = event.tiers.map((tier) => ({
    key: tier.key,
    label: tier.label,
    emoji: tier.emoji,
    gifts: tier.gifts.map((gift) => ({
      id: gift.id,
      name: gift.name,
      selectedCount: giftCounts[gift.name] || 0,
      selectedBy: event.friends
        .filter((f) => f.selections.some((s) => s.giftId === gift.id))
        .map((f) => ({
          friendId: f.id,
          name: f.isAnonymous ? null : f.name,
          isAnonymous: f.isAnonymous,
        })),
    })),
  }));

  // Build social cards (friend x gift)
  const socialCards = event.friends.map((friend) => ({
    id: friend.id,
    name: friend.isAnonymous ? null : friend.name,
    isAnonymous: friend.isAnonymous,
    message: friend.message,
    selectedTierKey: friend.selectedTierKey,
    tierLabel: event.tiers.find((t) => t.key === friend.selectedTierKey)?.label,
    tierEmoji: event.tiers.find((t) => t.key === friend.selectedTierKey)?.emoji,
    tierVerdict: event.tiers.find((t) => t.key === friend.selectedTierKey)?.verdict,
    gifts: friend.selections.map((s) => s.gift.name),
    answers: JSON.parse(friend.answers || "{}"),
    createdAt: friend.createdAt,
  }));

  // Compute answers breakdown
  const answerBreakdown: Record<string, Record<string, number>> = {};
  event.friends.forEach((friend) => {
    const ans = JSON.parse(friend.answers || "{}");
    Object.entries(ans).forEach(([key, value]) => {
      if (!answerBreakdown[key]) answerBreakdown[key] = {};
      const v = value as string;
      answerBreakdown[key][v] = (answerBreakdown[key][v] || 0) + 1;
    });
  });

  return NextResponse.json({
    title: event.title,
    slug: event.slug,
    totalFriends,
    tierBreakdown,
    giftWall,
    socialCards,
    answerBreakdown,
    isPaid: event.isPaid,
  });
}
