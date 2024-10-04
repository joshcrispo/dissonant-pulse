import React from 'react';

type QRModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white h-4/5 border-8 border-red-600 shadow-lg p-6 w-4/6 sm:w-3/6 lg:w-4/5 flex flex-col items-center justify-center">
                <button
                    className="absolute top-2 right-4 text-gray-700 hover:text-black text-2xl"
                    onClick={onClose}
                >
                    &#x2715; {/* Unicode for 'X' symbol */}
                </button>
                {children}
            </div>
        </div>
    );
};

export default QRModal;
