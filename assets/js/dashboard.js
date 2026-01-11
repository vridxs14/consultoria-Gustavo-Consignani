import { auth, db } from './firebase-config.js';
import { Logger } from './utils.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const loadingScreen = document.getElementById('loading-screen');

// 1. VERIFICAÇÃO DE SEGURANÇA
onAuthStateChanged(auth, async (user) => {
    if (user) {
        Logger.info('Usuário acessou dashboard', { email: user.email });
        
        // Buscar nome do aluno no banco de dados (na coleção 'anamneses')
        try {
            const q = query(collection(db, "anamneses"), where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Pegar o primeiro documento encontrado
                const userData = querySnapshot.docs[0].data();
                const firstName = userData.nome.split(' ')[0]; // Pega só o primeiro nome
                userNameSpan.textContent = firstName;
                Logger.debug('Dados de anamnese carregados no dashboard', { nome: firstName });
            } else {
                userNameSpan.textContent = "Aluno";
                Logger.warn('Nenhuma anamnese encontrada para o usuário', { uid: user.uid });
                // Se não achou ficha, talvez ele precise preencher a anamnese
                // Opcional: window.location.href = 'anamnese.html';
            }
        } catch (error) {
            Logger.error('Erro ao buscar dados de anamnese', { message: error.message });
            userNameSpan.textContent = "Aluno";
        }

        // Retirar tela de carregamento
        loadingScreen.style.display = 'none';

    } else {
        Logger.warn('Acesso negado: usuário não autenticado tentou acessar dashboard');
        // Se não estiver logado, chuta para o login
        window.location.href = 'login.html';
    }
});

// 2. FUNÇÃO DE LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            Logger.info('Usuário iniciando logout do dashboard');
            await signOut(auth);
            Logger.info('Logout bem-sucedido');
            window.location.href = 'login.html';
        } catch (error) {
            Logger.error('Erro ao fazer logout', { message: error.message });
        }
    });
}
