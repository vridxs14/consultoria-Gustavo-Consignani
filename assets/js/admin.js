import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const studentsGrid = document.getElementById('students-grid');
const adminEmailSpan = document.getElementById('admin-email');
const totalCountSpan = document.getElementById('total-count');
const searchBox = document.getElementById('search-box');
const logoutBtn = document.getElementById('logout-btn');

let allStudents = []; // Armazena localmente para busca rápida

// ==================================================
// 1. CONFIGURAÇÃO DE SEGURANÇA
// ==================================================
const ADMIN_EMAILS = ["vridxz@gmail.com", "contato@gustavoconsignani.com.br"]; 

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (!ADMIN_EMAILS.includes(user.email)) {
            alert("Acesso Negado.");
            window.location.href = 'index.html';
            return;
        }
        adminEmailSpan.textContent = user.email;
        carregarAlunos();
    } else {
        window.location.href = 'login.html';
    }
});

// 2. CARREGAR ALUNOS
async function carregarAlunos() {
    studentsGrid.innerHTML = '<div style="text-align:center; grid-column: 1/-1; color: #ccc;">Atualizando lista...</div>';

    try {
        const q = query(collection(db, "anamneses"), orderBy("dataEnvio", "desc"));
        const querySnapshot = await getDocs(q);

        allStudents = []; // Limpa lista local
        
        querySnapshot.forEach((docSnap) => {
            allStudents.push({ id: docSnap.id, ...docSnap.data() });
        });

        totalCountSpan.textContent = allStudents.length;
        renderizarAlunos(allStudents); // Mostra na tela

    } catch (error) {
        console.error("Erro:", error);
        studentsGrid.innerHTML = `<div style="text-align:center; color:red;">Erro: ${error.message}</div>`;
    }
}

// 3. RENDERIZAR CARDS (O HTML do Card fica aqui)
function renderizarAlunos(lista) {
    studentsGrid.innerHTML = '';

    if (lista.length === 0) {
        studentsGrid.innerHTML = '<div style="text-align:center; grid-column: 1/-1; color: #666; padding: 40px;">Nenhum aluno encontrado.</div>';
        return;
    }

    lista.forEach(aluno => {
        // Lógica de Status
        const temTreino = aluno.linkTreino && aluno.linkTreino.length > 5;
        const statusClass = temTreino ? 'status-ok' : 'status-pending';
        const statusText = temTreino ? 'TREINO OK' : 'PENDENTE';
        
        // Formatar Data
        const dataFormatada = aluno.dataEnvio ? new Date(aluno.dataEnvio).toLocaleDateString('pt-BR') : '-';

        // Criar Card
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="student-name">${aluno.nome || 'Sem Nome'}</div>
                    <div class="student-email">${aluno.email}</div>
                </div>
                <div class="status-badge ${statusClass}">${statusText}</div>
            </div>

            <div class="card-body">
                <div>
                    <span class="info-label">Objetivo</span>
                    ${aluno.objetivo || '-'}
                </div>
                <div>
                    <span class="info-label">Recebido em</span>
                    ${dataFormatada}
                </div>
            </div>

            <div class="card-actions">
                <span class="info-label">Link do Treino (PDF/Sheet)</span>
                <input type="text" class="link-input" id="input-${aluno.id}" 
                       value="${aluno.linkTreino || ''}" 
                       placeholder="Cole https://..." autocomplete="off">
                
                <div class="btn-group">
                    <a href="https://wa.me/55?text=Oi ${aluno.nome}, tudo bem?" target="_blank" class="btn-whatsapp" title="Chamar no WhatsApp">
                        💬
                    </a>
                    <button class="btn-save" onclick="salvarTreino('${aluno.id}')">
                        SALVAR
                    </button>
                </div>
            </div>
        `;
        studentsGrid.appendChild(card);
    });
}

// 4. FUNÇÃO DE BUSCA (Filtra sem recarregar página)
searchBox.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = allStudents.filter(aluno => 
        (aluno.nome && aluno.nome.toLowerCase().includes(termo)) ||
        (aluno.email && aluno.email.toLowerCase().includes(termo))
    );
    renderizarAlunos(filtrados);
});

// 5. FUNÇÃO DE SALVAR (Global)
window.salvarTreino = async (docId) => {
    const input = document.getElementById(`input-${docId}`);
    const btn = input.parentElement.querySelector('.btn-save');
    const originalText = btn.textContent;

    btn.textContent = "...";
    btn.style.opacity = "0.7";

    try {
        const alunoRef = doc(db, "anamneses", docId);
        await updateDoc(alunoRef, {
            linkTreino: input.value
        });

        // Sucesso Visual
        btn.textContent = "✔ OK";
        btn.style.backgroundColor = "#00ff00";
        btn.style.color = "black";
        
        // Atualiza o status badge visualmente sem recarregar tudo
        const card = btn.closest('.student-card');
        const badge = card.querySelector('.status-badge');
        if (input.value.length > 5) {
            badge.className = 'status-badge status-ok';
            badge.textContent = 'TREINO OK';
        } else {
            badge.className = 'status-badge status-pending';
            badge.textContent = 'PENDENTE';
        }

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = ""; // Volta ao original
            btn.style.color = "";
            btn.style.opacity = "1";
        }, 2000);

    } catch (error) {
        alert("Erro: " + error.message);
        btn.textContent = "Erro";
    }
};

// 6. LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
    });
}