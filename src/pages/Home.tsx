import React from 'react';
import { Helmet } from 'react-helmet';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center ">
            <Helmet>
                <title>Dissonant Pulse - Home</title>
            </Helmet>
            <h1 className="mx-auto my-16 text-4xl font-bold">Welcome to Dissonant Pulse</h1>
            <p className="text-lg">Experience the latest and greatest in underground techno.</p>

            <section className="mt-16 mx-auto text-center max-w-3xl">
                <h2 className="mt-24 text-2xl font-semibold">Upcoming Events</h2>
                <ul className="my-8 space-y-2">
                    <li className="my-4 text-gray-400">Event 1: September 30, 2024 @ XYZ Club</li>
                    <li className="my-4 text-gray-400">Event 2: October 15, 2024 @ ABC Venue</li>
                </ul>
            </section>
        </div>
    );
};

export default Home;
