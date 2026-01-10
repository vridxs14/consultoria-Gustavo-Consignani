import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const loadingScreen = document.getElementById('loading-screen');

// 1. VERIFICAÇÃO DE SEGURANÇA
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Usuário logado:", user.email);
        
        // Buscar nome do aluno no banco de dados (na coleção 'anamneses')
        try {
            const q = query(collection(db, "anamneses"), where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Pegar o primeiro documento encontrado
                const userData = querySnapshot.docs[0].data();
                userNameSpan.textContent = userData.nome.split(' ')[0]; // Pega só o primeiro nome
            } else {
                userNameSpan.textContent = "Aluno";
                // Se não achou ficha, talvez ele precise preencher a anamnese
                // Opcional: window.location.href = 'anamnese.html';
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }

        // Retirar tela de carregamento
        loadingScreen.style.display = 'none';

    } else {
        // Se não estiver logado, chuta para o login
        window.location.href = 'login.html';
    }
});

// 2. FUNÇÃO DE LOGOUT
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
