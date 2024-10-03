import React, { Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Link } from 'react-router-dom';
import Model from '../components/Model';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { slugify } from '../utils';
import DissonantPulseLogo from '../assets/DP.png';
import '../App.css';

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

const Home: React.FC = () => {
    const [nextEvent, setNextEvent] = useState<Event | null>(null);
    const navigate = useNavigate();

    const handleViewEvent = (eventName: string) => {
        const slug = slugify(eventName);
        navigate(`/event/${slug}`);
    };

    const fetchNextEvent = async () => {
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
        const upcomingEvents = eventsList
            .filter(event => event.startDate > now)
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        if (upcomingEvents.length > 0) {
            setNextEvent(upcomingEvents[0]);
        } else {
            setNextEvent(null);
        }
    };

    useEffect(() => {
        fetchNextEvent().catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - Home</title>
            </Helmet>
            <div className='mx-auto text-center w-9/12 max-w-9xl'>
                {/* 3D Section */}
                <div className="w-full h-96 mt-8">
                    <Canvas style={{ background: 'transparent' }} gl={{ alpha: true }}>
                        <ambientLight />
                        <pointLight position={[10, 10, 10]} />
                        <Suspense fallback={null}>
                            <Model />
                        </Suspense>
                        <PerspectiveCamera makeDefault position={[0, -100, 1000]} fov={55} />
                    </Canvas>
                </div>
                <h1 className="mx-auto mb-8 lg:text-6xl text-5xl font-bold">DISSONANT PULSE</h1>
                <p className="text-lg">Experience the latest and greatest in underground techno.</p>
                
               {/* Upcoming Events Section */}
                <section className="h-screen mt-16 mx-auto text-start max-w-9xl">
                    <div className="flex flex-col items-start h-full justify-center">
                        <h2 className="text-8xl font-bold underline my-8">
                            NEXT EVENT
                        </h2>
                        <div 
                            className="w-full h-64 grid grid-cols-4 gap-4 my-6 cursor-pointer hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 border border-transparent hover:border-gray-600"
                            onClick={() => nextEvent && handleViewEvent(nextEvent.eventName)}
                        >
                            {/* Left side: Upcoming event details */}
                            <div className="col-span-3 flex flex-col justify-center items-start text-start p-8">
                                {nextEvent ? (
                                    <div>
                                        <h3 className="text-5xl font-bold">{nextEvent.eventName}</h3>
                                        <p className="mt-2 text-lg text-gray-400">{nextEvent.artists.join(', ')}</p>
                                        <p className="mt-1 text-sm text-gray-400">{nextEvent.club} - {nextEvent.location}</p>
                                        <p className="mt-1 text-sm text-gray-400">{nextEvent.startDate.toLocaleDateString()} at {nextEvent.startDate.toLocaleTimeString()}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No upcoming events at the moment.</p>
                                )}
                            </div>
                            {/* Right side: Event photo */}
                            <div className="col-span-1 flex flex-col justify-center items-center p-8 hidden md:flex">
                                {nextEvent?.photoURL && (
                                    <img
                                        src={nextEvent.photoURL}
                                        alt={nextEvent.eventName}
                                        className="w-full min-w-48 h-auto max-h-48 object-cover"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="w-full flex justify-center my-4">
                            <Link
                                to="/events"
                                className="bg-black text-white border border-gray-600 text-xl mt-8 p-2 w-full sm:w-auto text-center hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                GO TO EVENTS
                            </Link>
                        </div>
                    </div>
                </section>
                {/* Experience Section */}
                <section className="h-screen mx-auto text-center max-w-9xl">
                    <div className="flex flex-col items-center h-full">
                        <h2 className="text-6xl font-bold my-16">
                            <span className="pulse-animation inline-block">EXPERIENCE THE PULSE</span>
                        </h2>
                        <div className="w-1/1 h-64 grid grid-cols-4 gap-16">
                            {/* Left side: Shop */}
                            <div className="col-span-2 flex flex-col justify-center items-center  my-6 text-center border border-white hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105">
                                <Link
                                    to="/shop"
                                    className="bg-black text-white text-2xl  p-2 w-full sm:w-auto text-center"
                                    >   
                                    <img
                                        src={DissonantPulseLogo} 
                                        alt="Shop Image"
                                        className="w-full h-auto"
                                        style={{ width: '300px', height: '300px', objectFit: 'cover' }}
                                    />
                                    <p className="my-4">STORE</p>
                                </Link>

                            </div>
                            {/* Right side: Event photo */}
                            <div className="col-span-2 flex flex-col justify-center items-center my-6 text-center border border-white transition duration-300 ease-in-out transform hover:scale-105">
                                <Link
                                    to="/gallery"
                                    className="bg-black text-white text-2xl  p-2 w-full sm:w-auto text-center"
                                    >   
                                    <img
                                        src={DissonantPulseLogo} 
                                        alt="Shop Image"
                                        className="w-full h-auto"
                                        style={{ width: '300px', height: '300px', objectFit: 'cover' }}
                                    />
                                    <p className="my-4">GALLERY</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Home;
