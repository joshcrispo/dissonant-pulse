import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { UserContext } from '../context/UserContext'; // Adjust the path as necessary
import { FaSignOutAlt } from 'react-icons/fa';
import { UserIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/solid'; // Import necessary icons

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext); // Access user context

    // Check if the user is logged in
    useEffect(() => {
        if (!user) {
            navigate('/login'); // Redirect to login page if no user is logged in
        }
    }, [user, navigate]); // Run effect whenever user changes

    const handleSignOut = () => {
        console.log("User logged out");
        setUser(null); // Reset user context
        navigate('/login'); // Redirect to login page after logout
    };

    // Placeholder for total purchases and rewards
    const totalPurchases = 13; // Total purchases (this should come from your data logic)
    const rewardThreshold = 5; // Purchases required for a discount
    const currentRewardLevel = totalPurchases % rewardThreshold; // Current reward progress
    const filledBars = Math.floor(totalPurchases / rewardThreshold); // Full rewards claimed
    const progressBarWidth = `${(currentRewardLevel / rewardThreshold) * 100}%`;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
            <Helmet>
                <title>User Profile</title>
            </Helmet>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-7xl mt-16">
                {/* User Information Section */}
                <div className="bg-black p-6 flex flex-col items-center justify-center">
                    <img 
                        src="profile-pic-url" // Placeholder for profile picture
                        alt="Profile"
                        className="h-72 w-72 rounded-full mb-4 border-2 border-gray-600"
                    />
                    <h2 className="text-2xl font-semibold text-center">{user?.username || 'Anonymous'}</h2>
                    <p className="text-lg text-center">Email: {user?.email || 'Not Available'}</p>
                    <p className="text-lg text-center">Role: {user?.role || 'User'}</p>
                </div>

                {/* My Tickets Section */}
                <div className="bg-black p-6 flex flex-col">
                    {/* Upcoming Event Section */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-semibold mb-4">
                            UPCOMING EVENT
                        </h2>
                        <ul className="list-disc pl-5 mb-4 text-lg">
                            <li>Event 1 - Date</li>
                            <li>Event 2 - Date</li>
                            <li>Event 3 - Date</li>
                        </ul>
                        <button 
                            className="w-full bg-black text-white border border-gray-600 text-2xl p-2 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={() => console.log("Show Tickets")}
                        >
                            SHOW ALL TICKETS
                        </button>
                    </div>

                    {/* Purchase Tracker Section */}
                    <div className="bg-black py-4 mt-1">
                        <h2 className="text-3xl font-semibold mb-2">Purchase Tracker</h2>
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
                <div className="bg-black p-6 flex flex-col h-full"> {/* Make sure the container has full height */}
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

                    {/* Logout Button at the bottom */}
                    <div className='mt-6'> {/* Optional wrapper to push it down */}
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
