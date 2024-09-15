import React from 'react';
import DissonantPulseLogo from '../assets/DP.png'


const Events: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <div className=" flex items-center">
                <img src={DissonantPulseLogo} alt="Dissonant Pulse"  />  
            </div>
            <h1 className="text-4xl font-bold">To be determined...</h1>
        </div>
    );
};

export default Events;