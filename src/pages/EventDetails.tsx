import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { slugify } from '../utils';
import { Helmet } from 'react-helmet';
import { loadStripe } from '@stripe/stripe-js';
import { auth } from '../firebase'; // Make sure to import auth from your firebase configuration

const stripePromise = loadStripe('pk_test_51Q5GPFFokBZMd6H1Y5gRZRjgxymtpkidvkXawPrY9nGgibQMEFDM71WTZWyUjqU2Q9dxVsGfalEYI29Ahpg7qnxN006lFJR48h');

type Event = {
    id: string;
    eventName: string;
    artists: string[];
    startDate: Date;
    endDate: Date;
    photoURL?: string;
    location?: string;
    club?: string;
    bio?: string;
    artistImages?: string[];
    ticketPrice?: number;
};

const EventDetail: React.FC = () => {
    const { title } = useParams<{ title: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [user, setUser] = useState<any>(null); // User state
    const navigate = useNavigate();

    useEffect(() => {
        // Get the currently logged in user
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser); // Update the user state
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    useEffect(() => {
        if (!title) {
            navigate('/events'); // Redirect if title is undefined
            return;
        }

        const fetchEvent = async () => {
            const eventsRef = collection(db, 'events');
            const querySnapshot = await getDocs(eventsRef);
            const eventsList = querySnapshot.docs.map(doc => {
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
                    bio: data.bio,
                    artistImages: data.artistImages,
                    ticketPrice: data.ticketPrice,
                };
            });

            const matchedEvent = eventsList.find(event => slugify(event.eventName) === title);
            if (matchedEvent) {
                setEvent(matchedEvent);
            } else {
                console.error('Event not found');
                navigate('/events'); // Redirect if event not found
            }
        };

        fetchEvent();
    }, [title, navigate]);

    const handleBuyItem = async () => {
        if (!event || !user) return; // Ensure event and user are defined

        const stripe = await stripePromise;
        const response = await fetch('http://localhost:4242/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: event.eventName,
                price: event.ticketPrice,
                imageUrl: event.photoURL,
                type: 'event',
                userId: user.uid, // Use user ID here
            }),
        });

        const session = await response.json();

        // Redirect to Stripe Checkout
        const { error } = await stripe!.redirectToCheckout({ sessionId: session.id });
        if (error) {
            console.error('Stripe checkout error:', error.message);
        }
    };

    if (!event) {
        return <div>Loading...</div>;
    }

    // Formatting start and end times
    const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - { event.eventName }</title>
            </Helmet>
            <div className="container mx-auto w-4/5 max-w-4xl my-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
                <img src={event.photoURL} alt={event.eventName} className="w-auto h-96 object-cover" />
                <div className="flex flex-col justify-center">
                    <h1 className="text-5xl font-bold mb-4">{event.eventName}</h1>
                    <p className="text-3xl mb-6">{event.artists.join(', ')}</p>
                    <p className="text-xl mb-2">{event.club} - {event.location}</p>
                    <p className="text-xl mb-2">{startTime} - {endTime}</p>
                    <button 
                        className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={handleBuyItem}
                    >
                        Buy Ticket - €{event.ticketPrice}
                    </button>
                </div>
            </div>
            {event.bio && (
                <div className="w-4/5 max-w-4xl mb-10">
                    <h2 className="text-3xl font-bold mb-4">BIOGRAPHY</h2>
                    <p className="text-xl whitespace-pre-line">{event.bio}</p>
                </div>
            )}
            {event.artistImages && event.artistImages.length > 0 && (
                <div className="w-4/5 max-w-4xl mb-10">
                    <h2 className="text-3xl font-bold mb-4">ARTIST SPOTLIGHT</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {event.artistImages.map((image, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="w-full h-80 overflow-hidden">
                                    <img src={image} alt={`Artist ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                                <p className="text-xl mt-2">{event.artists[index]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );      
};

export default EventDetail;
