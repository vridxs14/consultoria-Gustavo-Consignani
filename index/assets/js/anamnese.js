import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos da UI
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const anamneseForm = document.getElementById('anamnese-form');
const loadingOverlay = document.getElementById('loading-overlay');

let currentUser = null;

// 1. VERIFICAÇÃO DE SEGURANÇA (Auth Guard)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        currentUser = user;
        userDisplay.textContent = user.email;
    } else {
        // Usuário não logado -> Expulsar para login
        window.location.href = 'login.html';
    }
});

// 2. LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    });
}

// 3. ENVIO DO FORMULÁRIO (Salvar no Firestore)
if (anamneseForm) {
    anamneseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) return alert("Erro de autenticação. Faça login novamente.");

        // Mostrar loading
        loadingOverlay.style.display = 'flex';

        // Coletar dados
        const fichaData = {
            uid: currentUser.uid, // Vínculo com o usuário
            email: currentUser.email,
            nome: document.getElementById('nome').value,
            idade: document.getElementById('idade').value,
            peso: document.getElementById('peso').value,
            objetivo: document.getElementById('objetivo').value,
            frequencia: document.getElementById('frequencia').value,
            lesoes: document.getElementById('lesoes').value,
            medicamentos: document.getElementById('medicamentos').value,
            dataEnvio: serverTimestamp(), // Data do servidor
            status: 'Pendente' // Para você saber que precisa montar o treino
        };

        try {
            // Salva na coleção 'anamneses'
            await addDoc(collection(db, "anamneses"), fichaData);

            // Sucesso
            loadingOverlay.style.display = 'none';
            alert("Ficha enviada com sucesso! Em breve entrarei em contato.");
            anamneseForm.reset();

        } catch (error) {
            console.error("Erro ao salvar:", error);
            loadingOverlay.style.display = 'none';
            
            if (error.code === 'permission-denied') {
                alert("Erro de permissão. Verifique as regras do Firestore.");
            } else {
                alert("Erro ao enviar. Tente novamente.");
            }
        }
    });
}
