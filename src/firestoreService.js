import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where,
    orderBy,
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "./firebase";
  
  // Salvar procedimento no Firestore
  export async function salvarProcedimento(userId, procedimento) {
    try {
      const docRef = await addDoc(collection(db, "procedimentos"), {
        ...procedimento,
        userId: userId,
        createdAt: serverTimestamp()
      });
      console.log("Procedimento salvo com ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar:", error);
      throw error;
    }
  }
  
  // Buscar procedimentos do usuário
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
      console.error("Erro ao buscar:", error);
      throw error;
    }
  }
  