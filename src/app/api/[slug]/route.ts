import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          type: true,
          title: true,
          options: true,
        },
      },
      tiers: {
        orderBy: { order: "asc" },
        include: {
          gifts: {
            orderBy: { order: "asc" },
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: { friends: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    title: event.title,
    themeColor: event.themeColor,
    questions: event.questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    })),
    tiers: event.tiers.map((t) => ({
      key: t.key,
      label: t.label,
      emoji: t.emoji,
      verdict: t.verdict,
      gifts: t.gifts,
    })),
    friendCount: event._count.friends,
    isPaid: event.isPaid,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      tiers: { include: { gifts: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, isAnonymous, message, answers, selectedTierKey, giftIds } = body;

  // Validate required fields
  if (!answers || !selectedTierKey || !giftIds || !Array.isArray(giftIds)) {
    return NextResponse.json(
      { error: "Missing required fields: answers, selectedTierKey, giftIds" },
      { status: 400 }
    );
  }

  // Validate giftIds count (1-3)
  if (giftIds.length < 1 || giftIds.length > 3) {
    return NextResponse.json(
      { error: "Must select between 1 and 3 gifts" },
      { status: 400 }
    );
  }

  // Validate tier exists
  const tier = event.tiers.find((t) => t.key === selectedTierKey);
  if (!tier) {
    return NextResponse.json(
      { error: "Invalid tier selected" },
      { status: 400 }
    );
  }

  // Validate gifts belong to the selected tier
  const validGiftIds = tier.gifts.map((g) => g.id);
  const invalidGifts = giftIds.filter((id) => !validGiftIds.includes(id));
  if (invalidGifts.length > 0) {
    return NextResponse.json(
      { error: "Invalid gift selections" },
      { status: 400 }
    );
  }

  // Create friend record with selections
  const friend = await prisma.friend.create({
    data: {
      eventId: event.id,
      name: isAnonymous ? null : (name || null),
      isAnonymous,
      message: message || null,
      selectedTierKey,
      answers: JSON.stringify(answers),
      selections: {
        create: giftIds.map((giftId: string) => ({
          giftId,
        })),
      },
    },
    include: {
      selections: {
        include: { gift: true },
      },
    },
  });

  return NextResponse.json({
    success: true,
    friend: {
      id: friend.id,
      name: friend.name,
      isAnonymous: friend.isAnonymous,
      message: friend.message,
      selectedTierKey: friend.selectedTierKey,
      selections: friend.selections.map((s) => s.gift.name),
    },
  });
}
