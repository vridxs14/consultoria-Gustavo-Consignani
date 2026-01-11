// Importa as funções de autenticação do SDK e nossa configuração
import { auth } from './firebase-config.js';
import { Logger, EmailValidator, FormValidator } from './utils.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Elementos do DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const authMessage = document.getElementById('auth-message');

/* =========================================
   1. LÓGICA DE UI (Alternar Login/Cadastro)
   ========================================= */
if (showRegisterBtn && showLoginBtn) {
    showRegisterBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authMessage.style.display = 'none';
    });

    showLoginBtn.addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authMessage.style.display = 'none';
    });
}

/* =========================================
   2. FUNÇÃO AUXILIAR DE ERRO
   ========================================= */
const showError = (message) => {
    authMessage.textContent = message;
    authMessage.style.display = 'block';
    Logger.warn('Erro de validação exibido ao usuário', { message });
    
    // Ocultar após 5 segundos
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 5000);
};

/* =========================================
   3. LOGIN (Sign In)
   ========================================= */
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button');

        Logger.debug('Tentativa de login', { email: email.replace(/./g, '*').slice(0, 3) + '***' });

        // Validação de email
        if (!EmailValidator.isValid(email)) {
            const errorMessage = EmailValidator.getErrorMessage(email);
            showError(errorMessage);
            Logger.warn('Email inválido no login', { email });
            return;
        }

        try {
            btn.textContent = 'Carregando...';
            btn.disabled = true;

            await signInWithEmailAndPassword(auth, email, password);
            Logger.info('Login bem-sucedido', { email });
            // O redirecionamento é tratado pelo onAuthStateChanged abaixo
            
        } catch (error) {
            Logger.error('Erro no login', { code: error.code, message: error.message });
            btn.textContent = 'Entrar';
            btn.disabled = false;

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                showError('E-mail ou senha incorretos.');
            } else if (error.code === 'auth/invalid-email') {
                showError('O formato do e-mail não é válido.');
            } else if (error.code === 'auth/too-many-requests') {
                showError('Muitas tentativas. Tente novamente mais tarde.');
            } else {
                showError('Ocorreu um erro. Tente novamente.');
            }
        }
    });
}

/* =========================================
   4. CADASTRO (Sign Up)
   ========================================= */
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-confirm').value;
        const btn = registerForm.querySelector('button');

        Logger.debug('Tentativa de cadastro', { email: email.replace(/./g, '*').slice(0, 3) + '***' });

        // Validação completa do formulário
        const validation = FormValidator.validateForm({
            email: email,
            password: password,
            confirmPassword: confirmPass
        });

        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0];
            showError(firstError);
            Logger.warn('Validação de cadastro falhou', { errors: validation.errors });
            return;
        }

        try {
            btn.textContent = 'Criando conta...';
            btn.disabled = true;

            // Cria o usuário no Firebase Auth
            await createUserWithEmailAndPassword(auth, email, password);
            Logger.info('Cadastro bem-sucedido', { email });
            
            // O redirecionamento é automático pelo onAuthStateChanged
            
        } catch (error) {
            Logger.error('Erro no cadastro', { code: error.code, message: error.message });
            btn.textContent = 'Cadastrar';
            btn.disabled = false;

            if (error.code === 'auth/email-already-in-use') {
                showError('Este e-mail já está cadastrado.');
            } else if (error.code === 'auth/invalid-email') {
                showError('O formato do e-mail não é válido.');
            } else if (error.code === 'auth/weak-password') {
                showError('A senha é muito fraca. Use uma senha mais forte.');
            } else {
                showError('Erro ao criar conta. Tente novamente.');
            }
        }
    });
}

/* =========================================
   5. OBSERVEDOR DE ESTADO (Lógica de Redirecionamento)
   ========================================= */
onAuthStateChanged(auth, (user) => {
    if (user) {
        Logger.info('Usuário logado com sucesso', { email: user.email });
        
        // Verifica se estamos na página de login
        if (window.location.pathname.includes('login')) {
            
            // Verifica se tem parâmetros na URL (ex: ?redirect=checkout&plano=mensal)
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPage = urlParams.get('redirect');
            const planType = urlParams.get('plano');

            if (redirectPage === 'checkout' && planType) {
                // Se veio da compra, devolve para a compra
                Logger.debug('Redirecionando para checkout', { plano: planType });
                window.location.href = `checkout.html?plano=${planType}`;
            } else {
                // Se for login normal, vai pro dashboard
                Logger.debug('Redirecionando para dashboard');
                window.location.href = 'dashboard.html';
            }
        }
    } else {
        Logger.debug('Usuário não autenticado');
    }
    // Se não estiver logado, as páginas protegidas (checkout, dashboard) já têm proteção interna
});
/* =========================================
   6. LOGOUT (Para usar em outras páginas)
   ========================================= */
// Expondo a função logout para o escopo global (window) para ser chamada via onclick no HTML
window.logoutUser = async () => {
    try {
        Logger.info('Usuário iniciando logout');
        await signOut(auth);
        Logger.info('Logout bem-sucedido');
        window.location.href = 'index.html';
    } catch (error) {
        Logger.error('Erro ao fazer logout', { message: error.message });
    }
};
