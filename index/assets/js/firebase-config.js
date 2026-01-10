// Importações via CDN (Versão 10.7.1 - compatível com módulos)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================================================
// TODO: SUBSTITUA O OBJETO ABAIXO PELAS SUAS CHAVES DO FIREBASE
// Vá em: Firebase Console > Configurações do Projeto > Geral > Seus aplicativos
// ===============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBhn78MS1oil5bQqrT9zu16ZuiEssWkpTw",
  authDomain: "site-gustavo-consignani.firebaseapp.com",
  projectId: "site-gustavo-consignani",
  storageBucket: "site-gustavo-consignani.firebasestorage.app",
  messagingSenderId: "398708841488",
  appId: "1:398708841488:web:d98bdaf980c541b976be95",
  measurementId: "G-FPRMGV4209"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para serem usados em auth.js e anamnese.js
export const auth = getAuth(app);
export const db = getFirestore(app);
