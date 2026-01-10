import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const anamneseForm = document.getElementById('anamnese-form');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// 1. VERIFICAÇÃO DE LOGIN
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuário logado:", user.email);
        if(userDisplay) userDisplay.textContent = user.email;
    } else {
        window.location.href = 'login.html';
    }
});

// 2. ENVIO DO FORMULÁRIO
if (anamneseForm) {
    anamneseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Mostra loading
        loadingOverlay.style.display = 'flex';

        const user = auth.currentUser;
        if (!user) {
            alert("Erro: Você precisa estar logado.");
            loadingOverlay.style.display = 'none';
            return;
        }

        // Captura os dados
        const fichaData = {
            uid: user.uid,
            email: user.email,
            nome: document.getElementById('nome').value,
            idade: document.getElementById('idade').value,
            peso: document.getElementById('peso').value,
            objetivo: document.getElementById('objetivo').value,
            frequencia: document.getElementById('frequencia').value,
            lesoes: document.getElementById('lesoes').value,
            medicamentos: document.getElementById('medicamentos').value,
            dataEnvio: new Date().toISOString(),
            status: "pendente" // Status inicial
        };

        try {
            // Salva no Firestore
            await addDoc(collection(db, "anamneses"), fichaData);

            // SUCESSO! Esconde o loading e mostra mensagem
            loadingOverlay.style.display = 'none';
            
            // Substitui o formulário pela mensagem de sucesso
            const formCard = document.querySelector('.form-card');
            formCard.innerHTML = `
                <div style="text-align: center;">
                    <h1 style="color: var(--primary-color);">Ficha Recebida! 👏</h1>
                    <p style="color: #ccc; margin: 20px 0;">Agora faltam só 2 passos para começarmos:</p>
                    
                    <div style="background: #000; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #333;">
                        <h3 style="color: white; margin-bottom: 10px;">1. Confirme no WhatsApp</h3>
                        <p style="font-size: 0.9rem; color: #999; margin-bottom: 15px;">Me avise que já preencheu para eu priorizar seu treino.</p>
                        <a href="https://wa.me/5511999999999?text=Olá Gustavo, acabei de preencher a anamnese!" target="_blank" class="btn btn-primary" style="width: 100%; display:block;">Chamar no WhatsApp</a>
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
            console.error("Erro ao salvar:", error);
            alert("Erro ao enviar ficha: " + error.message);
            loadingOverlay.style.display = 'none';
        }
    });
}

// 3. LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'login.html';
    });
}