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
      questions: { orderBy: { order: "asc" } },
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
      _count: { select: { friends: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...event,
    questions: event.questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    })),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Verify ownership
  const existing = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title, questions, tiers } = body;

  // Update basic fields
  if (title) {
    await prisma.event.update({
      where: { id },
      data: { title },
    });
  }

  // Update questions: delete old, create new
  if (questions) {
    await prisma.question.deleteMany({ where: { eventId: id } });
    await prisma.question.createMany({
      data: questions.map((q: any, i: number) => ({
        eventId: id,
        order: i + 1,
        type: q.type,
        title: q.title,
        options: JSON.stringify(q.options),
      })),
    });
  }

  // Update tiers and gifts
  if (tiers) {
    // Delete existing tiers (cascades to gifts)
    await prisma.tier.deleteMany({ where: { eventId: id } });
    // Recreate tiers with gifts
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      await prisma.tier.create({
        data: {
          eventId: id,
          key: tier.key,
          label: tier.label,
          emoji: tier.emoji,
          verdict: tier.verdict,
          order: i + 1,
          gifts: {
            create: (tier.gifts as string[]).map((name: string, gi: number) => ({
              name,
              order: gi + 1,
            })),
          },
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
