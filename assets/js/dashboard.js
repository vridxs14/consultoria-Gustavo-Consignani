import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ELEMENTOS
const userNameSpan = document.getElementById('user-name');
const loadingScreen = document.getElementById('loading-screen');
const logoutMobile = document.getElementById('logout-btn-mobile');
const logoutDesktop = document.getElementById('logout-btn-desktop');

// PARAMS (URL)
const urlParams = new URLSearchParams(window.location.search);
const pStatus = urlParams.get('status');
const pPlano = urlParams.get('plano');

// === LÓGICA CENTRAL DE AUTENTICAÇÃO E SEGURANÇA ===
onAuthStateChanged(auth, async (user) => {

    // 1. NÃO LOGADO -> TCHAU
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // 2. LOGADO MAS E-MAIL NÃO VERIFICADO -> TCHAU (EXCETO SE ACABOU DE COMPRAR)
    const isNewPurchase = (pStatus === 'aprovado' && pPlano);

    if (!user.emailVerified && !isNewPurchase) {
        alert("E-mail não verificado. Verifique sua caixa de entrada.");
        await signOut(auth);
        window.location.href = 'login.html';
        return;
    }

    console.log("Usuário autenticado:", user.email);

    // 3. FLUXO DE PÓS-COMPRA (Salva no banco se necessário)
    // Se o user acabou de voltar do "gateway" com status aprovado
    if (isNewPurchase) {
        await processNewPurchase(user, pPlano);
    }

    // 4. VERIFICA SE TEM PLANO ATIVO (Se NÃO estiver no fluxo de compra)
    // Se ele já processou a compra acima, vai ter plano.
    // Se ele entrou direto, precisa checar no banco.
    const hasPlan = await checkActivePlan(user);

    if (!hasPlan) {
        alert("Você ainda não possui um plano ativo. Redirecionando para os planos...");
        window.location.href = 'planos.html';
        return; // Não retira o loading screen
    }

    // 5. SE PASSOU POR TUDO: CARREGA PERFIL E ABRE DASHBOARD
    await loadUserProfile(user);

    // Finalmente, remove a tela de carregamento
    if (loadingScreen) loadingScreen.style.display = 'none';

});


// --- FUNÇÕES AUXILIARES ---

async function processNewPurchase(user, planoRaw) {
    const plano = planoRaw.toLowerCase();
    const welcomeBox = document.getElementById('welcome-payment');
    const waBtn = document.getElementById('btn-whatsapp-start');

    // Exibir Modal
    if (document.getElementById('welcome-modal-overlay')) {
        document.getElementById('welcome-modal-overlay').style.display = 'flex';
    }
    if (welcomeBox) welcomeBox.style.display = 'block';

    // Link WhatsApp
    const msg = `Olá Gustavo! Assinei o plano *${plano.toUpperCase()}* e quero começar!`;
    const waLink = `https://wa.me/5511993416045?text=${encodeURIComponent(msg)}`;
    if (waBtn) waBtn.href = waLink;

    // Salvar no Firestore
    const planValues = { 'mensal': 129.97, 'trimestral': 299.90, 'semestral': 539.40 };
    const value = planValues[plano] || 0;

    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            activePlan: plano,
            planValue: value,
            purchaseDate: new Date().toISOString()
        }, { merge: true });
        console.log(`Venda processada: ${plano}`);
    } catch (e) {
        console.error("Erro ao salvar compra:", e);
    }
}

async function checkActivePlan(user) {
    // Se acabamos de processar compra na sessão atual, consideramos true
    if (pStatus === 'aprovado' && pPlano) return true;

    try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Retorna true se tiver activePlan
            return !!data.activePlan;
        }
        return false; // User doc não existe ou não tem plano
    } catch (e) {
        console.error("Erro checkActivePlan:", e);
        // Em caso de erro de rede, talvez seja melhor não bloquear? 
        // Por segurança, vamos bloquear e pedir refresh.
        return false;
    }
}

async function loadUserProfile(user) {
    // Tenta nome do Auth
    if (user.displayName) {
        if (userNameSpan) userNameSpan.textContent = user.displayName.split(' ')[0];
        return;
    }

    // Tenta Firestore
    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().nome) {
            if (userNameSpan) userNameSpan.textContent = docSnap.data().nome.split(' ')[0];
        }
    } catch (e) {
        console.error("Erro profile:", e);
    }
}

// FUNÇÃO DE LOGOUT
async function handleLogout(e) {
    e.preventDefault();
    await signOut(auth);
    window.location.href = 'login.html';
}

if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);
if (logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);
