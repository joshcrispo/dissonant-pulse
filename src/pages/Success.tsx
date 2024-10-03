import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getFirestore, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Ticket, UserContext } from '../context/UserContext'; // Ensure this path is correct

// Define an interface for Event Tickets
interface EventTickets {
    eventName: string;  // The name of the event
    tickets: Ticket[];   // Array of tickets associated with the event
}

const Success: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    
    // Use UserContext
    const { user } = useContext(UserContext);
    const auth = getAuth();
    const db = getFirestore();

    // Extract necessary information from location or search params
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

    // Function to generate unique tickets for each event purchase
    const generateUniqueTickets = (eventName: string, quantity: number): Ticket[] => {
        const tickets: Ticket[] = [];
        for (let i = 0; i < quantity; i++) {
            const ticketID = `${eventName}-${uuidv4()}`;
            tickets.push({
                ticketID: ticketID,
                createdAt: new Date().toISOString(),
                eventName: eventName,
                date: new Date().toISOString(), // Adjust this if needed
            });
        }
        return tickets;
    };

    // Store the generated tickets in the user's profile in Firestore
    useEffect(() => {
        const userUid = user?.uid; // Safely get the user UID
        if (userUid && itemType === 'event') {
            const userDocRef = doc(db, 'users', userUid);

            getDoc(userDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const currentData = docSnap.data();
                        const currentTickets: EventTickets[] = currentData?.tickets || [];
                        const currentPurchaseTracker = currentData?.purchase_tracker || 0;

                        // Generate unique tickets for this event
                        const newTickets = generateUniqueTickets(itemName, quantity);

                        // Check if the event already exists in the user's tickets
                        const eventIndex = currentTickets.findIndex(event => event.eventName === itemName);
                        let updatedTickets: EventTickets[];

                        if (eventIndex !== -1) {
                            const existingEvent = currentTickets[eventIndex];
                            updatedTickets = [...currentTickets];
                            updatedTickets[eventIndex] = {
                                ...existingEvent,
                                tickets: [...existingEvent.tickets, ...newTickets],  // Append new tickets
                            };
                        } else {
                            const newEvent: EventTickets = {
                                eventName: itemName,
                                tickets: newTickets,  // Add new tickets under the new event
                            };
                            updatedTickets = [...currentTickets, newEvent];
                        }

                        // Update the Firestore document
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
                <div className="flex justify-center">
                    <button
                        className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 mt-6 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={handleGoBack}
                    >
                        ← Back to {itemType === 'event' ? 'Events' : 'Shop'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Success;
