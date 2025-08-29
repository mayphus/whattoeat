# Clerk Authentication Setup

## 1. Create Clerk Application

1. Go to https://clerk.com/
2. Create a free account
3. Create a new application
4. Choose "Email, Google, and more" for sign-in options
5. Copy your keys from the dashboard

## 2. Update Environment Variables

Update `.env` and `.env.local` files with your keys:

```bash
# Replace with your actual keys from Clerk dashboard
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-key-here
CLERK_SECRET_KEY=sk_test_your-actual-secret-key-here
```

## 3. Create 'alex' User

1. In Clerk Dashboard → Users
2. Click "Create User"  
3. Username: `alex`
4. Email: `alex@example.com`
5. Password: Generate random password and save it

## 4. Test Authentication

1. Run `npm run dev`
2. Visit http://localhost:5173
3. You should be redirected to sign-in page
4. Sign in with alex's credentials
5. You should see the recipe app with user menu

## 5. Backend Token Validation (Next Step)

The frontend is now ready. Next we need to update the Cloudflare Worker to validate Clerk JWT tokens.