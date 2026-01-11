# Quick Reference: Email Validation & Logging

## 🎯 Quick Start

### Logging
```javascript
import { Logger } from './utils.js';

Logger.info('User action', { details: 'value' });
Logger.error('Error occurred', { code: 'ERROR_CODE' });
Logger.debug('Debug info');
Logger.warn('Warning message');
```

### Email Validation
```javascript
import { EmailValidator } from './utils.js';

// Check if email is valid
if (!EmailValidator.isValid(email)) {
    const error = EmailValidator.getErrorMessage(email);
    showError(error); // Show user-friendly error
}
```

### Form Validation
```javascript
import { FormValidator } from './utils.js';

const validation = FormValidator.validateForm({
    email: emailValue,
    password: passwordValue,
    confirmPassword: confirmPasswordValue
});

if (!validation.isValid) {
    // validation.errors contains all error messages
}
```

---

## 📋 Files Modified

| File | Changes |
|------|---------|
| `assets/js/utils.js` | **NEW** - All validation and logging utilities |
| `assets/js/auth.js` | Added logging and email validation |
| `assets/js/anamnese.js` | Added logging for form submission |
| `assets/js/dashboard.js` | Added logging for user access |
| `VALIDATION_LOGGING_GUIDE.md` | **NEW** - Complete documentation |
| `IMPLEMENTATION_SUMMARY.md` | **NEW** - Summary of changes |

---

## 🔍 Where to Find Logs

**In Browser Console:**
```javascript
Logger.getHistory()        // View all logs
Logger.exportLogs()        // Export as JSON
Logger.clearHistory()      // Clear all logs
```

---

## ✅ Testing the Implementation

### Test Email Validation
1. Go to login page
2. Enter invalid email: `test`
3. See error: "O formato do e-mail não é válido."

### Test Registration Validation
1. Go to registration
2. Try weak password (less than 6 chars)
3. See error: "A senha deve ter pelo menos 6 caracteres."

### Test Logging
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `Logger.getHistory()`
4. See all your actions logged with timestamps

---

## 🚀 Production Tips

1. **Disable console output** (optional):
   ```javascript
   Logger.enableConsole = false;
   ```

2. **Send logs to backend** (advanced):
   ```javascript
   const logs = Logger.exportLogs();
   // Send to your server for analysis
   ```

3. **Monitor errors**:
   ```javascript
   const errorLogs = Logger.getHistory()
     .filter(log => log.level === 'ERROR');
   ```

---

## 🛡️ Security

- ✅ Passwords never logged
- ✅ Email addresses logged only for non-sensitive operations
- ✅ Error details logged without exposing system info
- ✅ No sensitive data in console in production

---

## 📚 Full Documentation

See `VALIDATION_LOGGING_GUIDE.md` for:
- Complete API reference
- Detailed examples
- Configuration options
- Best practices
- Advanced usage

---

## 💡 Common Tasks

### Check if user logged in successfully
```javascript
const logs = Logger.getHistory()
  .filter(log => log.message.includes('Login bem-sucedido'));
```

### Find validation errors
```javascript
const errors = Logger.getHistory()
  .filter(log => log.level === 'WARN' && 
                  log.message.includes('inválido'));
```

### Get all user actions today
```javascript
const today = new Date().toISOString().split('T')[0];
const todayLogs = Logger.getHistory()
  .filter(log => log.timestamp.startsWith(today));
```

