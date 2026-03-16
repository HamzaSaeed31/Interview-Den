# Signup 422 Error - Debugging Guide

## 🔍 Common Causes of 422 Error

The 422 (Unprocessable Entity) error from Supabase auth typically occurs due to:

1. **Password too short** - Must be at least 6 characters
2. **Invalid email format** - Must be a valid email address
3. **Email already exists** - Email is already registered
4. **Missing required fields** - Email or password is empty
5. **Auth configuration issues** - Supabase local instance not running properly

---

## ✅ Checklist Before Testing

### 1. Verify Supabase is Running

```bash
# Check if Supabase is running
npx supabase status

# You should see:
# ✔ supabase local development setup is running.
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Studio URL: http://127.0.0.1:54323
```

If not running:
```bash
npx supabase start
```

### 2. Check Database Tables

Open Supabase Studio: `http://127.0.0.1:54323`

Verify these tables exist:
- ✅ `profiles` (id, email, name, user_type)
- ✅ `candidates` (id, resumes, skills, experience)
- ✅ `companies` (id, company_name, industry, size, etc.)
- ✅ `applications` (id, candidate_id, job_id, etc.)

### 3. Test Password Requirements

Passwords must be:
- ✅ At least 6 characters long
- ✅ Not empty

### 4. Test Email Format

Emails must be:
- ✅ Valid format (user@example.com)
- ✅ Not already registered
- ✅ Lowercase (code now handles this automatically)

---

## 🧪 Step-by-Step Testing

### Test 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to sign up
4. Look for console.log messages:
   - "Attempting signup with: {...}"
   - "Signup response: {...}"
   - Any error messages

### Test 2: Check Network Tab

1. Open DevTools → Network tab
2. Try to sign up
3. Look for the `/auth/v1/signup` request
4. Click on it to see:
   - **Request payload** - What data was sent
   - **Response** - What error message was returned

### Test 3: Check Response Details

In the Network tab, look at the response:

**Common Error Responses:**

#### Password too short:
```json
{
  "code": "password_too_short",
  "message": "Password must be at least 6 characters"
}
```

#### Invalid email:
```json
{
  "code": "invalid_email",
  "message": "Invalid email format"
}
```

#### Email exists:
```json
{
  "code": "user_already_exists",
  "message": "User already registered"
}
```

---

## 🔧 Fixes Applied

I've updated the signup page with:

### 1. Enhanced Validation
- ✅ Check password length (min 6 chars)
- ✅ Check passwords match
- ✅ Check required fields
- ✅ Trim and lowercase email

### 2. Better Error Messages
- ✅ Specific error messages for each validation
- ✅ Toast notifications for user feedback
- ✅ Console logs for debugging

### 3. Database Record Creation
- ✅ Create candidates record for candidate signups
- ✅ Initialize resumes array as empty []
- ✅ Better error handling for database operations

### 4. Visual Hints
- ✅ "Minimum 6 characters" hint under password fields
- ✅ HTML5 minLength validation

---

## 🎯 Try This Test

### Simple Company Signup Test:

1. **Navigate to signup page:** `http://localhost:3000/signup`

2. **Switch to Company tab**

3. **Fill in the form:**
   ```
   Company Name: Test Company
   Email: testcompany@example.com
   Password: password123 (at least 6 chars)
   Confirm Password: password123
   Industry: Technology (optional)
   Size: 10-50 (optional)
   ```

4. **Open DevTools Console (F12)**

5. **Click "Sign up as Company"**

6. **Check console logs:**
   - Should see: "Attempting signup with: {email: ..., userType: 'company'}"
   - Then: "Signup response: {user: {...}}"
   - Then: "User created, creating profile..."
   - Then: "Creating company record..."
   - Finally: Toast notification "Signup successful!"

---

## 🐛 If Still Getting 422 Error

### Check Exact Error Details:

1. **Open DevTools → Network tab**
2. **Filter by "signup"**
3. **Click on the failed request**
4. **Go to Response tab**
5. **Copy the error message**

### Common Issues:

#### Issue 1: "Password is too weak"
**Solution:** Use a longer password with numbers/symbols
```
Good: password123
Bad: pass
```

#### Issue 2: "Email already exists"
**Solution:** Use a different email or clear the database
```bash
# Reset database
npx supabase db reset
```

#### Issue 3: "Invalid email format"
**Solution:** Check email format
```
Good: user@example.com
Bad: user@example
Bad: user.example.com
```

#### Issue 4: Database constraint error
**Solution:** Check if tables have proper foreign key constraints

```sql
-- Check profiles table
SELECT * FROM profiles WHERE email = 'testcompany@example.com';

-- If exists, delete it
DELETE FROM profiles WHERE email = 'testcompany@example.com';
```

---

## 🔄 Fresh Start Test

If nothing works, try a complete reset:

### 1. Stop Supabase
```bash
npx supabase stop
```

### 2. Start Fresh
```bash
npx supabase start
```

### 3. Check Status
```bash
npx supabase status
```

### 4. Verify Database Schema
```bash
# Open Studio
open http://127.0.0.1:54323

# Check tables exist in Table Editor
```

### 5. Try Signup Again
Use a fresh email you haven't tried before

---

## 📊 Verify Database After Successful Signup

After a successful signup, check the database:

```sql
-- Check profiles
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Check companies (if signed up as company)
SELECT * FROM companies ORDER BY created_at DESC LIMIT 5;

-- Check candidates (if signed up as candidate)
SELECT * FROM candidates ORDER BY created_at DESC LIMIT 5;
```

All three records should exist with the same `id` (user UUID).

---

## 🎯 Expected Successful Flow

### Console Logs:
```
Attempting signup with: {email: "test@example.com", userType: "company"}
Signup response: {user: {id: "...", email: "test@example.com"}}
User created, creating profile...
Creating company record...
✅ Signup successful! You can now login.
```

### Database:
```
profiles: 1 new row
companies: 1 new row
Total records: 2 (linked by same id)
```

### UI:
```
✅ Toast: "Signup successful! You can now login."
→ Redirect to /login
```

---

## 📞 Still Having Issues?

If you're still seeing the 422 error:

1. **Share the console logs** - Copy everything from console
2. **Share the network response** - Screenshot or copy the JSON response
3. **Share the form data** - What values did you enter?

This will help identify the exact issue!

---

## ✅ Quick Fix Checklist

- [ ] Supabase is running (`npx supabase status`)
- [ ] Password is at least 6 characters
- [ ] Email is valid format
- [ ] Email hasn't been used before
- [ ] Console shows detailed logs
- [ ] Network tab shows the exact error
- [ ] All required tables exist in database

---

**Updated:** All validation and error handling has been improved in the signup page.
**Next Step:** Try signing up with the test data above and check console logs!

