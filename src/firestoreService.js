import { 
    collection, 
    doc,
    addDoc, 
    getDocs,
    getDoc,
    setDoc,
    query, 
    where,
    orderBy,
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "./firebase";
  
  // ==================== PROCEDIMENTOS ====================
  
  export async function salvarProcedimento(userId, procedimento) {
    try {
      const docRef = await addDoc(collection(db, "procedimentos"), {
        ...procedimento,
        userId: userId,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar procedimento:", error);
      throw error;
    }
  }
  
  export async function buscarProcedimentos(userId) {
    try {
      const q = query(
        collection(db, "procedimentos"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const procedimentos = [];
      
      querySnapshot.forEach((doc) => {
        procedimentos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return procedimentos;
    } catch (error) {
      console.error("Erro ao buscar procedimentos:", error);
      throw error;
    }
  }
  
  // ==================== TIPOS E SUBDIVISÕES ====================
  
  export async function buscarConfiguracoes(userId) {
    try {
      const docRef = doc(db, "usuarios", userId, "configuracoes", "procedimentos");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Retorna estrutura vazia para novos usuários
        return {
          tipos: [],
          subdivisoes: {}
        };
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      throw error;
    }
  }
  
  export async function salvarConfiguracoes(userId, configuracoes) {
    try {
      const docRef = doc(db, "usuarios", userId, "configuracoes", "procedimentos");
      await setDoc(docRef, configuracoes);
      return true;
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  }
  
  export async function adicionarTipo(userId, novoTipo) {
    try {
      const config = await buscarConfiguracoes(userId);
      
      if (!config.tipos.includes(novoTipo)) {
        config.tipos.push(novoTipo);
        config.subdivisoes[novoTipo] = []; // Cria array vazio de subdivisões
        await salvarConfiguracoes(userId, config);
      }
      
      return config;
    } catch (error) {
      console.error("Erro ao adicionar tipo:", error);
      throw error;
    }
  }
  
  export async function adicionarSubdivisao(userId, tipo, novaSubdivisao) {
    try {
      const config = await buscarConfiguracoes(userId);
      
      if (!config.subdivisoes[tipo]) {
        config.subdivisoes[tipo] = [];
      }
      
      if (!config.subdivisoes[tipo].includes(novaSubdivisao)) {
        config.subdivisoes[tipo].push(novaSubdivisao);
        await salvarConfiguracoes(userId, config);
      }
      
      return config;
    } catch (error) {
      console.error("Erro ao adicionar subdivisão:", error);
      throw error;
    }
  }
  