# Email Setup Guide for Production (Render)

## Problem
Emails not sending in production because Gmail authentication is not configured properly.

## ✅ What I Fixed in Code

1. **sendMail.js** - Changed from callback to async/await
2. **cars.controller.js** - Added proper error handling for test drive emails
3. **auth.controller.js** - Added proper error handling for OTP emails
4. Now you'll see clear console logs: `✅ Email sent` or `❌ Email failed`

## 🔧 Setup Gmail App Password (Required for Production)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow steps to enable it (required for App Passwords)

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as device → Type "4Wheeler Backend"
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Add to Render Environment Variables
1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your **4Wheeler backend service**
3. Go to **Environment** tab
4. Add these variables:

```
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=abcdefghijklmnop         (the 16-char App Password, NO SPACES)
```

5. Click **Save Changes**
6. Render will automatically redeploy

## 🧪 Testing After Setup

### Test 1: Forgot Password (OTP Email)
```bash
POST https://fourwheeler.onrender.com/api/auth/users/forgot-password
Body: { "email": "test@example.com" }
```
**Expected:** OTP email arrives in inbox within 1 minute

### Test 2: Test Drive Booking
```bash
POST https://fourwheeler.onrender.com/api/cars/test-drive/{carId}
Headers: Cookie with valid access_token
Body: { "name": "John", "phone": "+1234567890" }
```
**Expected:** Confirmation email arrives with booking details

## 🔍 Debugging

### Check Render Logs
1. Go to Render dashboard → Your service → **Logs** tab
2. Look for these messages:
   - ✅ `Email sent successfully: 250 OK`
   - ❌ `Email sending failed: Invalid login`

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid login` | Wrong email/password | Regenerate App Password |
| `Timeout` | Gmail blocked suspicious activity | Enable "Less secure app access" temporarily |
| `No response` | Environment variables not set | Check Render Environment tab |
| `535 Authentication failed` | Not using App Password | Must use 16-char App Password, not regular password |

## 📧 Response Changes

### Before (Broken)
```json
{
  "message": "Test drive booked successfully! Confirmation email sent."
}
```
**Problem:** Always says "sent" even if it failed

### After (Fixed)
```json
// Success
{
  "message": "Test drive booked successfully! Confirmation email sent.",
  "emailSent": true
}

// Email failed but booking succeeded
{
  "message": "Test drive booked successfully! However, confirmation email failed to send.",
  "emailSent": false
}
```

## 🚨 Important Notes

1. **Never commit `.env` file** - Keep it in `.gitignore`
2. **App Password ≠ Gmail Password** - They are different
3. **Remove spaces** from App Password when pasting
4. **Gmail has sending limits:**
   - 500 emails/day for free accounts
   - 2000 emails/day for Google Workspace

## Alternative: Use SendGrid (Optional)

If Gmail doesn't work, consider SendGrid (free 100 emails/day):

```javascript
// In sendMail.js
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

Environment variables:
```
EMAIL_USER=noreply@4wheeler.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```
