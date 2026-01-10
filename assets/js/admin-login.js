import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ==========================================
// CONFIGURAÇÃO: LISTA DE ADMINS PERMITIDOS
// ==========================================
// Coloque aqui APENAS os e-mails que podem acessar o painel
const ADMIN_EMAILS = [
    "vridxz@gmail.com", 
    "contato@gustavoconsignani.com.br"
];

const form = document.getElementById('admin-form');
const errorBox = document.getElementById('error-box');
const btnSubmit = document.getElementById('btn-submit');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Efeito visual de carregamento
    btnSubmit.textContent = "Verificando...";
    btnSubmit.style.opacity = "0.7";
    errorBox.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // 1. Tenta fazer login no Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. VERIFICAÇÃO DE SEGURANÇA (O Guardião)
        if (ADMIN_EMAILS.includes(user.email)) {
            // É admin? Pode entrar.
            window.location.href = 'admin.html';
        } else {
            // Não é admin? Chuta para fora!
            await signOut(auth);
            throw new Error("Este e-mail não tem permissão de administrador.");
        }

    } catch (error) {
        // Trata erros
        console.error(error);
        let msg = "Erro ao entrar.";
        
        if (error.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
        else if (error.message) msg = error.message; // Mensagem personalizada do throw acima

        errorBox.textContent = msg;
        errorBox.style.display = 'block';
        
        btnSubmit.textContent = "Entrar";
        btnSubmit.style.opacity = "1";
    }
});