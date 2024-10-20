import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getFirestore, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Ticket, UserContext } from '../context/UserContext'; // Ensure this path is correct

interface EventTickets {
    eventName: string; 
    tickets: Ticket[];
}

const Success: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    
    const { user } = useContext(UserContext);
    const auth = getAuth();
    const db = getFirestore();

    const handleShowAllTickets = () => {
        navigate('/tickets');
    };


    const itemType = location.state?.itemType || searchParams.get('itemType') || 'event';
    const itemName = location.state?.itemName || searchParams.get('itemName') || '';
    const quantity = location.state?.quantity || Number(searchParams.get('quantity')) || 1;

    const handleGoBack = () => {
        if (itemType === 'event') {
            navigate('/events');
        } else {
            navigate('/shop');
        }
    };

    const generateUniqueTickets = (eventName: string, quantity: number): Ticket[] => {
        const tickets: Ticket[] = [];
        for (let i = 0; i < quantity; i++) {
            const ticketID = `${eventName}-${uuidv4()}`;
            tickets.push({
                ticketID: ticketID,
                createdAt: new Date().toISOString(),
                eventName: eventName,
                date: new Date().toISOString(),
            });
        }
        return tickets;
    };

    useEffect(() => {
        const userUid = user?.uid;
        if (userUid && itemType === 'event') {
            const userDocRef = doc(db, 'users', userUid);

            getDoc(userDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const currentData = docSnap.data();
                        const currentTickets: EventTickets[] = currentData?.tickets || [];
                        const currentPurchaseTracker = currentData?.purchase_tracker || 0;

                        const newTickets = generateUniqueTickets(itemName, quantity);

                        const eventIndex = currentTickets.findIndex(event => event.eventName === itemName);
                        let updatedTickets: EventTickets[];

                        if (eventIndex !== -1) {
                            const existingEvent = currentTickets[eventIndex];
                            updatedTickets = [...currentTickets];
                            updatedTickets[eventIndex] = {
                                ...existingEvent,
                                tickets: [...existingEvent.tickets, ...newTickets],
                            };
                        } else {
                            const newEvent: EventTickets = {
                                eventName: itemName,
                                tickets: newTickets,
                            };
                            updatedTickets = [...currentTickets, newEvent];
                        }

                        updateDoc(userDocRef, {
                            tickets: updatedTickets,
                            purchase_tracker: currentPurchaseTracker + quantity,
                        })
                        .then(() => {
                            setLoading(false);
                            console.log("Document successfully updated!");
                        })
                        .catch((error) => {
                            console.error("Error updating document: ", error);
                        });
                    } else {
                        console.log("Document does not exist.");
                        setLoading(false);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching document: ", error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
            console.log("User not found or item type is not event.");
        }
    }, [itemType, itemName, quantity, user]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>{`Thank You - ${itemName}`}</title>
            </Helmet>
            <div className='mt-48 flex items-center'></div>
            <div className='w-9/12 max-w-9xl'>
                <h1 className="text-4xl text-center font-bold mb-6">Thank you for your purchase!</h1>
                {loading ? (
                    <p className="text-2xl text-center mb-10">Processing your purchase...</p>
                ) : (
                    <p className="text-2xl text-center mb-10">
                        {`You have successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''} for`} <span className="font-bold">{itemName}</span>.
                    </p>
                )}
                <div className="flex justify-center space-x-4 mt-6">
                    {itemType === 'event' ? (
                        <>
                            <button
                                className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={handleGoBack}
                            >
                                ← Back to Events
                            </button>
                            <button
                                className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={handleShowAllTickets}
                            >
                                Go to My Tickets
                            </button>
                        </>
                    ) : (
                        <button
                            className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={handleGoBack}
                        >
                            ← Back to Shop
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Success;
