import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type Event = {
    id: string;
    eventName: string;
    artists: string[];
    startDate: Date;
    endDate: Date;
    photoURL?: string;
    location?: string;
    club?: string;
};

const Events: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);

    const fetchEvents = async () => {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                eventName: data.eventName,
                artists: data.artists,
                startDate: (data.startDate as any).toDate(),
                endDate: (data.endDate as any).toDate(),
                photoURL: data.photoURL,
                location: data.location,
                club: data.club,
            };
        });
        setEvents(eventsList);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - Events</title>
            </Helmet>
            <section className="mx-auto text-center w-4/5 max-w-4xl">
                <h1 className="my-16 text-4xl font-bold">Upcoming Events</h1>
                <div className="space-y-4 w-full">
                    {events.map(event => {
                        // Formatting start and end times
                        const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        
                        return (
                            <div key={event.id} className="flex bg-black text-white shadow-lg" style={{ height: '42vh' }}>
                                {event.photoURL && (
                                    <img src={event.photoURL} alt={`${event.eventName} cover`} className="w-3/5 h-4/5 object-cover mr-10" />
                                )}
                                <div className="text-start flex-1 w-2/5 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-4xl font-bold mb-2">{event.eventName}</h2>
                                        <p className="text-2xl font-bold mb-1">{event.artists.join(', ')}</p>
                                        <p className="font-bold mb-1">{event.club}, {event.location}</p>
                                        <p className="mb-1">{startTime} - {endTime}</p>
                                        <button className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105" onClick={() => console.log(`View event ${event.id}`)}>View Event</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Events;
    