// Importa as funções de autenticação do SDK e nossa configuração
import { auth } from './firebase-config.js';
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

        try {
            btn.textContent = 'Carregando...';
            btn.disabled = true;

            await signInWithEmailAndPassword(auth, email, password);
            // O redirecionamento é tratado pelo onAuthStateChanged abaixo
            
        } catch (error) {
            console.error("Erro no login:", error.code);
            btn.textContent = 'Entrar';
            btn.disabled = false;

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                showError('E-mail ou senha incorretos.');
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

        if (password !== confirmPass) {
            showError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            btn.textContent = 'Criando conta...';
            btn.disabled = true;

            // Cria o usuário no Firebase Auth
            await createUserWithEmailAndPassword(auth, email, password);
            
            // O redirecionamento é automático pelo onAuthStateChanged
            
        } catch (error) {
            console.error("Erro no cadastro:", error.code);
            btn.textContent = 'Cadastrar';
            btn.disabled = false;

            if (error.code === 'auth/email-already-in-use') {
                showError('Este e-mail já está cadastrado.');
            } else {
                showError('Erro ao criar conta: ' + error.message);
            }
        }
    });
}

/* =========================================
   5. OBSERVEDOR DE ESTADO (Global)
   ========================================= */
// Verifica se o usuário logou ou deslogou
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado
        console.log("Usuário logado:", user.email);
        
        // Se estivermos na página de login, redirecionar para a área restrita
        if (window.location.pathname.includes('login')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // Usuário não está logado
        // Se estivermos em uma página protegida (ex: anamnese), redirecionar para login
        if (window.location.pathname.includes('anamnese')) {
            window.location.href = 'login.html';
        }
    }
});

/* =========================================
   6. LOGOUT (Para usar em outras páginas)
   ========================================= */
// Expondo a função logout para o escopo global (window) para ser chamada via onclick no HTML
window.logoutUser = async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
};
