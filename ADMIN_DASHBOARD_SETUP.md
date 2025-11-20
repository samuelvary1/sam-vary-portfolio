# Secret Goal Progress Dashboard - Setup Guide

## 🔐 Overview

This is a hidden admin dashboard for tracking personal 2025–2026 goals. Only accessible with a secret key.

## 📋 Setup Steps

### 1. Install Firebase Dependencies

```bash
npm install firebase
```

### 2. Configure Environment Variables

Update `.env.local` with your actual values:

```env
# Secret Admin Key (choose a strong, unique key)
NEXT_PUBLIC_ADMIN_SECRET_KEY=your-super-secret-key-12345

# Firebase Configuration (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database:
   - Click "Firestore Database" in the left menu
   - Click "Create database"
   - Start in **production mode**
   - Choose your region
4. Get your config values:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the config values to your `.env.local`

### 4. Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to goals collection
    // (You can add authentication later for extra security)
    match /goals/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**For Production (More Secure):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /goals/{document=**} {
      // Only allow from your domain
      allow read, write: if request.auth != null ||
        request.headers.referer.matches('https://yourdomain.com/.*');
    }
  }
}
```

### 5. Create Firestore Collection

The code will auto-create the document, but you can manually create it:

1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `goals`
4. Document ID: `2025`
5. Add fields (all Number type, value 0):
   - `Lose weight / get in shape`
   - `Quit weed`
   - `Get a promotion`
   - `Launch an app or a game`
   - `Grow YouTube channel`
   - `Write a new short story / get published`
   - `Have a baby`
   - `Pay off debt / grow investments`
   - `Read more books`
   - `Watch more movies / shows`
   - `Make more art / miniatures / music`
   - `Travel more / go on dates etc.`
   - `Fishing / Golf / Biking / Hockey`
   - `Build out personal site`
   - `Play more meaningful games`
   - `Declutter the house / garage etc.`

### 6. Access the Dashboard

Visit:

```
http://localhost:3000/admin/progress?key=your-super-secret-key-12345
```

Replace `your-super-secret-key-12345` with your actual secret key from `.env.local`.

**⚠️ IMPORTANT:** Never share this URL or commit your `.env.local` file to Git!

## 🎨 Features

- ✅ 16 goal sliders (0-100%)
- ✅ Real-time progress bars with gradient colors
- ✅ Auto-save to Firestore
- ✅ Secret key protection
- ✅ Responsive design with Tailwind
- ✅ Smooth animations and hover effects
- ✅ Success/error messages
- ✅ Loading states

## 🔒 Security Notes

1. **Keep your secret key private** - Don't share the admin URL
2. **Add to .gitignore**: Make sure `.env.local` is in `.gitignore`
3. **Consider adding authentication** for production
4. **Use HTTPS** in production
5. **Restrict Firestore rules** to your domain in production

## 🚀 Deployment

When deploying (Vercel, Netlify, etc.):

1. Add all environment variables to your hosting platform
2. Don't expose the admin route publicly
3. Consider adding IP whitelisting or Firebase Authentication
4. Update Firestore security rules to match your production domain

## 📱 Usage

1. Open the secret URL with your key
2. Adjust sliders for each goal (0-100%)
3. Click "Save All Progress" button
4. Changes are saved to Firebase instantly
5. Refresh to see persisted data

## 🛠️ Troubleshooting

**Dashboard redirects to home:**

- Check that the `key` query param matches `NEXT_PUBLIC_ADMIN_SECRET_KEY`

**Firebase errors:**

- Verify all Firebase env vars are correct
- Check Firestore security rules
- Make sure Firestore is enabled in Firebase Console

**Data not saving:**

- Check browser console for errors
- Verify Firestore rules allow writes
- Check network tab for failed requests

## 📝 File Structure

```
src/
├── app/
│   └── admin/
│       └── progress/
│           └── page.jsx          # Main dashboard component
├── lib/
│   └── firebase.js               # Firebase initialization
.env.local                        # Environment variables (DO NOT COMMIT)
```

---

**Keep this dashboard secret and track those goals! 🎯**
