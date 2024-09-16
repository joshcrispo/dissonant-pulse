import React from 'react';
import DissonantPulseLogo from '../assets/DP.png'
import { Helmet } from 'react-helmet';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - About</title>
            </Helmet>
            <div className=" flex items-center">
                <img src={DissonantPulseLogo} alt="Dissonant Pulse"  />  
            </div>
            <h1 className="text-4xl font-bold">Shop...</h1>
        </div>
    );
};

export default About;