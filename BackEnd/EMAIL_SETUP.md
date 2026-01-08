# Email Configuration for Password Reset Feature

## Required Configuration

Add the following to your `application.properties` or `application.yml`:

```properties
# Email Configuration (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Frontend URL (for generating activation links)
app.frontend.url=http://localhost:5173
```

## How to get Gmail App Password

1. Go to your Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate new app password
4. Copy the generated password and use it in `spring.mail.password`

## Testing

You can test email sending using a test email service like:
- **Mailtrap** (https://mailtrap.io) - for development
- **Ethereal** (https://ethereal.email) - temporary test emails

### Mailtrap Configuration Example:
```properties
spring.mail.host=smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=your-mailtrap-username
spring.mail.password=your-mailtrap-password
```

## Database Migration

Run this SQL to create the password_reset_tokens table:

```sql
CREATE TABLE password_reset_tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token_type VARCHAR(50) NOT NULL DEFAULT 'PASSWORD_RESET',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

## API Endpoints

### 1. Request Password Reset (Public)
```
POST /api/v1/password-reset/request?email=user@example.com
```

### 2. Validate Token (Public)
```
GET /api/v1/password-reset/validate?token=xxx-xxx-xxx
```

### 3. Set Password (Public)
```
POST /api/v1/password-reset/set-password
Body:
{
  "token": "xxx-xxx-xxx",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

## Flow

1. Admin creates user without password
2. Backend sends activation email with link: `http://localhost:5173/set-password?token=xxx`
3. User clicks link → Frontend shows "Set Password" page
4. User enters new password → Call `/set-password` API
5. Backend validates token, sets password, sends welcome email
6. User can now login with their password
