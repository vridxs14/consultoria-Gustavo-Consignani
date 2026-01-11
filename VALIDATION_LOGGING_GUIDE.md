# Email Validation & Logging System

## Overview

This document describes the new validation and logging utilities added to your project in `assets/js/utils.js`.

---

## 1. Logger Utility

A comprehensive logging system that replaces console.log with structured, timestamped logs.

### Features
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Timestamps**: All logs are automatically timestamped
- **Memory History**: Logs are stored in memory (last 100 entries by default)
- **Export Capability**: Export logs as JSON for debugging
- **Production-Ready**: Can be toggled on/off via `Logger.enableConsole`

### Usage Examples

```javascript
import { Logger } from './utils.js';

// Info level - for important application events
Logger.info('User logged in successfully', { email: 'user@example.com' });

// Debug level - for detailed debugging information
Logger.debug('Form submitted', { formData: {...} });

// Warn level - for potential issues
Logger.warn('Missing user data', { userId: '123' });

// Error level - for errors and exceptions
Logger.error('Failed to save data', { code: 'NETWORK_ERROR', message: 'Connection timeout' });
```

### Accessing Log History

```javascript
// Get all logs
const allLogs = Logger.getHistory();

// Export logs as JSON string (useful for sending to server)
const logsJSON = Logger.exportLogs();
console.log(logsJSON);

// Clear logs
Logger.clearHistory();
```

### Configuration

```javascript
// Disable console output in production
Logger.enableConsole = false; // Logs still stored in memory

// Logs are still accessible via getHistory() for analytics
```

### Log Format

Logs are stored with this structure:
```json
{
  "timestamp": "2026-01-11T10:30:45.123Z",
  "level": "INFO",
  "message": "User logged in successfully",
  "data": { "email": "user@example.com" }
}
```

---

## 2. Email Validator Utility

Comprehensive email validation with detailed error messages.

### Features
- **RFC 5322 Compliant**: Follows email standards
- **Multiple Validation Checks**:
  - Format validation
  - Length validation (max 254 chars)
  - Local part validation (max 64 chars)
  - Domain validation
  - TLD validation (min 2 chars)
- **User-Friendly Error Messages**: Portuguese error messages
- **Sanitization**: Trim and lowercase emails

### Usage Examples

```javascript
import { EmailValidator } from './utils.js';

// Check if email is valid
const isValid = EmailValidator.isValid('user@example.com');
// Returns: true or false

// Sanitize email
const cleanEmail = EmailValidator.sanitize('  USER@EXAMPLE.COM  ');
// Returns: 'user@example.com'

// Get specific error message
const error = EmailValidator.getErrorMessage('invalid-email');
// Returns: 'O formato do e-mail não é válido.'
```

### Validation Checks

The validator checks for:
- Empty or whitespace-only emails
- Invalid type (non-string)
- Length exceeds 254 characters
- Missing @ symbol
- Local part (before @) exceeds 64 characters
- Local part starts/ends with dot
- Consecutive dots in local part
- Invalid domain format
- TLD shorter than 2 characters

### Error Messages

All error messages are in Portuguese:
- "O e-mail não pode estar vazio."
- "O e-mail deve ser um texto válido."
- "O formato do e-mail não é válido."
- "O domínio deve ter pelo menos um ponto."
- And more specific messages...

---

## 3. Form Validator Utility

General form validation utilities for passwords and complete form validation.

### Features
- **Password Validation**: Strength checking with detailed feedback
- **Password Matching**: Compare two passwords
- **Batch Validation**: Validate entire forms at once
- **Strength Detection**: Identifies password strength level

### Usage Examples

```javascript
import { FormValidator } from './utils.js';

// Validate password
const pwdResult = FormValidator.validatePassword('MyPassword123');
// Returns: { isValid: true, message: '...', strength: 'strong' }

// Check if passwords match
const match = FormValidator.passwordsMatch('pass123', 'pass123');
// Returns: true

// Validate entire form
const validation = FormValidator.validateForm({
    email: 'user@example.com',
    password: 'MyPass123',
    confirmPassword: 'MyPass123'
});

// Returns:
// {
//   isValid: true,
//   errors: {}
// }

// If there are errors:
// {
//   isValid: false,
//   errors: {
//     email: 'O formato do e-mail não é válido.',
//     password: 'A senha deve ter pelo menos 6 caracteres.'
//   }
// }
```

### Password Validation Rules

- Minimum 6 characters
- Maximum 128 characters
- Must be non-empty
- Strength detection: "strong" if contains letters and numbers, "medium" otherwise

---

## 4. Integration with Existing Code

The utilities have been integrated into your existing files:

### auth.js
- Uses `EmailValidator` for email validation before submission
- Uses `FormValidator` for complete form validation on registration
- Uses `Logger` for all authentication events

### anamnese.js
- Uses `Logger` for form submission and data events
- Tracks user access and logout events

### dashboard.js
- Uses `Logger` for user access and data retrieval
- Tracks logout events and errors

### main.js
- No changes needed (utility file)

---

## 5. Accessing Logs in Browser

You can access logs directly in the browser console:

```javascript
// In browser console:
Logger.getHistory();  // See all logs
Logger.exportLogs();  // Export as JSON
```

This is useful for:
- Debugging user issues
- Monitoring application behavior
- Creating analytics
- Troubleshooting authentication problems

---

## 6. Future Enhancements

Potential improvements:
- Send logs to a backend server for centralized monitoring
- Add log levels filtering (show only errors, for example)
- Implement log rotation and storage limits
- Add performance monitoring
- Create analytics dashboard

---

## 7. Security Notes

### What's NOT logged
- Passwords (never logged in plaintext)
- Sensitive credentials
- Full email addresses (masked in some logs)

### What IS logged
- User IDs (UIDs)
- Email addresses (for non-sensitive operations)
- Operation results (success/failure)
- Error messages and codes
- User actions (login, logout, form submission)

This ensures you can debug issues while maintaining security.

---

## Example: Complete Authentication Flow with Logging

```javascript
// User tries to login
const email = 'user@example.com';
const password = 'pass123';

Logger.debug('Login attempt', { email: email.substring(0, 3) + '***' });

// Validate email before submission
if (!EmailValidator.isValid(email)) {
    const error = EmailValidator.getErrorMessage(email);
    Logger.warn('Invalid email provided', { error });
    showError(error);
    return;
}

// Attempt Firebase authentication
try {
    await signInWithEmailAndPassword(auth, email, password);
    Logger.info('Login successful', { email });
    // Redirect to dashboard
} catch (error) {
    Logger.error('Login failed', { code: error.code, message: error.message });
    showError('E-mail ou senha incorretos.');
}
```

---

## Configuration Best Practices

1. **Development**: Keep `Logger.enableConsole = true` for debugging
2. **Production**: Set `Logger.enableConsole = false` to reduce console noise
3. **Monitoring**: Periodically export logs via `Logger.exportLogs()` and send to backend
4. **Analysis**: Use exported logs to identify patterns in user behavior
5. **Cleanup**: Clear logs periodically with `Logger.clearHistory()` to manage memory

