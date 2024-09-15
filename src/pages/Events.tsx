import React from 'react';

const Events: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <section className="mt-40 mx-auto text-center max-w-3xl">
            <h1 className="my-16 text-4xl font-bold">Upcoming Events</h1>
                <ul className="my-8 space-y-2">
                    <li className="my-4 text-gray-400">Event 1: September 30, 2024 @ XYZ Club</li>
                    <li className="my-4 text-gray-400">Event 2: October 15, 2024 @ ABC Venue</li>
                </ul>
            </section>
        </div>
    );
};

export default Events;