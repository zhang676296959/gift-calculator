import { NextResponse } from "next/server";
import { stripe as getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
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
      // Mark event as paid
      await prisma.event.update({
        where: { id: eventId },
        data: {
          isPaid: true,
          paidAt: new Date(),
        },
      });

      // Create payment record
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
