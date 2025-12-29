# Razorpay Payment Integration Guide

## ✅ Integration Complete!

Your Razorpay business account has been successfully integrated into Leepo Learn.

---

## 📋 What Was Done:

### 1. **Environment Variables** (.env)
- Added `VITE_RAZORPAY_KEY_ID` = `rzp_test_RxOWRkcTuglNEG`
- Added `VITE_RAZORPAY_KEY_SECRET` = `CoYTIM7rgve51LFkyyxYGhnv`

### 2. **Razorpay SDK**
- Installed `razorpay` package
- Added Razorpay Checkout script to `index.html`

### 3. **Backend API Routes** (server/routes/razorpay.js)
- `POST /api/razorpay/create-order` - Creates Razorpay order
- `POST /api/razorpay/verify-payment` - Verifies payment signature
- `GET /api/razorpay/payment/:paymentId` - Fetches payment details

### 4. **Frontend Integration** (PaymentModal.tsx)
- Replaced demo payment with real Razorpay checkout
- Integrated order creation and payment verification
- Added proper error handling

### 5. **Database Schema**
- Added `order_id` column to `subscriptions` table
- Stores both `payment_id` and `order_id` from Razorpay

---

## 🚀 How to Test:

### Step 1: Run Database Migration
Execute this SQL in your Supabase SQL Editor:
```sql
-- Run: add_razorpay_order_id.sql
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON public.subscriptions(order_id);
```

### Step 2: Start Backend Server
```bash
cd "D:\student cse guys\Build Admin Command Center (2)"
node server/index.js
```

You should see:
```
🚀 Server running on http://localhost:3010
📊 API endpoints:
   ...
   - POST /api/razorpay/create-order
   - POST /api/razorpay/verify-payment
   - GET  /api/razorpay/payment/:paymentId
```

### Step 3: Start Frontend
```bash
npm run dev
```

### Step 4: Test Payment Flow
1. **Login** to your app
2. **Click "Upgrade"** or access payment modal
3. **Select** a year or subjects
4. **Click "Pay"** button
5. Razorpay checkout will open
6. Use **Test Cards** (Test Mode):

   ✅ **Success**: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

   ❌ **Failure**: `4000 0000 0000 0002`

7. Complete payment
8. Verify subscription in database:
```sql
SELECT * FROM subscriptions
WHERE payment_method = 'razorpay'
ORDER BY created_at DESC LIMIT 5;
```

---

## 🔐 Security Notes:

### ⚠️ IMPORTANT:
- **Test Keys** are currently active (for development)
- **DO NOT** commit `.env` file to Git
- Keep `VITE_RAZORPAY_KEY_SECRET` secure

### For Production:
1. Switch to **Live Mode** in Razorpay Dashboard
2. Generate **Live API Keys**
3. Replace test keys in `.env`:
   ```bash
   VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
   VITE_RAZORPAY_KEY_SECRET=your_live_secret
   ```
4. Test thoroughly before going live

---

## 💡 Test Card Numbers:

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | `4111 1111 1111 1111` | ✅ Payment succeeds |
| Success (Visa) | `4012 8888 8888 1881` | ✅ Payment succeeds |
| Success (Mastercard) | `5555 5555 5555 4444` | ✅ Payment succeeds |
| Failure | `4000 0000 0000 0002` | ❌ Card declined |
| Auth Failure | `4000 0000 0000 9995` | ❌ Insufficient funds |

**For all cards:**
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- Name: Any name

---

## 📊 Verify Payments:

### In Razorpay Dashboard:
1. Go to **Transactions** → **Payments**
2. You'll see all test payments
3. Check status, amount, customer details

### In Your Database:
```sql
-- Check recent subscriptions
SELECT
  id,
  user_id,
  purchase_type,
  total_price,
  payment_status,
  payment_id,
  order_id,
  created_at
FROM subscriptions
WHERE payment_method = 'razorpay'
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting:

### Issue: "Failed to create order"
**Solution**: Make sure backend server is running on port 3010

### Issue: "Razorpay is not defined"
**Solution**: Ensure Razorpay script is loaded in index.html

### Issue: Payment verification fails
**Solution**:
- Check backend logs for errors
- Verify `VITE_RAZORPAY_KEY_SECRET` is correct
- Ensure database has `order_id` column

### Issue: CORS errors
**Solution**: Backend already has CORS enabled. Check if backend is running.

---

## 🎯 Next Steps:

1. ✅ Test payment flow thoroughly
2. ✅ Verify database updates
3. ✅ Test with different scenarios (success/failure)
4. ✅ When ready for production:
   - Get Live API keys
   - Update environment variables
   - Test with real card in Live Mode
   - Monitor transactions in Razorpay Dashboard

---

## 📞 Support:

If you encounter issues:
1. Check backend console logs
2. Check browser console for errors
3. Verify Razorpay Dashboard for transaction status
4. Contact Razorpay support: support@razorpay.com

---

**🎉 You're all set! Your Razorpay integration is ready to test.**
