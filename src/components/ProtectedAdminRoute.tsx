import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    // Get user role from Firestore
                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        setIsAdmin(true);
                    } else {
                        navigate('/'); // Redirect if not an admin
                    }
                } else {
                    navigate('/login'); // Redirect to login if not authenticated
                }
                setLoading(false);
            });
        };

        checkAuth();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return isAdmin ? <>{children}</> : null;
};

export default ProtectedAdminRoute;

export {};