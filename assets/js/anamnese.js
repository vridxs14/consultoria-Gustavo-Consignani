import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const anamneseForm = document.getElementById('anamnese-form');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// VARIAVEL GLOBAL PARA PERFIL
let userProfile = {};

// 1. VERIFICAÇÃO DE LOGIN E BUSCA DE DADOS
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Usuário logado:", user.email);

        if (!user.emailVerified) {
            alert("Seu e-mail não foi verificado. Verifique sua caixa de entrada.");
            window.location.href = 'login.html';
            return;
        }

        if (userDisplay) userDisplay.textContent = user.email;

        // BUSCA DADOS JÁ EXISTENTES (NOME, WHATSAPP, ETC)
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                userProfile = docSnap.data();

                // CALCULA IDADE (BONUS)
                if (userProfile.dataNascimento) {
                    const hoje = new Date();
                    const nasc = new Date(userProfile.dataNascimento);
                    let idade = hoje.getFullYear() - nasc.getFullYear();
                    const m = hoje.getMonth() - nasc.getMonth();
                    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
                        idade--;
                    }
                    // Preenche o campo idade se existir
                    const idadeInput = document.getElementById('idade');
                    if (idadeInput) idadeInput.value = idade;
                }
            }
        } catch (e) {
            console.error("Erro ao buscar perfil:", e);
        }

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
            // PEGA DADOS AUTOMÁTICOS
            nome: userProfile.nome || user.displayName || "Nome não informado",
            whatsapp: userProfile.whatsapp || "",
            dataNascimento: userProfile.dataNascimento || "",

            idade: document.getElementById('idade').value,
            peso: document.getElementById('peso').value,
            // CORREÇÃO: Pega o valor do Radio Button selecionado
            objetivo: document.querySelector('input[name="objetivo"]:checked').value,
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
            const formCard = document.querySelector('.glass-form-card');
            formCard.innerHTML = `
                <div style="text-align: center; color: white;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                    <h1 style="color: white; margin-bottom: 10px;">Ficha Recebida!</h1>
                    <p style="color: #ccc; margin-bottom: 40px;">Seus dados foram salvos com segurança.</p>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 15px; margin-bottom: 25px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="color: var(--primary-color); font-size: 1rem; text-transform:uppercase; margin-bottom: 15px;"><i class="fab fa-whatsapp"></i> Próximo Passo</h3>
                        <p style="font-size: 0.9rem; color: #ccc; margin-bottom: 20px;">Me avise no WhatsApp que você terminou de preencher para eu começar a montar seu treino agora mesmo.</p>
                        <a href="https://wa.me/5511999999999?text=Olá Gustavo, ficha preenchida!" target="_blank" class="btn-submit-premium" style="text-align: center; display:block; text-decoration:none;">
                            Avisar Treinador
                        </a>
                    </div>
                    
                    <a href="dashboard.html" style="color: #666; font-size: 0.9rem; text-decoration: underline;">Voltar ao Dashboard</a>
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