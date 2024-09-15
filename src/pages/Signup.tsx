import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import { Helmet } from 'react-helmet';


const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const navigate = useNavigate();

    const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            // Create a new user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const currentUser = userCredential.user;

            // Store user data in Firestore using the UID as the document ID
            await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                username: username,
                role: 'user', // Set the role to 'user' for all sign-ups
            });

            console.log('Sign-up successful');
            // Redirect to the home page or any other desired route
            navigate('/'); // Change the path to your home page route
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Sign-up failed:', error.message);
            } else {
                console.error('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="min-h-screen bg-black flex justify-center items-center">
            <Helmet>
                <title>Dissonant Pulse - Signup</title>
            </Helmet>
            <div className="bg-black p-8 border-2 border-white w-1/2 max-w-lg">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">Sign Up</h1>
                
                <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-white bg-black text-white focus:outline-none"
                        placeholder="Enter your username"
                    />
                </div>
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
                    onClick={handleSignup}
                    className="w-full bg-black border border-white text-white py-2 px-4 hover:bg-gray-700 transition duration-200"
                >
                    Sign Up
                </button>
                
                <p className="text-white text-center mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
