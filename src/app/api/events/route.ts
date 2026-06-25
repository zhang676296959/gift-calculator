import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_QUESTIONS, DEFAULT_TIERS } from "@/lib/defaults";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { friends: true } },
    },
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Generate a unique slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
  const slug = `${baseSlug}-${uniqueSuffix}`;

  // Create the event with default questions and tiers
  const event = await prisma.event.create({
    data: {
      userId: session.user.id,
      slug,
      title,
      questions: {
        create: DEFAULT_QUESTIONS.map((q) => ({
          type: q.type,
          title: q.title,
          order: q.order,
          options: JSON.stringify(q.options),
        })),
      },
      tiers: {
        create: DEFAULT_TIERS.map((tier) => ({
          key: tier.key,
          label: tier.label,
          emoji: tier.emoji,
          verdict: tier.verdict,
          order: tier.order,
          gifts: {
            create: tier.gifts.map((name, i) => ({
              name,
              order: i + 1,
            })),
          },
        })),
      },
    },
    include: {
      _count: { select: { friends: true } },
    },
  });

  return NextResponse.json({ event });
}
