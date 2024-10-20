import React, { useState, useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const currentUser = userCredential.user;

            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email || '',
                    firstName: userData.firstName || 'Anonymous', 
                    photoURL: userData.photoURL || '',
                    purchase_tracker: userData.purchase_tracker || 0,
                    role: userData.role || 'user',
                    tickets: userData.tickets || [],
                });

                navigate('/');
            } else {
                setError('User not found in Firestore');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Login failed:', error.message);
                setError('Invalid email or password');
            } else {
                console.error('An unexpected error occurred');
                setError('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Helmet>
                <title>Dissonant Pulse - Login</title>
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-center p-4 w-9/12 mx-auto max-w-9xl">
                <div className="hidden lg:flex flex-col justify-between w-full md:w-1/2 h-[180px] px-10">
                    <h1 className="text-white text-6xl font-bold pulse-animation">Dissonant</h1>
                    <h1 className="text-white text-8xl font-bold pulse-animation self-end">PULSE</h1>
                </div>

                <div className="bg-black p-6 border-2 border-white w-full md:w-1/2 max-w-md mx-4">
                    <h1 className="text-3xl font-bold text-white mb-4 text-center">Log In</h1>

                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                    <div className="mb-4">
                        <label className="block text-white mb-1" htmlFor="email">Email</label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-white bg-black text-white focus:outline-none focus:border-red-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-6 relative">
                        <label className="block text-white mb-1" htmlFor="password">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
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
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full bg-black border border-white text-white py-2 px-4 hover:bg-gray-700 transition duration-200"
                    >
                        Log In
                    </button>
                    <p className="text-white text-center mt-4">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
