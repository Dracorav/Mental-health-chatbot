'use server';

import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Message = {
    role: 'user' | 'assistant';
    text: string;
};

// This is a placeholder for now. We will implement chat history in a future step.
export async function addMessage(userId: string, message: Message) {
    if (!userId) {
        console.error("No user ID provided to addMessage.");
        return;
    }
    
    try {
        const messagesCollection = collection(db, 'users', userId, 'messages');
        await addDoc(messagesCollection, {
            ...message,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding message to Firestore: ", error);
    }
}

// This is a placeholder for now. We will implement chat history in a future step.
export async function getMessages(userId: string) {
    if (!userId) {
        console.error("No user ID provided to getMessages.");
        return [];
    }

    try {
        const messagesCollection = collection(db, 'users', userId, 'messages');
        const q = query(messagesCollection, orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
            messages.push(doc.data() as Message);
        });

        return messages.reverse();
    } catch (error) {
        console.error("Error getting messages from Firestore: ", error);
        return [];
    }
}
