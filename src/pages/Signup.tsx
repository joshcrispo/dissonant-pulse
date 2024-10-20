import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { setDoc, doc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const validateUsername = (username: string) => {
        return username.length <= 9;
    };

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!username || !email || !password || !confirmPassword || !firstName) {
            setError('All fields are required');
            return;
        }
        if (!validateUsername(username)) {
            setError('Username must be less than 9 characters');
            return;
        }
        if (!validatePassword(password)) {
            setError('Password must contain at least one uppercase letter, one number, and one symbol');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const currentUser = userCredential.user;
    
            await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                username: username,
                firstName: firstName,
                role: 'user',
                purchase_tracker: 0,
                tickets: [],
                photoURL: '',
            });
    
            console.log('Sign-up successful');
            navigate('/');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Sign-up failed:', error.message);
                setError(error.message);
            } else {
                console.error('An unexpected error occurred');
                setError('An unexpected error occurred');
            }
        }
    };    

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Helmet>
                <title>Dissonant Pulse - Signup</title>
            </Helmet>

            {/* Sign Up Section */}
            <div className="flex flex-col md:flex-row justify-between items-center p-4 w-9/12 mx-auto max-w-9xl">
                {/* Dissonant Pulse Section */}
                <div className="hidden lg:flex flex-col justify-between w-full md:w-1/2 h-[180px] px-10">
                    <h1 className="text-white text-6xl font-bold pulse-animation">Dissonant</h1>
                    <h1 className="text-white text-8xl font-bold pulse-animation self-end">PULSE</h1>
                </div>
                {/* Signup Form Section */}
                <div className="bg-black p-6 border-2 border-white w-full md:w-1/2 max-w-md mx-4"> {/* Added margin to the left and right */}
                    <h1 className="text-3xl font-bold text-white mb-4 text-center">Sign Up</h1>
                    
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    
                    <div className="mb-4">
                        <label className="block text-white mb-1" htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                            placeholder="Enter your first name"
                        />
                        {error && !firstName && <p className="text-red-500">First name is required</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-white mb-1" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                            placeholder="Enter your username"
                        />
                        {error && !validateUsername(username) && <p className="text-red-500">Username must be less than 9 characters</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-white mb-1" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                            placeholder="Enter your email"
                        />
                        {error && !email && <p className="text-red-500">Email is required</p>}
                    </div>
                    
                    <div className="mb-4 relative">
                        <label className="block text-white mb-1" htmlFor="password">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-2 text-white"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {error && !validatePassword(password) && <p className="text-red-500">Password must contain at least one uppercase letter, one number, and one symbol</p>}
                    </div>

                    <div className="mb-6 relative">
                        <label className="block text-white mb-1" htmlFor="confirmPassword">Re-enter Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                            placeholder="Re-enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-2 text-white"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {error && password !== confirmPassword && <p className="text-red-500">Passwords do not match</p>}
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
        </div>
    );
};

export default Signup;
