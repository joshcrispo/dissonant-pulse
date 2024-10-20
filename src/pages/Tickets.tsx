import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import QRModal from '../components/QRModal';
import { QRCodeSVG } from 'qrcode.react';

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

type Ticket = {
    createdAt: string;
    date: string;
    eventName: string;
    ticketID: string;
};

type UserTicket = {
    eventName: string;
    tickets: Ticket[];
};

const Tickets: React.FC = () => {
    const { user } = useContext(UserContext);
    const [eventsData, setEventsData] = useState<Event[]>([]);
    const [userTicketsData, setUserTicketsData] = useState<UserTicket[]>([]);
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
                    const userTickets: UserTicket[] = userData.tickets || []; 
                    
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

            setEventsData(events);
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
    }, [userTicketsData]);

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
                                                onClick={() => handleShowTickets(userTickets)}
                                            >
                                                Show Tickets
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {pastEvents.length > 0 && <hr className="my-8 border-gray-600" />}

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
                                                onClick={() => handleShowTickets(userTickets)}
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
                        <div className="flex flex-col lg:flex-row items-start lg:justify-between max-w-4xl max-h-screen overflow-auto">
                        {/* Left Section: Event Details (Visible only for large screens) */}
                        {eventsData.length > 0 && (
                            <div className="hidden lg:block lg:w-full lg:pr-4">
                            {eventsData
                                .filter((event) => event.eventName === selectedTickets[currentTicketIndex].eventName)
                                .map((event) => {
                                    const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                    const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                    return (
                                        <div key={event.id} className="">
                                            <h2 className="text-8xl text-black font-bold mb-2">{event.eventName}</h2>
                                            <p className="text-3xl text-black mb-4">{event.artists.join(', ')}</p>

                                            <svg className="my-6 w-full h-8" viewBox="0 0 200 24" preserveAspectRatio="none">
                                                <path
                                                    className="wave-path wave1"
                                                    d="M0 10 Q 20 0, 40 10 T 80 10 T 120 10 T 160 10 T 200 10"
                                                    fill="transparent"
                                                    stroke="#000000"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    className="wave-path wave2"
                                                    d="M0 15 Q 20 5, 40 15 T 80 15 T 120 15 T 160 15 T 200 15"
                                                    fill="transparent"
                                                    stroke="#000000"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                            
                                            <p className="text-black font-semibold">{event.club}</p>
                                            <p className="text-black font-semibold">{startTime} - {endTime}</p>
                                            <p className="text-black font-semibold">{event.location}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Right Section: Ticket Details and QR Code */}
                        <div className="flex flex-col items-center lg:w-1/2 lg:pl-24">
                            <h2 className="text-2xl font-bold text-black mb-4">
                            Ticket #{currentTicketIndex + 1} - {selectedTickets[currentTicketIndex].eventName}
                            </h2>
                            <div className="p-4 bg-white shadow-md">
                            <QRCodeSVG value={selectedTickets[currentTicketIndex].ticketID} size={256} />
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex mt-4">
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
                        </div>
                    )}
                    </QRModal>
                </div>
            </section>
        </div>
    );
};

export default Tickets;
