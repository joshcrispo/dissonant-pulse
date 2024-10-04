import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import QRModal from '../components/QRModal';
import { QRCodeSVG } from 'qrcode.react';

// Define the Event type
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

// Define the Ticket type
type Ticket = {
    createdAt: string;
    date: string;
    eventName: string;
    ticketID: string;
};

// Define the UserTicket type
type UserTicket = {
    eventName: string;
    tickets: Ticket[]; // An array of Ticket objects
};

const Tickets: React.FC = () => {
    const { user } = useContext(UserContext);
    const [eventsData, setEventsData] = useState<Event[]>([]);
    const [userTicketsData, setUserTicketsData] = useState<UserTicket[]>([]); // State to hold user tickets
    const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
    const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
    const [isModalOpen, setModalOpen] = useState(false);

    const fetchUserData = async () => {
        if (user) {
            const userRef = doc(db, `users/${user.uid}`);
    
            try {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userTickets: UserTicket[] = userData.tickets || []; // Default to an empty array if tickets field is undefined
                    
                    // Store fetched user tickets in state
                    setUserTicketsData(userTickets);
                } else {
                    console.log("No such user document!");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            console.log("User is null.");
        }
    };    
    
    const fetchEventData = async () => {
        if (user && userTicketsData.length > 0) {
            const eventsRef = collection(db, 'events');
            const eventsQuery = query(eventsRef, where('eventName', 'in', userTicketsData.map(ticket => ticket.eventName)));

            const querySnapshot = await getDocs(eventsQuery);
            const events: Event[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                events.push({
                    id: doc.id,
                    eventName: data.eventName,
                    artists: data.artists,
                    startDate: (data.startDate as any).toDate(),
                    endDate: (data.endDate as any).toDate(),
                    photoURL: data.photoURL,
                    location: data.location,
                    club: data.club,
                });
            });

            setEventsData(events); // Set the array of events
        } else {
            console.log('User is null or has no tickets.');
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);
    
    useEffect(() => {
        fetchEventData();
    }, [userTicketsData]); // Fetch event data when user tickets data changes

    const handleShowTickets = (tickets: Ticket[]) => {
        setSelectedTickets(tickets);
        setCurrentTicketIndex(0);
        setModalOpen(true);
    };

    const nextTicket = () => {
        setCurrentTicketIndex((prevIndex) => (prevIndex + 1) % selectedTickets.length);
    };

    const prevTicket = () => {
        setCurrentTicketIndex((prevIndex) => (prevIndex - 1 + selectedTickets.length) % selectedTickets.length);
    };

    // Separate events into upcoming and past
    const now = new Date();
    const upcomingEvents = eventsData.filter(event => event.startDate > now);
    const pastEvents = eventsData.filter(event => event.startDate <= now);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - My Tickets</title>
            </Helmet>
            <section className="mx-auto text-center md:text-start w-9/12 max-w-9xl">
                <h1 className="my-12 text-6xl font-bold">MY TICKETS</h1>
                <div className="w-full">
                    {/* Upcoming Events */}
                    {upcomingEvents.map(event => {
                        const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                        const userTickets = userTicketsData.find(ticketData => ticketData.eventName === event.eventName)?.tickets || [];

                        return (
                            <div
                                key={event.id}
                                className="bg-black text-white shadow-lg mb-6 flex flex-col sm:flex-row gap-y-0 sm:gap-8"
                            >
                                {event.photoURL && (
                                    <img
                                        src={event.photoURL}
                                        alt={`${event.eventName} cover`}
                                        className="w-full sm:w-1/2 h-44 object-cover mb-4 sm:mb-0"
                                    />
                                )}
                                <div className="text-start flex-1 w-full sm:w-1/2 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">{event.eventName}</h2>
                                        <p className="font-bold mb-1">{event.club}</p>
                                        <p className="mb-1">{startTime} - {endTime}</p>
                                        {userTickets.length > 0 && (
                                            <button
                                                className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 mt-2 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                                onClick={() => handleShowTickets(userTickets)} // Show all tickets for this event
                                            >
                                                Show Tickets
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Conditional Divider for Past Events */}
                    {pastEvents.length > 0 && <hr className="my-8 border-gray-600" />}

                    {/* Past Events */}
                    {pastEvents.map(event => {
                        const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                        const userTickets = userTicketsData.find(ticketData => ticketData.eventName === event.eventName)?.tickets || [];

                        return (
                            <div
                                key={event.id}
                                className="bg-black text-white shadow-lg mb-6 flex flex-col sm:flex-row gap-y-0 sm:gap-8"
                            >
                                {event.photoURL && (
                                    <img
                                        src={event.photoURL}
                                        alt={`${event.eventName} cover`}
                                        className="w-full sm:w-1/2 h-44 object-cover mb-4 sm:mb-0"
                                    />
                                )}
                                <div className="text-start flex-1 w-full sm:w-1/2 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-bold mb-2">{event.eventName}</h2>
                                        <p className="font-bold mb-1">{event.club}</p>
                                        <p className="mb-1">{startTime} - {endTime}</p>
                                        {userTickets.length > 0 && (
                                            <button
                                                className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 mt-2 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                                onClick={() => handleShowTickets(userTickets)} // Show all tickets for this event
                                            >
                                                Show Tickets
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}


                    {/* QRModal for displaying the QR code */}
                    <QRModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                        {selectedTickets.length > 0 && (
                            <div className="flex flex-col items-center">
                                <h2 className="text-2xl font-bold text-black mb-4">
                                    Ticket #{currentTicketIndex + 1} - {selectedTickets[currentTicketIndex].eventName}
                                </h2>
                                <div className="p-4 bg-white shadow-md">
                                    <QRCodeSVG value={selectedTickets[currentTicketIndex].ticketID} size={256}/>
                                </div>
                                <div className="flex mt-16">
                                <button
                                    className="w-32 px-4 py-2 mx-2 border border-gray-600 text-black"
                                    onClick={prevTicket}
                                >
                                    Previous
                                </button>
                                <button
                                    className="w-32 px-4 py-2 mx-2 border border-gray-600 text-black"
                                    onClick={nextTicket}
                                >
                                    Next
                                </button>
                                </div>
                            </div>
                        )}
                    </QRModal>
                </div>
            </section>
        </div>
    );
};

export default Tickets;
