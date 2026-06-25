import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PRICE_AMOUNT } from "@/lib/defaults";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Payment is not configured yet" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { eventId } = body;

  if (!eventId) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }

  // Verify event ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId: session.user.id },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.isPaid) {
    return NextResponse.json({ error: "Already paid" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Gift Calculator - ${event.title}`,
            description: "Unlock unlimited friends, remove watermarks, and get full features.",
          },
          unit_amount: PRICE_AMOUNT,
        },
        quantity: 1,
      },
    ],
    metadata: {
      eventId: event.id,
      userId: session.user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${event.id}?paid=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${event.id}?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
