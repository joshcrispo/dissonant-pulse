import React, { useState } from 'react';
import {  signInWithEmailAndPassword   } from 'firebase/auth';
import { auth } from '../firebase';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React. MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user)
            console.log('Login successful');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Login failed:', error.message);
            } else {
                console.error('An unexpected error occured');
            }
            
        }
    };

    return (
        <div className="min-h-screen bg-black flex justify-center items-center">
            <div className="bg-black p-8 border-2 border-white w-1/2 -mt-20 max-w-lg">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">Admin Login</h1>
                
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
            </div>
        </div>
    );
};    

export default AdminLogin;
