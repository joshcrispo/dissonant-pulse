import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface User {
    uid: string;
    email: string;
    username: string;
    role: string;
}

interface UserContextProps {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>; // Add setUser here
}

export const UserContext = createContext<UserContextProps>({
    user: null,
    loading: true,
    setUser: () => {}, // Provide a default no-op function
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userRef);
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            username: userData.username || 'Anonymous',
                            role: userData.role,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
