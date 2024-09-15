import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const Admin: React.FC = () => {
    const [eventName, setEventName] = useState('');
    const [artists, setArtists] = useState('');
    const [date, setDate] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [error, setError] = useState('');

    const handleAddEvent = async () => {
        if (!eventName || !artists || !date || !photoURL) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const eventsCollection = collection(db, 'events');
            await addDoc(eventsCollection, {
                eventName,
                artists,
                date,
                photoURL,
                createdAt: new Date(),
            });
            setEventName('');
            setArtists('');
            setDate('');
            setPhotoURL('');
            setError('');
            alert('Event added successfully!');
        } catch (error) {
            console.error('Error adding event:', error);
            setError('Failed to add event.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
            <div className="w-1/2 bg-gray-900 p-8 border border-white">
                <h1 className="text-3xl font-bold mb-6">Admin - Add Event</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block mb-2">Event Name</label>
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="w-full p-2 bg-black border border-white text-white"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Artists</label>
                    <input
                        type="text"
                        value={artists}
                        onChange={(e) => setArtists(e.target.value)}
                        className="w-full p-2 bg-black border border-white text-white"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 bg-black border border-white text-white"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Photo URL</label>
                    <input
                        type="text"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full p-2 bg-black border border-white text-white"
                    />
                </div>
                <button
                    onClick={handleAddEvent}
                    className="w-full bg-black border border-white text-white py-2 px-4 hover:bg-gray-700 transition duration-200"
                >
                    Add Event
                </button>
            </div>
        </div>
    );
};

export default Admin;
