import React, { useRef, useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DissonantPulseLogo from '../assets/DP.png';
import { UserIcon, Bars3Icon } from '@heroicons/react/24/solid';
import LoginModal from './LoginModal';
import { UserContext } from '../context/UserContext'; 
import { auth } from '../firebase';

const Navbar: React.FC = () => {
    const { user, loading } = useContext(UserContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(prev => !prev);
    };

    useEffect(() => {
        console.log('Navbar user state:', user, loading);
    }, [user, loading]);

    return (
        <>
            <nav className="bg-black p-4">
                <div className="flex items-center justify-between lg:mx-24">
                    {/* Logo and Title */}
                    <div className="flex items-center justify-center w-full lg:w-auto lg:justify-start">
                        <img src={DissonantPulseLogo} alt="Dissonant Pulse" className="h-12 w-12 lg:mr-4" />
                        {/* Center the text on smaller screens */}
                        <span className="text-white text-xl lg:block lg:text-left text-center w-full lg:w-auto">Dissonant Pulse</span>
                    </div>
                    {/* Menu button for smaller screens */}
                    <div className="relative flex items-center lg:hidden">
                        <button onClick={handleMenuToggle} className="text-white">
                            <Bars3Icon className="h-8 w-8" />
                        </button>
                        {/* Sliding side menu */}
                        <div className={`fixed top-0 right-0 h-full bg-black text-white w-64 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} z-20`}>
                            <button onClick={handleMenuToggle} className="p-4 text-gray-400 hover:text-white">
                                <span className="sr-only">Close menu</span>
                            </button>
                            <ul className="p-4 space-y-2">
                                <li>
                                    <Link to="/" className="block px-4 py-2 hover:bg-gray-700 transition duration-300">HOME</Link>
                                </li>
                                <li>
                                    <Link to="/events" className="block px-4 py-2 hover:bg-gray-700 transition duration-300">EVENTS</Link>
                                </li>
                                <li>
                                    <Link to="/shop" className="block px-4 py-2 hover:bg-gray-700 transition duration-300">SHOP</Link>
                                </li>
                                <li>
                                    <Link to="/gallery" className="block px-4 py-2 hover:bg-gray-700 transition duration-300">GALLERY</Link>
                                </li>
                                <li>
                                    <Link to="/about" className="block px-4 py-2 hover:bg-gray-700 transition duration-300">ABOUT</Link>
                                </li>
                                <li className="flex justify-center">
                                    <button ref={buttonRef} onClick={() => setIsModalVisible(true)} className="focus:outline-none">
                                        <UserIcon className="h-11 w-11 text-white hover:text-gray-400 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105" />
                                    </button>
                                    {isModalVisible && <LoginModal onClose={handleModalClose} buttonRef={buttonRef} />}
                                </li>
                            </ul>
                        </div>
                        {isMenuOpen && <div className="fixed inset-0 bg-black opacity-50 z-10" onClick={handleMenuToggle}></div>}
                    </div>
                    {/* Links for larger screens */}
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
                            <button ref={buttonRef} onClick={() => setIsModalVisible(true)} className="focus:outline-none">
                                <UserIcon className="h-11 w-11 text-white hover:text-gray-400 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105" />
                            </button>
                            {isModalVisible && <LoginModal onClose={handleModalClose} buttonRef={buttonRef} />}
                        </li>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
