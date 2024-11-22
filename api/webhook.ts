import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Get user by Stripe customer ID
      const { data: user } = await supabase
        .from('auth.users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await supabase
          .from('auth.users')
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            subscription_plan: subscription.items.data[0].price.lookup_key || 'monthly',
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', user.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: user } = await supabase
        .from('auth.users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await supabase
          .from('auth.users')
          .update({
            subscription_status: 'inactive',
            stripe_subscription_id: null,
            subscription_ends_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
      break;
    }
  }

  res.json({ received: true });
}