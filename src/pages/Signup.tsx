import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
            console.log('Sign-up successful');
            // Redirect to the home page after successful sign-up
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
            <div className="bg-black p-8 border-2 border-white w-1/2 -mt-20 max-w-lg">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">Sign Up</h1>
                
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
                    className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
                >
                    Sign Up
                </button>
                
                <p className="text-white mt-4">
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
