import Stripe from 'stripe';
import User from '../models/User.js';

let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key') {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe client initialized successfully!');
  } catch (error) {
    console.error('Error initializing Stripe client:', error);
  }
}

// Plan Prices configurations (replace with real Stripe price IDs if available)
const PLAN_PRICE_IDS = {
  pro_monthly: 'price_pro_monthly_id',
  pro_yearly: 'price_pro_yearly_id',
  lifetime: 'price_lifetime_id',
};

// @desc    Create a Stripe Checkout Session
// @route   POST /api/payments/checkout
// @access  Private
export const createCheckoutSession = async (req, res, next) => {
  const { plan } = req.body; // pro_monthly, pro_yearly, lifetime

  try {
    if (!['pro_monthly', 'pro_yearly', 'lifetime'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selection' });
    }

    if (!stripe) {
      return res.status(400).json({
        success: false,
        message: 'Stripe is not configured on the backend. Please use the simulated upgrade tool to test premium features.',
      });
    }

    // Check if customer already has stripe customer ID
    let user = await User.findById(req.user._id);
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Session parameters
    const mode = plan === 'lifetime' ? 'payment' : 'subscription';
    const priceId = PLAN_PRICE_IDS[plan];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment=success&plan=${plan}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment=cancelled`,
      metadata: {
        userId: user._id.toString(),
        plan: plan,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook Listener
// @route   POST /api/payments/webhook
// @access  Public
export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!stripe) {
    return res.status(400).send('Webhook Error: Stripe not configured');
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'your_stripe_webhook_secret'
    );
  } catch (err) {
    console.error(`Stripe Webhook Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Process webhook events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      const user = await User.findById(userId);
      if (user) {
        user.plan = plan;
        if (session.subscription) {
          user.stripeSubscriptionId = session.subscription;
        }
        await user.save();
        console.log(`[Stripe Webhook] User ${user.email} successfully upgraded to ${plan}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const user = await User.findOne({ stripeSubscriptionId: subscription.id });
      if (user) {
        user.plan = 'free';
        user.stripeSubscriptionId = undefined;
        await user.save();
        console.log(`[Stripe Webhook] User ${user.email} subscription ended, reverted to free`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulated Upgrade for local testing (No credit card needed)
// @route   POST /api/payments/simulate-upgrade
// @access  Private
export const simulateUpgrade = async (req, res, next) => {
  const { plan } = req.body;

  try {
    if (!['free', 'pro_monthly', 'pro_yearly', 'lifetime'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.plan = plan;
    await user.save();

    res.json({
      success: true,
      message: `Simulated upgrade successful! Plan set to ${plan}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        plan: user.plan,
      },
    });
  } catch (error) {
    next(error);
  }
};
