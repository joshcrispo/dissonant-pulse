import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Define a User interface that matches your current data structure
interface User {
    uid: string;
    email: string;
    firstName: string;
    username?: string; // Optional username property if needed
    photoURL: string;
    purchase_tracker: number;
    role: string;
    tickets: Array<{ eventName: string; date: string }>;
}

// Define the UserContext properties
interface UserContextProps {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create a context with initial default values
export const UserContext = createContext<UserContextProps>({
    user: null,
    loading: true,
    setUser: () => {}, // Default no-op function
});

// Define the UserProvider component
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
                        // Remove 'username' and use other fields
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            firstName: userData.firstName || 'Anonymous', // Use firstName field
                            photoURL: userData.photoURL || '', // Profile photo URL
                            purchase_tracker: userData.purchase_tracker || 0, // Purchase tracker value
                            role: userData.role || 'user',
                            tickets: userData.tickets || [], // Array of tickets
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
