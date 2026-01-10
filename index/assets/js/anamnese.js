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
        ttry {
            // Salva na coleção 'anamneses'
            await addDoc(collection(db, "anamneses"), fichaData);

            // SUCESSO! Esconde o form e mostra os próximos passos
            loadingOverlay.style.display = 'none';
            
            // Injeta o HTML de Sucesso na tela
            const formCard = document.querySelector('.form-card');
            formCard.innerHTML = `
                <div style="text-align: center;">
                    <h1 style="color: var(--primary-color);">Ficha Recebida! 👏</h1>
                    <p style="color: #ccc; margin: 20px 0;">Agora faltam só 2 passos para começarmos:</p>
                    
                    <div style="background: #000; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #333;">
                        <h3 style="color: white; margin-bottom: 10px;">1. Confirme no WhatsApp</h3>
                        <p style="font-size: 0.9rem; color: #999; margin-bottom: 15px;">Me avise que já preencheu para eu priorizar seu treino.</p>
                        <a href="https://wa.me/55SEUNUMEROAQUI?text=Olá Gustavo, acabei de preencher a anamnese!" target="_blank" class="btn btn-primary" style="width: 100%; display:block;">Chamar no WhatsApp</a>
                    </div>

                    <div style="background: #000; padding: 20px; border-radius: 10px; border: 1px solid #333;">
                        <h3 style="color: white; margin-bottom: 10px;">2. Baixe o App MFIT</h3>
                        <p style="font-size: 0.9rem; color: #999; margin-bottom: 15px;">É por lá que você verá seus treinos.</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <a href="#" class="btn btn-secondary" style="flex:1;">iPhone (iOS)</a>
                            <a href="#" class="btn btn-secondary" style="flex:1;">Android</a>
                        </div>
                    </div>
                    
                    <a href="dashboard.html" style="display: block; margin-top: 30px; color: #666; font-size: 0.8rem;">Ir para meu Painel</a>
                </div>
            `;

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
