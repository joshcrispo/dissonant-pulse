import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../utils';


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
    const [events, setEvents] = useState<{ upcoming: Event[]; past: Event[] }>({ upcoming: [], past: [] });
    const [visiblePastEvents, setVisiblePastEvents] = useState<Event[]>([]);
    const [pastEventsCount, setPastEventsCount] = useState(3);

    const navigate = useNavigate();

    const handleViewEvent = (eventName: string) => {
        const slug = slugify(eventName)
        navigate(`/event/${slug}`);
    };

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
    
        const now = new Date();
        const upcomingEvents = eventsList.filter(event => event.startDate > now).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        const pastEvents = eventsList.filter(event => event.endDate < now).sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
    
        setEvents({
            upcoming: upcomingEvents,
            past: pastEvents,
        });
    };
    
    useEffect(() => {
        fetchEvents();
    }, []);
    
    useEffect(() => {
        setVisiblePastEvents(events.past.slice(0, pastEventsCount));
    }, [events, pastEventsCount]);
    
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - Events</title>
            </Helmet>
            <section className="mx-auto text-center w-9/12 max-w-9xl">
                <h1 className="my-16 text-4xl font-bold">UPCOMING EVENTS</h1>
                <div className="w-full">
                    {events.upcoming.map(event => {
                        const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
                        return (
                            <div
                                key={event.id}
                                className="bg-black text-white shadow-lg mb-6 flex flex-col sm:flex-row gap-y-0 sm:gap-8"
                            >
                                {event.photoURL && (
                                    <img
                                        src={event.photoURL}
                                        alt={`${event.eventName} cover`}
                                        className="w-full sm:w-1/2 h-64 object-cover mb-4 sm:mb-0"
                                    />
                                )}
                                <div className="text-start flex-1 w-full sm:w-1/2 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">{event.eventName}</h2>
                                        <p className="text-xl sm:text-2xl font-bold mb-1">{event.artists.join(', ')}</p>
                                        <p className="font-bold mb-1">{event.club}, {event.location}</p>
                                        <p className="mb-1">{startTime} - {endTime}</p>
                                        <button
                                            className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 mt-6 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                            onClick={() => handleViewEvent(event.eventName)}
                                        >
                                            View Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
    
                {events.past.length > 0 && (
                    <>
                        <hr className="my-8 border-gray-600" />
                    </>
                )}
    
                <div className="w-full">
                    {visiblePastEvents.map(event => {
                        const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
                        return (
                            <div
                                key={event.id}
                                className="bg-black text-white shadow-lg mb-6 flex flex-col sm:flex-row gap-y-0 sm:gap-8"
                            >
                                {event.photoURL && (
                                    <img
                                        src={event.photoURL}
                                        alt={`${event.eventName} cover`}
                                        className="w-full sm:w-1/2 h-64 object-cover mb-4 sm:mb-0"
                                    />
                                )}
                                <div className="text-start flex-1 w-full sm:w-1/2 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">{event.eventName}</h2>
                                        <p className="text-xl sm:text-2xl font-bold mb-1">{event.artists.join(', ')}</p>
                                        <p className="font-bold mb-1">{event.club}, {event.location}</p>
                                        <p className="mb-1">{startTime} - {endTime}</p>
                                        <button
                                            className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 mt-6 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                            onClick={() => handleViewEvent(event.eventName)}
                                        >
                                            View Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {events.past.length > pastEventsCount && (
                        <button
                            className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 mt-6 mb-4 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={() => setPastEventsCount(pastEventsCount + 3)}
                        >
                            Show More
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
};    

export default Events;
    