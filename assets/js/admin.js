import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const studentsList = document.getElementById('students-list');
const adminEmailSpan = document.getElementById('admin-email');
const logoutBtn = document.getElementById('logout-btn');

// ==================================================
// 1. CONFIGURAÇÃO DE SEGURANÇA (IMPORTANTE!)
// ==================================================
// Substitua pelo seu email REAL de login
const ADMIN_EMAILS = ["vridxz@gmail.com", "contato@gustavoconsignani.com.br"]; 

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verifica se é o Gustavo
        if (!ADMIN_EMAILS.includes(user.email)) {
            alert("Acesso Negado. Esta área é restrita.");
            window.location.href = 'index.html';
            return;
        }

        adminEmailSpan.textContent = user.email;
        carregarAlunos();

    } else {
        window.location.href = 'login.html';
    }
});

// 2. CARREGAR ALUNOS DO BANCO
async function carregarAlunos() {
    studentsList.innerHTML = ''; // Limpa a tabela

    try {
        // Busca todos os documentos da coleção anamneses
        const q = query(collection(db, "anamneses"), orderBy("dataEnvio", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            studentsList.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum aluno encontrado.</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const aluno = docSnap.data();
            const docId = docSnap.id; // ID para atualizar depois
            
            // Cria a linha da tabela
            const tr = document.createElement('tr');
            
            // Define se tem treino ou não para mudar a cor
            const temTreino = aluno.linkTreino && aluno.linkTreino.length > 5;
            const statusClass = temTreino ? 'status-ok' : 'status-pending';
            const statusText = temTreino ? 'Entregue' : 'Pendente';

            tr.innerHTML = `
                <td>
                    <div style="font-weight:bold;">${aluno.nome || 'Sem Nome'}</div>
                    <div style="font-size:0.8rem; color:#888;">${aluno.email}</div>
                    <div style="font-size:0.8rem; color:#666;">${new Date(aluno.dataEnvio).toLocaleDateString()}</div>
                </td>
                <td>
                    ${aluno.objetivo || '-'}
                    <br><span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <a href="https://wa.me/55${limparTelefone(aluno.telefone)}?text=Olá ${aluno.nome}, tudo bem?" target="_blank" style="color:var(--primary-color);">
                        Abrir Whats
                    </a>
                </td>
                <td>
                    <input type="text" class="link-input" id="input-${docId}" 
                           value="${aluno.linkTreino || ''}" 
                           placeholder="Cole o link do treino aqui...">
                </td>
                <td>
                    <button class="btn-save" onclick="salvarTreino('${docId}')">Salvar</button>
                </td>
            `;

            studentsList.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao listar:", error);
        studentsList.innerHTML = `<tr><td colspan="5">Erro: ${error.message}</td></tr>`;
    }
}

// 3. FUNÇÃO DE SALVAR (Disponível globalmente)
window.salvarTreino = async (docId) => {
    const input = document.getElementById(`input-${docId}`);
    const novoLink = input.value;
    const btn = input.parentElement.nextElementSibling.querySelector('button');

    // Feedback visual
    btn.textContent = "Salvando...";
    btn.style.opacity = "0.7";

    try {
        const alunoRef = doc(db, "anamneses", docId);
        await updateDoc(alunoRef, {
            linkTreino: novoLink
        });

        btn.textContent = "Salvo!";
        btn.style.backgroundColor = "#00ff00";
        setTimeout(() => {
            btn.textContent = "Salvar";
            btn.style.backgroundColor = "var(--primary-color)";
        }, 2000);

    } catch (error) {
        alert("Erro ao salvar: " + error.message);
        btn.textContent = "Erro";
    }
};

// Auxiliar para limpar telefone (se você coletar telefone no futuro)
function limparTelefone(tel) {
    if(!tel) return "";
    return tel.replace(/\D/g, ''); // Remove tudo que não é número
}

// 4. LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
    });
}