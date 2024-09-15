import React from 'react';
import { Link } from 'react-router-dom';
import DissonantPulseLogo from '../assets/DP.png'


const Navbar: React.FC = () => {
    return (
        <nav className="bg-black p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={DissonantPulseLogo} alt="Dissonant Pulse" className="h-12 w-12 mr-4" />  {/* Adjust height and width as needed */}
                    <span className="text-white text-xl">Dissonant Pulse</span>
                </div>
                <ul className="flex space-x-8">
                    <li>
                        <Link 
                        to="/" 
                        className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 
                                    border-2 border-gray-600 px-6 py-2 text-center block"
                        >
                        Home
                        </Link>
                    </li>
                    <li>
                        <Link 
                        to="/events" 
                        className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 
                                    border-2 border-gray-600 px-6 py-2 text-center block"
                        >
                        Events
                        </Link>
                    </li>
                    <li>
                        <Link 
                        to="/about" 
                        className="text-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 
                                    border-2 border-gray-600 px-6 py-2 text-center block"
                        >
                        About
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
