import React, { useRef, useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DissonantPulseLogo from '../assets/DP.png';
import { Bars3Icon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { UserContext } from '../context/UserContext';
import { auth } from '../firebase';


const Navbar: React.FC = () => {
    const { user, loading, setUser } = useContext(UserContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setIsMenuOpen(prev => !prev);
    };

    const handleAccountMenuToggle = () => {
        setIsAccountMenuOpen((prev) => !prev);
    };

    const handleSignOut = async () => {
        await auth.signOut();
        setUser(null);
    };

    useEffect(() => {
        console.log('Navbar user state:', user, loading);
    }, [user, loading]);

    return (
        <>
            <nav className="bg-black p-4">
                <div className="flex items-center justify-between lg:mx-24">
                    <div className="flex items-center justify-center w-full lg:w-auto lg:justify-start">
                        <img src={DissonantPulseLogo} alt="Dissonant Pulse" className="h-12 w-12 lg:mr-4" />
                        {/* Center the text on smaller screens */}
                        <span className="text-white text-xl lg:block lg:text-left text-center w-full lg:w-auto">Dissonant Pulse</span>
                    </div>
                    {/* Small screens */}
                    <div className="relative flex items-center lg:hidden">
                        <button onClick={handleMenuToggle} className="text-white">
                            <Bars3Icon className="h-8 w-8" />
                        </button>

                        {/* Sliding side menu */}
                        <div
                            className={`fixed top-0 right-0 h-full bg-black text-white w-64 transform transition-transform duration-300 ease-in-out ${
                                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                            } z-20`}
                        >
                            <button onClick={handleMenuToggle} className="p-4 text-gray-400 hover:text-white">
                                <span className="sr-only">Close menu</span>
                            </button>
                            <ul className="p-4 space-y-2">
                                <li>
                                    <Link to="/" className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105">
                                        HOME
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/events" className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105">
                                        EVENTS
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shop" className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105">
                                        SHOP
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/gallery" className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105">
                                        GALLERY
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105">
                                        ABOUT
                                    </Link>
                                </li>
                                <li className="relative">
                                    {!user ? (
                                        <Link
                                            to="/login"
                                            className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                        >
                                            LOGIN
                                        </Link>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleAccountMenuToggle}
                                                className="flex items-center justify-between block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full"
                                            >
                                                ACCOUNT
                                                {isAccountMenuOpen ? (
                                                    <ChevronUpIcon className="h-6 w-6 ml-2" />
                                                ) : (
                                                    <ChevronDownIcon className="h-6 w-6 ml-2" />
                                                )}
                                            </button>
                                            {isAccountMenuOpen && (
                                                <ul 
                                                    className={`absolute left-6 top-10 bg-black text-white p-2 
                                                        ${isAccountMenuOpen ? 'dropdown-enter' : 'dropdown-exit'}`}
                                                >
                                                    <li>
                                                        <Link
                                                            to="/profile"
                                                            className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                                        >
                                                            Profile
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            to="/tickets"
                                                            className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                                        >
                                                            My Tickets
                                                        </Link>
                                                    </li>
                                                    {user?.role === 'admin' && (
                                                        <li>
                                                            <Link
                                                                to="/admin"
                                                                className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                                            >
                                                                Admin Panel
                                                            </Link>
                                                        </li>
                                                    )}
                                                    <li>
                                                        <button
                                                            onClick={handleSignOut}
                                                            className="block px-4 py-2 text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                                        >
                                                            Sign Out
                                                        </button>
                                                    </li>
                                                </ul>
                                            )}
                                        </>
                                    )}
                                </li>
                            </ul>
                        </div>
                        {isMenuOpen && <div className="fixed inset-0 bg-black opacity-50 z-10" onClick={handleMenuToggle}></div>}
                    </div>

                    {/* Large screens */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-2">
                        <Link to="/" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                            HOME
                        </Link>
                        <Link to="/events" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                            EVENTS
                        </Link>
                        <Link to="/shop" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                            SHOP
                        </Link>
                        <Link to="/gallery" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                            GALLERY
                        </Link>
                        <Link to="/about" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                            ABOUT
                        </Link>
                        <li className="relative flex justify-center">
                            {!user ? (
                                <Link
                                    to="/login"
                                    className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block focus:outline-none"
                                >
                                    LOGIN
                                </Link>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={handleAccountMenuToggle}
                                        className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block focus:outline-none"
                                    >
                                        ACCOUNT
                                    </button>
                                    {isAccountMenuOpen && (
                                        <ul
                                            className={`absolute bg-black text-white shadow-lg p-4 mt-1 border border-white 
                                                ${isAccountMenuOpen ? 'dropdown-enter' : 'dropdown-exit'}`}
                                        >
                                            <li className="mb-2">
                                                <Link to="/profile" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                                                    Profile
                                                </Link>
                                            </li>
                                            <li className="mb-2">
                                                <Link to="/tickets" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                                                    Tickets
                                                </Link>
                                            </li>
                                            {user?.role === 'admin' && (
                                                <li className="mb-2">
                                                    <Link to="/admin" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block">
                                                        Admin
                                                    </Link>
                                                </li>
                                            )}
                                            <li className="mb-2">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 px-6 py-2 text-center block w-full text-left focus:outline-none"
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            )}
                        </li>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
