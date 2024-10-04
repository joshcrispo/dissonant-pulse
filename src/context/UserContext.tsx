import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Define a Ticket interface to represent ticket data
export interface Ticket {
    ticketID: string; // Unique identifier for each ticket
    createdAt: string; // Date the ticket was created or purchased
    eventName: string; // Name of the event
    date: string; // Date of the event (You may want to add this based on your needs)
}

// Define a User interface that matches your current data structure
export interface User {
    uid: string;
    email: string;
    firstName: string;
    username?: string; // Optional username property if needed
    photoURL: string;
    purchase_tracker: number;
    role: string;
    tickets: Ticket[]; // Use the Ticket interface here
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

                        // Ensure tickets is correctly typed
                        const tickets: Ticket[] = (userData.tickets || []).map((ticket: any) => ({
                            ticketID: ticket.ticketID, // Ensure this matches your Firestore structure
                            createdAt: ticket.createdAt, // Ensure this matches your Firestore structure
                            eventName: ticket.eventName, // Ensure this matches your Firestore structure
                            date: ticket.date, // Include date if needed
                        }));

                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            firstName: userData.firstName || 'Anonymous', // Use firstName field
                            photoURL: userData.photoURL || '', // Profile photo URL
                            purchase_tracker: userData.purchase_tracker || 0, // Purchase tracker value
                            role: userData.role || 'user',
                            tickets, // Assign the processed tickets
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
