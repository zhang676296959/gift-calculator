import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment is not configured yet" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const eventId = session.metadata?.eventId;
    const userId = session.metadata?.userId;
    const paymentIntentId = session.payment_intent;

    if (eventId && userId && paymentIntentId) {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          isPaid: true,
          paidAt: new Date(),
        },
      });

      await prisma.payment.create({
        data: {
          userId,
          eventId,
          stripePaymentIntentId: paymentIntentId,
          amount: session.amount_total || 0,
          status: "completed",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
