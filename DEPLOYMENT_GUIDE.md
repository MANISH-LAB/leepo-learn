# Leepo Learn - Vercel Deployment Guide

## ✅ Completed Pre-Deployment Tasks

All critical pre-deployment tasks have been completed:

1. ✅ **Favicon Created** - SVG favicon with graduation cap design
2. ✅ **SEO Meta Tags Added** - Complete Open Graph, Twitter Cards, and meta tags
3. ✅ **Console Logs Removed** - Automatic removal in production builds via Vite config
4. ✅ **Subscriptions Table Created** - SQL schema ready for Supabase
5. ✅ **Purchase Tracking Implemented** - Purchases now save to database
6. ✅ **Vercel Configuration** - vercel.json created with security headers

---

## 📋 Deployment Steps

### Step 1: Run the Subscriptions Migration in Supabase

Before deploying, create the subscriptions table in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `create_subscriptions_table.sql`
4. Copy all the SQL code
5. Paste it into the Supabase SQL editor
6. Click **Run** to execute the migration

This will create:
- `subscriptions` table with proper columns
- Indexes for performance
- Row Level Security (RLS) policies
- A view for active subscriptions

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (for first deployment)
   - Project name? `leepo-learn` (or your preferred name)
   - Directory? `./` (current directory)
   - Override settings? **No**

4. **For Production Deployment**:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Environment Variables in Vercel

After deployment, add your environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. Click **Save**
5. Redeploy the project for changes to take effect

### Step 4: Update Domain Settings (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain: `leepolearn.com`
3. Update the OG image URL in `index.html` to your actual domain
4. Vercel will provide DNS instructions

---

## 🔧 Post-Deployment Checklist

### Required Before Launch:
- [ ] Run subscriptions migration in Supabase
- [ ] Add environment variables to Vercel
- [ ] Test authentication flow (Google OAuth)
- [ ] Test "purchase" flow and verify data saves to subscriptions table
- [ ] Test all pages load correctly
- [ ] Verify mobile responsiveness
- [ ] Check that console.logs are removed in production (inspect browser console)

### Recommended:
- [ ] Create and upload OG image (`/public/og-image.png`)
- [ ] Create favicon.ico and apple-touch-icon.png
- [ ] Set up custom domain
- [ ] Add analytics (Google Analytics, Plausible, etc.)
- [ ] Set up error monitoring (Sentry)
- [ ] Test with real users

---

## 🧪 Testing Your Deployment

1. **Test Authentication**:
   - Click "Enroll Now"
   - Try Google OAuth login
   - Complete onboarding flow

2. **Test Purchase Flow**:
   - Navigate to a premium subject
   - Click "Upgrade" or "Get Access"
   - Complete mock payment
   - Check Supabase dashboard → subscriptions table
   - Verify record was created

3. **Test SEO**:
   - View page source (Ctrl+U)
   - Verify meta tags are present
   - Test with: https://www.opengraph.xyz/

4. **Test Mobile**:
   - Open on mobile device
   - Check all pages
   - Verify navigation works

---

## 📊 Database Helper Functions

The following functions are now available in `src/utils/supabase/database.ts`:

- `createSubscription()` - Save a new subscription
- `getUserActiveSubscriptions(userId)` - Get user's active subscriptions
- `userHasAccessToSubject(userId, subjectId)` - Check subject access
- `userHasAccessToYear(userId, yearId)` - Check year access
- `getUserAccessibleContent(userId)` - Get all accessible content

Example usage:
```typescript
import { createSubscription, getUserActiveSubscriptions } from './utils/supabase/database';

// Create subscription after payment
await createSubscription({
  user_id: user.id,
  purchase_type: 'year',
  year_ids: ['year-1-id'],
  subject_ids: [],
  total_price: 30,
  payment_status: 'completed',
  payment_method: 'razorpay',
});

// Check user's subscriptions
const subs = await getUserActiveSubscriptions(user.id);
```

---

## 🚀 Next Steps (After Payment Gateway Integration)

When you add a real payment gateway:

1. Install payment SDK (Razorpay/Stripe):
   ```bash
   npm install razorpay
   # or
   npm install @stripe/stripe-js
   ```

2. Update `handlePayment` in `PaymentModal.tsx`:
   - Replace setTimeout with actual payment processing
   - Set `payment_status` to 'pending' initially
   - Update to 'completed' after successful payment
   - Add `payment_id` from gateway response
   - Set `payment_method` to actual method used

3. Add webhook endpoint to verify payments

4. Test thoroughly with test mode before going live

---

## 📝 Important Notes

- **Demo Mode**: Currently uses mock payments. Subscriptions are saved as 'completed' automatically.
- **Console Logs**: Automatically removed in production builds (vite.config.ts)
- **RLS Security**: Subscriptions table has Row Level Security enabled
- **Admin Access**: Admin (manishkalyan141@gmail.com) has full access to subscriptions
- **Lifetime Access**: All subscriptions default to lifetime access (`is_lifetime: true`)

---

## 🆘 Troubleshooting

### Build Fails
- Check all dependencies are installed: `npm install`
- Verify Node version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules .next dist && npm install`

### Environment Variables Not Working
- Make sure variable names start with `VITE_`
- Redeploy after adding variables
- Check Vercel logs for errors

### Database Errors
- Verify RLS policies allow authenticated users
- Check Supabase logs for errors
- Ensure environment variables are correct

### SEO Not Working
- Update OG image URL to your actual domain
- Create actual OG image file
- Test with validators

---

## 📞 Support

For issues or questions:
- GitHub Issues: Create an issue
- Email: info@leepo.ai
- Check Vercel logs for deployment errors
- Check Supabase logs for database errors

---

**Happy Deploying! 🎉**
