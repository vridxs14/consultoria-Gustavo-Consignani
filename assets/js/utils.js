/* =========================================
   UTILITY FUNCTIONS
   Email Validation & Logging System
   ========================================= */

/* =========================================
   1. LOGGER UTILITY
   ========================================= */
export const Logger = {
    // Log levels
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',

    // Configuration
    enableConsole: true, // Set to false in production
    logHistory: [],
    maxHistorySize: 100,

    /**
     * Format log message with timestamp and level
     */
    _formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] [${level}] ${message}`;
        
        if (data) {
            return { formatted, data };
        }
        return formatted;
    },

    /**
     * Store log in memory history
     */
    _storeInHistory(level, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data: data || null
        };

        this.logHistory.push(entry);

        // Keep history size manageable
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift();
        }
    },

    /**
     * Log at DEBUG level
     */
    debug(message, data = null) {
        this._storeInHistory(this.DEBUG, message, data);
        
        if (this.enableConsole) {
            if (data) {
                console.debug(this._formatMessage(this.DEBUG, message), data);
            } else {
                console.debug(this._formatMessage(this.DEBUG, message));
            }
        }
    },

    /**
     * Log at INFO level
     */
    info(message, data = null) {
        this._storeInHistory(this.INFO, message, data);
        
        if (this.enableConsole) {
            if (data) {
                console.info(this._formatMessage(this.INFO, message), data);
            } else {
                console.info(this._formatMessage(this.INFO, message));
            }
        }
    },

    /**
     * Log at WARN level
     */
    warn(message, data = null) {
        this._storeInHistory(this.WARN, message, data);
        
        if (this.enableConsole) {
            if (data) {
                console.warn(this._formatMessage(this.WARN, message), data);
            } else {
                console.warn(this._formatMessage(this.WARN, message));
            }
        }
    },

    /**
     * Log at ERROR level
     */
    error(message, data = null) {
        this._storeInHistory(this.ERROR, message, data);
        
        if (this.enableConsole) {
            if (data) {
                console.error(this._formatMessage(this.ERROR, message), data);
            } else {
                console.error(this._formatMessage(this.ERROR, message));
            }
        }
    },

    /**
     * Get all logs from history
     */
    getHistory() {
        return this.logHistory;
    },

    /**
     * Clear log history
     */
    clearHistory() {
        this.logHistory = [];
    },

    /**
     * Export logs as JSON (useful for debugging)
     */
    exportLogs() {
        return JSON.stringify(this.logHistory, null, 2);
    }
};

/* =========================================
   2. EMAIL VALIDATION UTILITY
   ========================================= */
export const EmailValidator = {
    /**
     * Regex pattern for email validation
     * Complies with RFC 5322 simplified rules
     */
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /**
     * Check if email is valid format
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    isValid(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        const trimmedEmail = email.trim().toLowerCase();
        
        // Basic length check (RFC 5321)
        if (trimmedEmail.length > 254) {
            return false;
        }

        // Local part check (before @)
        const [localPart, domain] = trimmedEmail.split('@');
        
        if (!localPart || !domain) {
            return false;
        }

        // Local part cannot exceed 64 characters
        if (localPart.length > 64) {
            return false;
        }

        // Local part cannot start or end with dot
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return false;
        }

        // No consecutive dots
        if (localPart.includes('..')) {
            return false;
        }

        // Pattern validation
        if (!this.pattern.test(trimmedEmail)) {
            return false;
        }

        // Check for valid domain format
        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
            return false;
        }

        // TLD must be at least 2 characters
        const tld = domainParts[domainParts.length - 1];
        if (tld.length < 2) {
            return false;
        }

        return true;
    },

    /**
     * Sanitize email (trim and lowercase)
     * @param {string} email - Email to sanitize
     * @returns {string} - Sanitized email
     */
    sanitize(email) {
        if (!email || typeof email !== 'string') {
            return '';
        }
        return email.trim().toLowerCase();
    },

    /**
     * Get validation error message
     * @param {string} email - Email to validate
     * @returns {string|null} - Error message or null if valid
     */
    getErrorMessage(email) {
        if (!email || email.trim() === '') {
            return 'O e-mail não pode estar vazio.';
        }

        if (typeof email !== 'string') {
            return 'O e-mail deve ser um texto válido.';
        }

        if (email.length > 254) {
            return 'O e-mail é muito longo (máximo 254 caracteres).';
        }

        const [localPart, domain] = email.trim().split('@');

        if (!localPart || !domain) {
            return 'O e-mail deve conter um @ válido.';
        }

        if (localPart.length > 64) {
            return 'A parte do e-mail antes do @ é muito longa.';
        }

        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return 'O e-mail não pode começar ou terminar com um ponto.';
        }

        if (localPart.includes('..')) {
            return 'O e-mail não pode conter pontos consecutivos.';
        }

        if (!this.pattern.test(email.trim().toLowerCase())) {
            return 'O formato do e-mail não é válido.';
        }

        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
            return 'O domínio deve ter pelo menos um ponto.';
        }

        const tld = domainParts[domainParts.length - 1];
        if (tld.length < 2) {
            return 'O domínio não é válido.';
        }

        // If we reach here, email is valid
        return null;
    }
};

/* =========================================
   3. FORM VALIDATION UTILITY
   ========================================= */
export const FormValidator = {
    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} - {isValid: boolean, message: string}
     */
    validatePassword(password) {
        if (!password) {
            return {
                isValid: false,
                message: 'A senha não pode estar vazia.'
            };
        }

        if (password.length < 6) {
            return {
                isValid: false,
                message: 'A senha deve ter pelo menos 6 caracteres.'
            };
        }

        if (password.length > 128) {
            return {
                isValid: false,
                message: 'A senha é muito longa (máximo 128 caracteres).'
            };
        }

        // Check for at least one letter and one number (recommended)
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return {
            isValid: true,
            message: 'Senha válida.',
            strength: (hasLetter && hasNumber) ? 'strong' : 'medium'
        };
    },

    /**
     * Check if passwords match
     * @param {string} password1 - First password
     * @param {string} password2 - Second password
     * @returns {boolean} - True if they match
     */
    passwordsMatch(password1, password2) {
        return password1 === password2;
    },

    /**
     * Validate all form fields
     * @param {object} fields - Object with field values
     * @returns {object} - {isValid: boolean, errors: object}
     */
    validateForm(fields) {
        const errors = {};

        if (fields.email !== undefined) {
            const emailError = EmailValidator.getErrorMessage(fields.email);
            if (emailError) {
                errors.email = emailError;
            }
        }

        if (fields.password !== undefined) {
            const passwordValidation = this.validatePassword(fields.password);
            if (!passwordValidation.isValid) {
                errors.password = passwordValidation.message;
            }
        }

        if (fields.confirmPassword !== undefined && fields.password !== undefined) {
            if (!this.passwordsMatch(fields.password, fields.confirmPassword)) {
                errors.confirmPassword = 'As senhas não coincidem.';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};
