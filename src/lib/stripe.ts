import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error('Missing Stripe public key');
}

export const stripePromise = loadStripe(stripePublicKey);

export const createSubscription = async (priceId: string) => {
  try {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};