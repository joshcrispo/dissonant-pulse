import React, { useRef, useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DissonantPulseLogo from '../assets/DP.png';
import { UserIcon } from '@heroicons/react/24/solid';
import LoginModal from './LoginModal';
import { UserContext } from '../context/UserContext'; 
import { auth } from '../firebase';

const Navbar: React.FC = () => {
    const { user, loading } = useContext(UserContext); // Access the current user from UserContext
    const [isModalVisible, setIsModalVisible] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    // Add a console log to verify the user state in the Navbar
    useEffect(() => {
        console.log('Navbar user state:', user, loading);
    }, [user, loading]);

    return (
        <nav className="bg-black p-4">
            <div className="flex items-center justify-between">
                <div className="ml-16 flex items-center">
                    <img src={DissonantPulseLogo} alt="Dissonant Pulse" className="h-12 w-12 mr-4" />
                    <span className="text-white text-xl">Dissonant Pulse</span>
                </div>
                <ul className="mr-16 flex space-x-8">
                    <li>
                        <Link to="/" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 border-2 border-gray-600 px-6 py-2 text-center block">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/events" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 border-2 border-gray-600 px-6 py-2 text-center block">
                            Events
                        </Link>
                    </li>
                    <li>
                        <Link to="/about" className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 border-2 border-gray-600 px-6 py-2 text-center block">
                            About
                        </Link>
                    </li>
                    <li>
                        <button ref={buttonRef} onClick={() => setIsModalVisible(true)} className="focus:outline-none">
                            <UserIcon className="h-11 w-11 text-white hover:text-gray-400 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105" />
                        </button>
                        {isModalVisible && <LoginModal onClose={handleModalClose} buttonRef={buttonRef} />}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
