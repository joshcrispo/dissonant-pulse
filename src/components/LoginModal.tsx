import React, { useState, useEffect, useContext } from 'react';
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
    const [caretPosition, setCaretPosition] = useState({ left: '50%' });
    const { user } = useContext(UserContext);

    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + 10, left: rect.left - 75 });
            setCaretPosition({ left: `${rect.width * 2.21}px` }); // Center the caret
        }
    };

    const handleSignOut = () => {
        auth.signOut().then(() => {
            onClose(); 
        });
    };

    useEffect(() => {
        if (!isVisible) {
            onClose();
        }
    }, [isVisible, onClose]);

    useEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, [buttonRef]);

    const buttonClass = "w-full text-white text-center border-2 border-gray-600 px-6 py-2 block hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer";

    return (
        <div className={`fixed ${isVisible ? 'block' : 'hidden'}`} style={{ top: `${position.top}px`, left: `${position.left}px` }}>
            <div className="relative bg-black border border-gray-400 p-5">
                <div className="absolute" style={{ top: '-8px', left: caretPosition.left, transform: 'translateX(-50%)' }}>
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-400"></div>
                </div>
                {user ? (
                    <>
                        <span className="mb-4 text-white text-center block">Hi, {user.username || user.email}</span>
                        <Link to="/account" className={`mb-4 ${buttonClass}`}>
                            Account
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className={`mb-4 ${buttonClass}`}>
                                Admin
                            </Link>
                        )}
                        <button onClick={handleSignOut} className={`mb-4 ${buttonClass}`}>
                            Sign out
                        </button>
                    </>
                ) : (
                    <Link to="/login" className={`mb-4 ${buttonClass}`}>
                        Login
                    </Link>
                )}
                <button onClick={() => setIsVisible(false)} className={buttonClass}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default LoginModal;
