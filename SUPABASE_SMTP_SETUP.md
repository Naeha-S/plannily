# Supabase SMTP & Email Configuration for Plannily

To use Brevo for your Auth emails (Signup Verification, Forgot Password), you must configure the SMTP settings directly in your Supabase Dashboard. Since this is a critical security configuration, it cannot be set via code in the frontend.

## 1. Configure SMTP Settings

1.  Log in to your **Supabase Dashboard**.
2.  Go to **Project Settings** (gear icon) -> **Auth**.
3.  Scroll down to **SMTP Settings**.
4.  Toggle **Enable Custom SMTP** to **ON**.
5.  Enter the following details (provided by you):
    *   **Sender Email**: `support@plannily.com` (or your verified domain email in Brevo)
    *   **Sender Name**: `Plannily`
    *   **Host**: `smtp-relay.brevo.com`
    *   **Port**: `587`
    *   **Username**: `9d5245001@smtp-brevo.com`
    *   **Password**: `YOUR_BREVO_SMTP_KEY` (Check your Brevo Dashboard)
6.  Click **Save**.

---

## 2. Email Templates

Update your email templates in Supabase (Auth -> Email Templates) with these modern, Plannily-styled designs.

### A. Confirm Signup (Verification)

**Subject:** Welcome to Plannily! Confirm your wings ✈️

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background-color: #f43f5e; padding: 40px 0; text-align: center; background-image: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); }
    .header h1 { color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 32px; letter-spacing: -0.5px; }
    .content { padding: 40px; text-align: center; }
    .text { color: #44403c; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #f43f5e; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); }
    .footer { background-color: #fafaf9; padding: 20px; text-align: center; font-size: 12px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plannily</h1>
    </div>
    <div class="content">
      <h2 style="color: #1c1917; margin-top: 0;">Let's get you flying!</h2>
      <p class="text">Hi there,</p>
      <p class="text">Welcome to Plannily. You're just one click away from planning your next great adventure. Please confirm your email address to get started.</p>
      
      <a href="{{ .ConfirmationURL }}" class="btn">Confirm Email Address</a>
      
      <p class="text" style="font-size: 14px; color: #78716c;">If you didn't sign up for Plannily, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; 2024 Plannily. All rights reserved.<br>
      Find your wings.
    </div>
  </div>
</body>
</html>
```

### B. Reset Password

**Subject:** Reset your Plannily password 🔐

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background-color: #1c1917; padding: 40px 0; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 32px; letter-spacing: -0.5px; }
    .content { padding: 40px; text-align: center; }
    .text { color: #44403c; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #1c1917; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
    .footer { background-color: #fafaf9; padding: 20px; text-align: center; font-size: 12px; color: #a8a29e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plannily</h1>
    </div>
    <div class="content">
      <h2 style="color: #1c1917; margin-top: 0;">Password Reset Request</h2>
      <p class="text">Hi there,</p>
      <p class="text">We received a request to reset your password. No worries, it happens to the best of us.</p>
      
      <a href="{{ .ConfirmationURL }}" class="btn">Reset Password</a>
      
      <p class="text" style="font-size: 14px; color: #78716c;">If you didn't request a password reset, please ignore this email.</p>
    </div>
    <div class="footer">
      &copy; 2024 Plannily. All rights reserved.
    </div>
  </div>
</body>
</html>
```
