// Importações via CDN (Versão 10.7.1 - compatível com módulos)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================================================
// TODO: SUBSTITUA O OBJETO ABAIXO PELAS SUAS CHAVES DO FIREBASE
// Vá em: Firebase Console > Configurações do Projeto > Geral > Seus aplicativos
// ===============================================================
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para serem usados em auth.js e anamnese.js
export const auth = getAuth(app);
export const db = getFirestore(app);
