# ⚙️ SMART LIFE OS - PRODUCTION CONFIGURATION GUIDE

**Last Updated**: April 16, 2026  
**Purpose**: Configure all APIs and services for production deployment

---

## 📋 Table of Contents

1. [Gemini API Configuration](#gemini-api-configuration)
2. [Email (SMTP) Configuration](#email-smtp-configuration)
3. [Telegram Bot Configuration](#telegram-bot-configuration)
4. [Database Configuration](#database-configuration)
5. [Redis Configuration](#redis-configuration)
6. [JWT Secret Configuration](#jwt-secret-configuration)
7. [Environment Variables Reference](#environment-variables-reference)

---

## **STEP 1: GEMINI API CONFIGURATION** ✅ REQUIRED

### What is Gemini API?

Gemini is Google's AI model used for the **AI Sorter** feature. It classifies tasks into the Eisenhower Matrix (Urgent/Important categories).

### How to Get Gemini API Key:

**Step 1: Go to Google AI Studio**
```
URL: https://makersuite.google.com/app/apikey
```

**Step 2: Create an API Key**
- Click "Create API key in new project"
- Wait for API key generation
- Copy the key (looks like: `AIza...`)

**Step 3: Enable Generative AI API**
- Go to Google Cloud Console: https://console.cloud.google.com/
- Search for "Generative AI API"
- Click "Enable"

**Step 4: Set in .env**
```env
GEMINI_API_KEY=AIza_YOUR_API_KEY_HERE
```

### Verify Configuration:

```bash
# Test API key
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello"}]
    }]
  }'
```

### Features Enabled:
- ✅ AI Task Classification (Eisenhower Matrix)
- ✅ Task Priority Scoring
- ✅ Smart Recommendations
- ✅ Vietnamese AI Responses

### Cost:
- Free tier: 60 requests/minute
- Sufficient for most users
- Production: Upgrade to paid plan if needed

---

## **STEP 2: EMAIL (SMTP) CONFIGURATION** ⭐ RECOMMENDED

### What is SMTP?

SMTP (Simple Mail Transfer Protocol) enables the app to send email notifications for:
- Task reminders
- Schedule updates
- Panic Mode alerts
- Daily summaries

### How to Configure Gmail SMTP:

**Step 1: Enable 2-Factor Authentication**
- Go to: https://myaccount.google.com/security
- Find "2-Step Verification"
- Click "Enable"

**Step 2: Generate App Password**
- Go to: https://myaccount.google.com/apppasswords
- Select: "Mail" and "Windows Computer"
- Click "Generate"
- Copy the 16-character password

**Step 3: Update .env**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Example Configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

### Test Email Configuration:

```bash
# Create test script: test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'test@example.com',
  subject: 'Smart Life OS Test',
  html: '<h1>Configuration successful!</h1>'
}, (err, info) => {
  if (err) console.error('Error:', err);
  else console.log('Email sent:', info.response);
});

# Run test
node test-email.js
```

### Features Enabled:
- ✅ Email notifications
- ✅ Task reminders
- ✅ Schedule updates
- ✅ Emergency alerts

### Alternative SMTP Providers:

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| Gmail | smtp.gmail.com | 587 | Requires app password |
| Outlook | smtp-mail.outlook.com | 587 | Office 365 account |
| SendGrid | smtp.sendgrid.net | 587 | Free tier: 100 emails/day |
| AWS SES | email-smtp.region.amazonaws.com | 587 | Most reliable for production |

---

## **STEP 3: TELEGRAM BOT CONFIGURATION** 🔔 OPTIONAL

### What is Telegram Bot?

Telegram Bot enables instant notifications via Telegram messenger:
- Real-time task alerts
- Panic Mode notifications
- Daily summaries
- Focus Tracker reminders

### How to Create Telegram Bot:

**Step 1: Talk to BotFather**
- Open Telegram app
- Search: `@BotFather`
- Type: `/newbot`

**Step 2: Follow Instructions**
- Bot name: `Smart Life OS Bot`
- Bot username: `smartlife_os_bot` (must be unique)
- Copy the API Token

**Step 3: Update .env**
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

### Test Telegram Configuration:

```bash
# Get your chat ID
curl https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates

# Send test message
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage \
  -d "chat_id=<YOUR_CHAT_ID>&text=Smart%20Life%20OS%20is%20ready!"
```

### Features Enabled:
- ✅ Real-time notifications
- ✅ Task reminders
- ✅ Panic Mode alerts
- ✅ Focus sessions notifications

---

## **STEP 4: DATABASE CONFIGURATION** ✅ REQUIRED

### MySQL Configuration

**Default Credentials** (Change in production!):
```env
DB_USERNAME=smartlife
DB_PASSWORD=smartlife123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_life_os
```

### Production Setup:

**Option 1: AWS RDS MySQL**
```env
DB_HOST=smart-life-os.c9akciq32.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=GenerateStrongPassword123!
DB_NAME=smart_life_os
```

**Option 2: Docker MySQL**
```bash
docker run -d \
  --name smart-life-mysql \
  -e MYSQL_ROOT_PASSWORD=YourSecurePassword123! \
  -e MYSQL_DATABASE=smart_life_os \
  -e MYSQL_USER=smartlife \
  -e MYSQL_PASSWORD=YourSecurePassword123! \
  -p 3306:3306 \
  mysql:8.0
```

**Option 3: Local MySQL (Development)**
```bash
# Install MySQL
brew install mysql  # macOS
# or
choco install mysql  # Windows

# Start MySQL
mysql.server start

# Create database
mysql -u root -p
> CREATE DATABASE smart_life_os;
> CREATE USER 'smartlife'@'localhost' IDENTIFIED BY 'smartlife123';
> GRANT ALL ON smart_life_os.* TO 'smartlife'@'localhost';
```

### Initialize Database:

```bash
cd backend

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Optional: Seed sample data
npx prisma db seed
```

---

## **STEP 5: REDIS CONFIGURATION** ✅ REQUIRED

### What is Redis?

Redis is an in-memory cache used for:
- Session storage
- Real-time notifications
- Rate limiting
- Performance optimization

### Configuration:

**Default**:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Production**:
```env
REDIS_HOST=smart-life-os.ng5bzk.0001.usw2.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=YourRedisAuthToken123
```

### Start Redis:

```bash
# Docker
docker run -d \
  --name smart-life-redis \
  -p 6379:6379 \
  redis:7-alpine

# or Local (if installed)
redis-server

# Test connection
redis-cli ping  # Should return PONG
```

---

## **STEP 6: JWT SECRET CONFIGURATION** ✅ REQUIRED

### What is JWT?

JWT (JSON Web Tokens) are used for user authentication and API security.

### Generate Secure JWT Secret:

```bash
# Generate random 32-byte hex string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z...
```

### Set in .env:

```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z...
```

### Security Notes:
- ✅ Use strong random string
- ✅ Change on every production deployment
- ✅ Store in secure vault
- ✅ Never commit to git
- ✅ Rotate keys every 90 days

---

## **STEP 7: ENVIRONMENT VARIABLES REFERENCE**

### Complete .env File Template:

```env
# ============================================================================
# SERVER CONFIGURATION
# ============================================================================
NODE_ENV=production
PORT=8080

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DATABASE_URL=mysql://smartlife:smartlife123@localhost:3306/smart_life_os
DB_USERNAME=smartlife
DB_PASSWORD=smartlife123
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_life_os

# ============================================================================
# REDIS CONFIGURATION
# ============================================================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================================================
# AUTHENTICATION
# ============================================================================
JWT_SECRET=your-secure-random-jwt-secret-here
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d

# ============================================================================
# AI CONFIGURATION (Required for AI Sorter)
# ============================================================================
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# ============================================================================
# EMAIL CONFIGURATION (Optional - for notifications)
# ============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Smart Life OS

# ============================================================================
# TELEGRAM CONFIGURATION (Optional - for notifications)
# ============================================================================
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_CHAT_ID

# ============================================================================
# FRONTEND CONFIGURATION
# ============================================================================
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=Smart Life OS
NEXT_PUBLIC_APP_VERSION=1.0.0

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL=info
LOG_FILE=logs/app.log

# ============================================================================
# CORS CONFIGURATION
# ============================================================================
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
```

### Environment-Specific Configs:

**Development** (`.env.development`):
```env
NODE_ENV=development
DEBUG=*
LOG_LEVEL=debug
DATABASE_URL=mysql://root:@localhost:3306/smart_life_os_dev
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**Production** (`.env.production`):
```env
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=mysql://smartlife:PASSWORD@db.example.com:3306/smart_life_os
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
```

---

## **CONFIGURATION CHECKLIST**

- [ ] Gemini API Key configured
- [ ] SMTP credentials configured
- [ ] Database credentials set
- [ ] Redis connection verified
- [ ] JWT Secret generated
- [ ] Environment file created
- [ ] All variables validated
- [ ] Security audit passed
- [ ] Logs configured
- [ ] CORS configured

---

## **SECURITY BEST PRACTICES**

### Do's ✅
- ✅ Use environment variables (never hardcode)
- ✅ Use strong passwords (min 16 characters)
- ✅ Rotate secrets every 90 days
- ✅ Use HTTPS in production
- ✅ Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
- ✅ Enable 2FA for all accounts
- ✅ Use API rate limiting
- ✅ Monitor API usage

### Don'ts ❌
- ❌ Never commit .env files to git
- ❌ Never share API keys
- ❌ Never use default passwords
- ❌ Never log sensitive data
- ❌ Never disable CORS in production
- ❌ Never expose error details to users

---

## **TROUBLESHOOTING**

| Issue | Solution |
|-------|----------|
| Gemini API returns 401 | Check API key is correct and enabled |
| Email not sending | Verify SMTP credentials and enable "Less secure apps" |
| Database connection refused | Check MySQL running, host/port correct, firewall |
| Redis connection timeout | Check Redis running, host/port correct |
| JWT validation error | Regenerate JWT_SECRET, clear browser storage |
| CORS error | Add domain to CORS_ORIGIN, restart server |

---

## **NEXT STEPS**

1. ✅ Configure GEMINI_API_KEY
2. ⏳ Configure SMTP (optional)
3. ⏳ Configure Telegram (optional)
4. ✅ Setup Database
5. ✅ Setup Redis
6. ✅ Generate JWT Secret
7. 🚀 Deploy to production

**All configurations complete! Ready for deployment.** 🎉
