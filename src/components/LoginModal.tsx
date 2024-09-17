import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { auth } from '../firebase';

interface ModalProps {
    onClose: () => void;
    buttonRef: React.RefObject<HTMLButtonElement>;
}

const LoginModal: React.FC<ModalProps> = ({ onClose, buttonRef }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const { user } = useContext(UserContext);

    // Update the modal position based on the UserIcon position
    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 10, // Position it slightly below the UserIcon
                left: rect.left + rect.width / 2, // Center horizontally
            });
        }
    };

    useEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);

        // Clean up the event listener on unmount
        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, [buttonRef]);

    // Handle closing the modal
    useEffect(() => {
        if (!isVisible) {
            onClose();
        }
    }, [isVisible, onClose]);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            onClose();
        });
    };

    // Render the modal using ReactDOM.createPortal
    return ReactDOM.createPortal(
        <div
            className={`fixed z-50 ${isVisible ? 'block' : 'hidden'}`}
            style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
        >
            <div className="relative bg-black border border-gray-400 p-5 w-64">
                {/* Caret pointing to UserIcon */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-400"></div>
                </div>
                {user ? (
                    <>
                        <span className="mb-4 text-white text-center block">Hi, {user.username || user.email}</span>
                        <Link
                            to="/account"
                            className="mb-4 w-full text-white text-center border-2 border-gray-600 px-6 py-2 block hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                        >
                            Account
                        </Link>
                        {user.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="mb-4 w-full text-white text-center border-2 border-gray-600 px-6 py-2 block hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                            >
                                Admin
                            </Link>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="mb-4 w-full text-white text-center border-2 border-gray-600 px-6 py-2 block hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="mb-4 w-full text-white text-center border-2 border-gray-600 px-6 py-2 block hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    >
                        Login
                    </Link>
                )}
                <button
                    onClick={() => setIsVisible(false)}
                    className="w-full text-white text-center border-2 border-gray-600 px-6 py-2 block hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                >
                    Close
                </button>
            </div>
        </div>,
        document.body // Render to the body to avoid clipping issues
    );
};

export default LoginModal;
