// Importa as funções de autenticação do SDK e nossa configuração
import { auth, db } from './firebase-config.js'; // Adicionado db aqui
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; // Adicionado imports do Firestore

// Elementos do DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const resetForm = document.getElementById('reset-form'); // Novo formulário

const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const showResetBtn = document.getElementById('show-reset'); // Botão "Esqueci senha"
const backToLoginBtn = document.getElementById('back-to-login'); // Voltar do reset

const authMessage = document.getElementById('auth-message');

/* =========================================
   1. LÓGICA DE UI (Alternar Login/Cadastro/Reset)
   ========================================= */
const hideAllForms = () => {
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (resetForm) resetForm.classList.add('hidden');
    if (authMessage) authMessage.style.display = 'none';
};

if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        hideAllForms();
        registerForm.classList.remove('hidden');
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        hideAllForms();
        loginForm.classList.remove('hidden');
    });
}

if (showResetBtn) {
    showResetBtn.addEventListener('click', () => {
        hideAllForms();
        if (resetForm) resetForm.classList.remove('hidden');
    });
}

if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
        hideAllForms();
        loginForm.classList.remove('hidden');
    });
}

/* =========================================
   2. FUNÇÃO AUXILIAR DE MENSAGEM
   ========================================= */
const showMsg = (message, type = 'error') => {
    authMessage.textContent = message;
    authMessage.style.display = 'block';

    if (type === 'success') {
        authMessage.style.color = '#CCFF00';
        authMessage.style.background = 'rgba(204, 255, 0, 0.1)';
        authMessage.style.borderColor = '#CCFF00';
    } else {
        authMessage.style.color = '#ff4d4d';
        authMessage.style.background = 'rgba(255, 77, 77, 0.1)';
        authMessage.style.borderColor = '#ff4d4d';
    }

    // Ocultar após 6 segundos
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 6000);
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
            btn.textContent = 'Verificando...';
            btn.disabled = true;

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // VERIFICAÇÃO DE E-MAIL
            if (!user.emailVerified) {
                await signOut(auth); // Desloga imediatamente
                showMsg('E-mail não verificado. Cheque sua caixa de entrada (e spam).', 'error');
                btn.textContent = 'Entrar';
                btn.disabled = false;
                return;
            }

            // Se verificado, o redirecionamento ocorre no onAuthStateChanged

        } catch (error) {
            console.error("Erro no login:", error.code);
            btn.textContent = 'Entrar';
            btn.disabled = false;

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                showMsg('E-mail ou senha incorretos.');
            } else if (error.code === 'auth/too-many-requests') {
                showMsg('Muitas tentativas. Tente novamente mais tarde.');
            } else {
                showMsg('Erro ao entrar. Tente novamente.');
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
            showMsg('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            showMsg('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            btn.textContent = 'Criando conta...';
            btn.disabled = true;

            // 1. Cria usuário
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 1.2 Atualiza o Perfil do Auth (Nome de Exibição)
            // Isso garante que user.displayName esteja disponível globalmente
            try {
                const nome = document.getElementById('reg-name').value;
                await updateProfile(user, {
                    displayName: nome
                });
            } catch (err) {
                console.error("Erro ao atualizar perfil:", err);
            }

            // 1.5 Salva dados no Firestore (users)
            // Importar db e doc/setDoc no topo do arquivo primeiro
            try {
                const nome = document.getElementById('reg-name').value;
                const whatsapp = document.getElementById('reg-whatsapp').value;
                const nascimento = document.getElementById('reg-birthdate').value;

                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: email,
                    nome: nome,
                    whatsapp: whatsapp,
                    dataNascimento: nascimento,
                    dataCadastro: new Date().toISOString()
                });
            } catch (fsError) {
                console.error("Erro ao salvar dados do usuário:", fsError);
                // Não impede o fluxo, mas loga o erro
            }

            // 2. Envia e-mail de verificação
            await sendEmailVerification(user);

            // 3. Desloga para forçar login só após verificar
            await signOut(auth);

            showMsg(`Conta criada! Enviamos um link de confirmação para ${email}. Verifique seu e-mail antes de entrar.`, 'success');

            // Limpa formulário e volta pro login após 4 seg
            registerForm.reset();
            setTimeout(() => {
                hideAllForms();
                loginForm.classList.remove('hidden');
                btn.textContent = 'Cadastrar';
                btn.disabled = false;
            }, 6000);

        } catch (error) {
            console.error("Erro no cadastro:", error.code);
            btn.textContent = 'Cadastrar';
            btn.disabled = false;

            if (error.code === 'auth/email-already-in-use') {
                showMsg('Este e-mail já está cadastrado.');
            } else {
                showMsg('Erro ao criar conta: ' + error.message);
            }
        }
    });
}

/* =========================================
   5. RECUPERAÇÃO DE SENHA (Reset)
   ========================================= */
if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const btn = resetForm.querySelector('button');

        try {
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            await sendPasswordResetEmail(auth, email);

            showMsg('Link de redefinição enviado! Verifique seu e-mail.', 'success');
            resetForm.reset();

            setTimeout(() => {
                hideAllForms();
                loginForm.classList.remove('hidden');
                btn.textContent = 'Recuperar Senha';
                btn.disabled = false;
            }, 4000);

        } catch (error) {
            console.error("Erro no reset:", error);
            btn.textContent = 'Recuperar Senha';
            btn.disabled = false;

            if (error.code === 'auth/user-not-found') {
                showMsg('E-mail não encontrado.');
            } else {
                showMsg('Erro ao enviar e-mail. Tente novamente.');
            }
        }
    });
}

/* =========================================
   6. OBSERVEDOR DE ESTADO
   ========================================= */
onAuthStateChanged(auth, (user) => {
    // Só redireciona se estiver logado E verificado
    if (user && user.emailVerified) {
        console.log("Usuário logado e verificado:", user.email);

        if (window.location.pathname.includes('login')) {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPage = urlParams.get('redirect');
            const planType = urlParams.get('plano');

            if (redirectPage === 'checkout' && planType) {
                window.location.href = `checkout.html?plano=${planType}`;
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }
    // Se logado mas NÃO verificado, o código do botão de login já tratou (deslogou)
});

/* =========================================
   7. LOGOUT
   ========================================= */
window.logoutUser = async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html'; // Mudei para index para garantir saída total
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
};
