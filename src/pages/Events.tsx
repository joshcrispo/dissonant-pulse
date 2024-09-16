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
            <section className="mt-40 mx-auto text-center max-w-3xl">
                <h1 className="my-16 text-4xl font-bold">Upcoming Events</h1>
                <ul className="my-8 space-y-2">
                    {events.map(event => (
                        <li key={event.id} className="my-4 text-gray-400">
                            {event.eventName}: {event.startDate.toLocaleDateString()} @ {event.artists.join(', ')}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default Events;
