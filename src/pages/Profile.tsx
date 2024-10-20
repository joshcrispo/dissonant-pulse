import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { UserContext } from '../context/UserContext';
import { FaSignOutAlt, FaCamera } from 'react-icons/fa';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { updateDoc, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';

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

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading, setUser } = useContext(UserContext);
    const [hover, setHover] = useState(false);
    const [eventsData, setEventsData] = useState<{ [key: string]: Event | null }>({});

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchEventData = async () => {
            if (user && user.tickets && user.tickets.length > 0) {
                const eventsRef = collection(db, 'events');
                const eventsQuery = query(eventsRef, where('eventName', 'in', user.tickets.map(ticket => ticket.eventName)));
                
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

                const upcomingEvents = events.filter(event => event.startDate > new Date());
                const closestEvent = upcomingEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

                if (closestEvent) {
                    setEventsData({ [closestEvent.eventName]: closestEvent });
                } else {
                    setEventsData({});
                }        
            }
        };
        fetchEventData();
    }, [user]);

    const handleSignOut = () => {
        setUser(null);
        navigate('/login');
    };
    
    const handleShowAllTickets = () => {
        navigate('/tickets');
    };
    
    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && user) {
            const file = event.target.files[0];
            const storageRef = ref(storage, `profilePhotos/${user.uid}`);

            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { photoURL });

            setUser((prevUser) => (prevUser ? { ...prevUser, photoURL } : prevUser));
        }
    };

    const { firstName, email, role, photoURL, purchase_tracker, tickets } = user || {};
    const totalPurchases = purchase_tracker || 0;
    const rewardThreshold = 5;
    const hasReward = totalPurchases >= rewardThreshold;
    const progressBarWidth = hasReward ? '100%' : `${(totalPurchases / rewardThreshold) * 100}%`;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
            <Helmet>
                <title>User Profile</title>
            </Helmet>
    
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-7xl mt-4">
                {/* User Information Section */}
                <div className="bg-black p-6 flex flex-col items-center justify-center">
                    <div
                        className="relative h-72 w-72 rounded-full mb-4 border-2 border-gray-600 overflow-hidden"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <img 
                            src={photoURL || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
    
                        {hover && (
                            <div
                                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer"
                                onClick={() => document.getElementById('fileInput')?.click()}
                            >
                                <FaCamera className="text-white text-5xl" />
                            </div>
                        )}
    
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>
    
                    <h2 className="text-2xl font-semibold text-center">{firstName || 'Anonymous'}</h2>
                    <p className="text-lg text-center">Email: {email || 'Not Available'}</p>
                    <p className="text-lg text-center">Role: {role || 'User'}</p>
                </div>
    
                {/* My Tickets Section */}
                <div className="bg-black p-6 flex flex-col">
                    <div className="mb-2">
                        <h2 className="text-3xl font-bold mb-4">UPCOMING EVENT</h2>
                        {tickets && tickets.length > 0 && eventsData && Object.keys(eventsData).length > 0 ? (
                            <ul className="list-disc mb-4 text-lg">
                                {tickets.map((ticket) => {
                                    const event = eventsData[ticket.eventName];
                                    return event ? (
                                        <li key={ticket.ticketID} className="flex mb-4 cursor-pointer" onClick={() => console.log(`Showing tickets for ${ticket.eventName}`)}>
                                            <div className="flex p-4 w-full items-center hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105">
                                                {event.photoURL && (
                                                    <img src={event.photoURL} alt={ticket.eventName} className="h-24 w-24 object-cover mr-4" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-semibold">{ticket.eventName}</span>
                                                    <span className="text-lg">{event.club}</span>
                                                    <span className="text-lg">
                                                        {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ) : null;
                                })}
                            </ul>
                        ) : (
                            <p className="text-lg mb-4">You have no upcoming tickets.</p>
                        )}
                        <button 
                            className="w-full bg-black text-white border border-gray-600 text-2xl p-2 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={handleShowAllTickets}
                        >
                            SHOW ALL TICKETS
                        </button>
                    </div>
    
                    {/* Purchase Tracker Section */}
                    <div className="bg-black py-4 mt-1">
                        <h2 className="text-3xl font-bold mb-4">REWARD TRACKER</h2>
                        <div className="w-full bg-gray-700 rounded h-8 relative">
                            <div
                                className={`bg-white h-full rounded ${totalPurchases >= rewardThreshold ? 'text-center flex items-center justify-center' : ''}`}
                                style={{ width: progressBarWidth }}
                            >
                                {totalPurchases >= rewardThreshold && (
                                    <span className="text-black font-semibold">YOU HAVE A REWARD</span>
                                )}
                            </div>
                        </div>
                        <p className="text-md mt-2">
                            {totalPurchases < rewardThreshold ? `${totalPurchases}/${rewardThreshold} Purchases for next discount!` : null}
                        </p>
                        <button 
                            className="w-full bg-black text-white border border-gray-600 text-2xl p-2 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 mt-4"
                            onClick={() => console.log("Claim Discount")}
                            disabled={totalPurchases < rewardThreshold}
                        >
                            CLAIM DISCOUNT
                        </button>
                    </div>
                </div>
    
                {/* Account Settings Section */}
                <div className="bg-black p-6 flex flex-col h-full">
                    <h2 className="text-3xl font-bold mb-4">ACCOUNT SETTINGS</h2>
                    
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Update Email
                    </button>
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Notification Preferences
                    </button>
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Privacy Settings
                    </button>
                    <button className="flex hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Manage Payment Methods
                    </button>
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Change Password
                    </button>
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <FaSignOutAlt className="h-5 w-5 mr-2 ml-1" onClick={handleSignOut}/>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
