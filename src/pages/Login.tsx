import React, { useState, useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext); // Access setUser from UserContext

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        try {
            // Authenticate the user with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const currentUser = userCredential.user;
    
            // Log the UID and path
            console.log("UID:", currentUser.uid);
            console.log("Document path:", `users/${currentUser.uid}`);
    
            // Query the Firestore collection for the user with the matching email
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
    
            // Check if the document exists
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role;
    
                console.log('User role:', userRole);
                console.log('Login successful');
    
                // Update the global user context
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email || '',
                    username: userData.username || 'Anonymous',
                });
    
                // Redirect to the home page after successful login
                navigate('/'); // Change the path to your home page route
            } else {
                console.error('User not found in Firestore');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Login failed:', error.message);
            } else {
                console.error('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="min-h-screen bg-black flex justify-center items-center">
            <Helmet>
                <title>Dissonant Pulse - Login</title>
            </Helmet>
            <div className="bg-black p-8 border-2 border-white w-1/2 max-w-lg">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">Login</h1>
                
                <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter your email"
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-white mb-2" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full bg-black border border-white text-white py-2 px-4 hover:bg-gray-700 transition duration-200"
                >
                    Login
                </button>
                <p className="text-white text-center mt-4">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
