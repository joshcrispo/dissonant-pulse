import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { UserContext } from '../context/UserContext'; // Adjust the path as necessary
import { FaSignOutAlt, FaCamera } from 'react-icons/fa';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/solid'; // Import necessary icons
import { updateDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext); // Access user context
    const [hover, setHover] = useState(false); // Track hover state for photo container

    // Check if the user is logged in
    useEffect(() => {
        if (!user) {
            navigate('/login'); // Redirect to login page if no user is logged in
        }
    }, [user, navigate]);

    // Handle sign out
    const handleSignOut = () => {
        setUser(null); // Reset user context
        navigate('/login'); // Redirect to login page after logout
    };

    // Handle file change for profile photo
    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && user) {
            const file = event.target.files[0];
            const storageRef = ref(storage, `profilePhotos/${user.uid}`);

            // Upload the file to Firebase Storage
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            // Update the user's profile photo in Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { photoURL });

            // Update the user context with the new photo URL
            setUser((prevUser) => (prevUser ? { ...prevUser, photoURL } : prevUser));
        }
    };

    // Extract user properties
    const { firstName, email, role, photoURL, purchase_tracker, tickets } = user || {};
    const totalPurchases = purchase_tracker || 0; // Total purchases from user data
    const rewardThreshold = 5; // Purchases required for a discount
    const currentRewardLevel = totalPurchases % rewardThreshold; // Current reward progress
    const progressBarWidth = `${(currentRewardLevel / rewardThreshold) * 100}%`;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
            <Helmet>
                <title>User Profile</title>
            </Helmet>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-7xl mt-16">
                {/* User Information Section */}
                <div className="bg-black p-6 flex flex-col items-center justify-center">
                    {/* Profile Picture Container */}
                    <div
                        className="relative h-72 w-72 rounded-full mb-4 border-2 border-gray-600 overflow-hidden"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        {/* Profile Picture */}
                        <img 
                            src={photoURL || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay for Camera Icon on Hover */}
                        {hover && (
                            <div
                                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer"
                                onClick={() => document.getElementById('fileInput')?.click()}
                            >
                                <FaCamera className="text-white text-5xl" />
                            </div>
                        )}

                        {/* Hidden File Input for Photo Upload */}
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>

                    {/* User Details */}
                    <h2 className="text-2xl font-semibold text-center">{firstName || 'Anonymous'}</h2>
                    <p className="text-lg text-center">Email: {email || 'Not Available'}</p>
                    <p className="text-lg text-center">Role: {role || 'User'}</p>
                </div>

                {/* My Tickets Section */}
                <div className="bg-black p-6 flex flex-col">
                    {/* Upcoming Event Section */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold mb-4">UPCOMING EVENT</h2>
                        {tickets && tickets.length > 0 ? (
                            <ul className="list-disc pl-5 mb-4 text-lg">
                                {tickets.map((ticket, index) => (
                                    <li key={index}>{ticket.eventName} - {ticket.date}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-lg mb-4">You have no upcoming tickets.</p>
                        )}
                        <button 
                            className="w-full bg-black text-white border border-gray-600 text-2xl p-2 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={() => console.log("Show Tickets")}
                        >
                            SHOW ALL TICKETS
                        </button>
                    </div>

                    {/* Purchase Tracker Section */}
                    <div className="bg-black py-4 mt-1">
                        <h2 className="text-3xl font-semibold mb-2">Reward Tracker</h2>
                        <div className="w-full bg-gray-700 rounded h-4 relative">
                            <div
                                className="bg-white h-full rounded"
                                style={{ width: progressBarWidth }}
                            />
                        </div>
                        <p className="text-md mt-2">
                            {currentRewardLevel}/{rewardThreshold} Purchases for next discount!
                        </p>
                        <button 
                            className="w-full bg-black text-white border border-gray-600 text-2xl p-2 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 mt-4"
                            onClick={() => console.log("Claim Discount")}
                        >
                            CLAIM DISCOUNT
                        </button>
                    </div>
                </div>

                {/* Account Settings Section */}
                <div className="bg-black p-6 flex flex-col h-full">
                    <h2 className="text-3xl font-semibold mb-4">ACCOUNT SETTINGS</h2>
                    
                    {/* Profile Settings */}
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Update Email
                    </button>
                    {/* Notification Preferences */}
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Notification Preferences
                    </button>

                    {/* Privacy Settings */}
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Privacy Settings
                    </button>

                    {/* Payment Methods */}
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Manage Payment Methods
                    </button>

                    {/* Existing Options */}
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Change Password
                    </button>
                    <button className="flex items-center hover:text-gray-400 transition duration-300 ease-in-out mb-2">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Delete Account
                    </button>

                    {/* Logout Button */}
                    <div className='mt-6'>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-600 text-white border border-gray-600 text-2xl p-2 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full"
                        >
                            <FaSignOutAlt className="h-5 w-5 inline-block mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
