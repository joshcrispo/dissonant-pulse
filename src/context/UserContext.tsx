import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';


export interface Ticket {
    ticketID: string;
    createdAt: string;
    eventName: string;
    date: string;
}

export interface User {
    uid: string;
    email: string;
    firstName: string;
    username?: string;
    photoURL: string;
    purchase_tracker: number;
    role: string;
    tickets: Ticket[];
}

interface UserContextProps {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextProps>({
    user: null,
    loading: true,
    setUser: () => {},
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

                        const tickets: Ticket[] = (userData.tickets || []).map((ticket: any) => ({
                            ticketID: ticket.ticketID,
                            createdAt: ticket.createdAt,
                            eventName: ticket.eventName,
                            date: ticket.date,
                        }));

                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            firstName: userData.firstName || 'Anonymous',
                            photoURL: userData.photoURL || '',
                            purchase_tracker: userData.purchase_tracker || 0,
                            role: userData.role || 'user',
                            tickets,
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
