import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);
const PLATFORM_COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT || 8);
const MENTOR_SHARE_PERCENT = 100 - PLATFORM_COMMISSION_PERCENT;

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Missing required env vars: RAZORPAY_KEY_ID and/or RAZORPAY_KEY_SECRET');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const toPaise = (amountInRupees) => Math.round(Number(amountInRupees) * 100);

const secureOrderResponse = (order) => ({
  id: order.id,
  entity: order.entity,
  amount: order.amount,
  currency: order.currency,
  receipt: order.receipt,
  status: order.status,
  notes: order.notes || {},
  created_at: order.created_at,
});

const secureAccountResponse = (account) => ({
  id: account.id,
  entity: account.entity,
  type: account.type,
  email: account.email,
  phone: account.phone,
  legal_business_name: account.legal_business_name,
  profile: account.profile,
  active: account.active,
  created_at: account.created_at,
});

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * 1) Onboard a mentor as a Razorpay Linked Account (type=route).
 */
app.post('/api/razorpay/linked-accounts', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessType = 'individual',
      pan,
      bankAccount,
      ifsc,
    } = req.body;

    if (!name || !email || !phone || !pan || !bankAccount || !ifsc) {
      return res.status(400).json({
        error: 'name, email, phone, pan, bankAccount, and ifsc are required.',
      });
    }

    const linkedAccount = await razorpay.accounts.create({
      email,
      phone,
      type: 'route',
      legal_business_name: name,
      business_type: businessType,
      profile: {
        category: 'education',
        subcategory: 'others',
        business_model: 'Mentorship marketplace payouts',
      },
      legal_info: {
        pan,
      },
      bank_account: {
        name,
        account_number: bankAccount,
        ifsc,
      },
    });

    return res.status(201).json({
      success: true,
      linkedAccount: secureAccountResponse(linkedAccount),
    });
  } catch (error) {
    console.error('Error creating linked account:', error?.error || error);
    return res.status(500).json({
      success: false,
      error: error?.error?.description || 'Failed to create linked account',
    });
  }
});

/**
 * 2) Create order with transfer instruction.
 * Razorpay will transfer mentor share (92%) on payment capture.
 */
app.post('/api/payments/orders', async (req, res) => {
  try {
    const { amount, currency = 'INR', mentorLinkedAccountId, bookingId } = req.body;

    if (!amount) {
      return res.status(400).json({
        error: 'amount is required',
      });
    }

    const totalAmount = toPaise(amount);
    const mentorAmount = Math.round((totalAmount * MENTOR_SHARE_PERCENT) / 100);
    const platformAmount = totalAmount - mentorAmount;

    const orderPayload = {
      amount: totalAmount,
      currency,
      receipt: `booking_${bookingId || Date.now()}`,
      payment_capture: 1,
      notes: {
        bookingId: bookingId || '',
        mentorLinkedAccountId: mentorLinkedAccountId || '',
        mentorSharePercent: String(MENTOR_SHARE_PERCENT),
        platformCommissionPercent: String(PLATFORM_COMMISSION_PERCENT),
      },
    };

    // Add payout split only when a mentor linked account is available.
    if (mentorLinkedAccountId) {
      orderPayload.transfers = [
        {
          account: mentorLinkedAccountId,
          amount: mentorAmount,
          currency,
          notes: {
            purpose: 'mentor_session_payout',
            bookingId: String(bookingId || ''),
          },
          on_hold: 0,
        },
      ];
    }

    const order = await razorpay.orders.create(orderPayload);

    return res.status(201).json({
      success: true,
      order: secureOrderResponse(order),
      distribution: {
        totalAmount,
        mentorAmount,
        platformAmount,
        mentorSharePercent: MENTOR_SHARE_PERCENT,
        platformCommissionPercent: PLATFORM_COMMISSION_PERCENT,
      },
      checkout: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
      },
    });
  } catch (error) {
    console.error('Error creating marketplace order:', error?.error || error);
    return res.status(500).json({
      success: false,
      error: error?.error?.description || 'Failed to create marketplace order',
    });
  }
});

/**
 * 3) Optional direct-transfer flow after payment capture verification.
 * Use this if you don't send transfers in order creation.
 */
app.post('/api/payments/transfers/direct', async (req, res) => {
  try {
    const {
      paymentId,
      orderId,
      signature,
      mentorLinkedAccountId,
      amount,
      currency = 'INR',
      bookingId,
    } = req.body;

    if (!paymentId || !orderId || !signature || !mentorLinkedAccountId || !amount) {
      return res.status(400).json({
        error: 'paymentId, orderId, signature, mentorLinkedAccountId and amount are required',
      });
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValidSignature) {
      return res.status(400).json({
        error: 'Invalid payment signature',
      });
    }

    const totalAmount = toPaise(amount);
    const mentorAmount = Math.round((totalAmount * MENTOR_SHARE_PERCENT) / 100);

    const transfer = await razorpay.transfers.create({
      account: mentorLinkedAccountId,
      amount: mentorAmount,
      currency,
      notes: {
        purpose: 'mentor_session_payout',
        bookingId: String(bookingId || ''),
        sourcePaymentId: paymentId,
      },
    });

    return res.status(201).json({
      success: true,
      transfer: {
        id: transfer.id,
        entity: transfer.entity,
        source: transfer.source,
        recipient: transfer.recipient,
        amount: transfer.amount,
        currency: transfer.currency,
        status: transfer.status,
        notes: transfer.notes || {},
        created_at: transfer.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating direct transfer:', error?.error || error);
    return res.status(500).json({
      success: false,
      error: error?.error?.description || 'Failed to create direct transfer',
    });
  }
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Razorpay Route service running on port ${PORT}`);
});
