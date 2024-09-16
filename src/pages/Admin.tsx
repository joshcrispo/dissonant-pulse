import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { v4 as uuid } from 'uuid';  // for unique image filenames

import {
    getDownloadURL,
    ref as storageRef,
    uploadBytes,
} from "firebase/storage";

type Event = {
    id: string;
    eventName: string;
    artists: string[];
    startDate: Date;
    endDate: Date;
    photoURL?: string;  // Add photoURL to Event type
};

const Admin: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventName, setEventName] = useState('');
    const [artists, setArtists] = useState<string[]>(['']);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [imageUpload, setImageUpload] = useState<File | null>(null);  // Adjust imageUpload type
    const [imagePreview, setImagePreview] = useState<string | null>(null);  // Image preview URL

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
                photoURL: data.photoURL  // fetch the photoURL
            };
        }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        setEvents(eventsList);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleAddArtist = () => {
        setArtists([...artists, '']);
    };

    const handleArtistChange = (index: number, value: string) => {
        const newArtists = [...artists];
        newArtists[index] = value;
        setArtists(newArtists);
    };

    // Upload file and get URL
    const uploadFile = async () => {
        if (imageUpload === null) {
            throw new Error("Please select an image");
        }

        const imageRef = storageRef(storage, `events/${uuid()}`);
        await uploadBytes(imageRef, imageUpload);
        return await getDownloadURL(imageRef);
    };

    const handleAddEvent = async () => {
        if (!eventName || !artists.length || !startDate || !endDate) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            let photoURL = "";
            if (imageUpload) {
                photoURL = await uploadFile();  // Upload the image and get the URL
            }

            const eventsCollection = collection(db, 'events');
            await addDoc(eventsCollection, {
                eventName,
                artists,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                photoURL,  // Save photo URL in Firestore
                createdAt: new Date(),
            });

            // Clear the form fields after submission
            setEventName('');
            setArtists(['']);
            setStartDate('');
            setEndDate('');
            setImageUpload(null);
            setImagePreview(null);  // Clear image preview
            setError('');
            setShowModal(false);
            fetchEvents(); // Fetch events again to update the list
        } catch (error) {
            console.error('Error adding event:', error);
            setError('Failed to add event.');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageUpload(file);
            setImagePreview(URL.createObjectURL(file));  // Set image preview
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'events', id));
            setEvents(events.filter(event => event.id !== id));
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Failed to delete event.');
        }
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setEventName(event.eventName);
        setArtists(event.artists);
        setStartDate(event.startDate.toISOString().substring(0, 16));
        setEndDate(event.endDate.toISOString().substring(0, 16));
        setImagePreview(event.photoURL || null);  // Show existing image if available
        setShowModal(true);
    };

    const handleUpdateEvent = async () => {
        if (!eventName || !artists.length || !startDate || !endDate) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const eventRef = doc(db, 'events', editingEvent!.id);
            await updateDoc(eventRef, {
                eventName,
                artists,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });

            setEvents(events.map(event =>
                event.id === editingEvent!.id
                    ? { ...event, eventName, artists, startDate: new Date(startDate), endDate: new Date(endDate) }
                    : event
            ));

            setEditingEvent(null);
            setEventName('');
            setArtists(['']);
            setStartDate('');
            setEndDate('');
            setError('');
            setShowModal(false);
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Failed to update event.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-4">Admin Page</h1>
            <button className="bg-black text-white p-2 border border-white rounded mb-4" onClick={() => setShowModal(true)}><FaPlus /></button>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-black text-white p-6 border border-gray-600 shadow-lg relative">
                        <span className="absolute top-2 right-2 text-xl cursor-pointer" onClick={() => setShowModal(false)}>×</span>
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event Name" />
                        {artists.map((artist, index) => (
                            <input key={index} className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="text" value={artist} onChange={(e) => handleArtistChange(index, e.target.value)} placeholder="Artist Name" />
                        ))}
                        <button className="bg-black text-white p-2 border border-gray-600 rounded mb-2" onClick={handleAddArtist}><FaPlus /></button>
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        
                        <label className="block mb-2">Event Image</label>
                        <button
                            className="bg-black text-white p-2 border border-gray-600 rounded mb-2"
                            onClick={() => document.getElementById('fileInput')?.click()}
                        >
                            {imagePreview ? 'Change Photo' : 'Add Photo'}
                        </button>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mt-2" />}

                        <button className="bg-black text-white p-2 border border-white" onClick={editingEvent ? handleUpdateEvent : handleAddEvent}>
                            {editingEvent ? 'Update Event' : 'Add Event'}
                        </button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                </div>
            )}
            <div className="space-y-4 w-full max-w-4xl">
                {events.map(event => (
                    <div key={event.id} className="bg-black text-white p-4 border border-gray-600 shadow-lg">
                        <h2 className="text-2xl font-bold">{event.eventName}</h2>
                        <p className="font-bold">Artists: {event.artists.join(', ')}</p>
                        <p>Start Date: {event.startDate.toLocaleString()}</p>
                        <p>End Date: {event.endDate.toLocaleString()}</p>
                        {event.photoURL && (
                            <img src={event.photoURL} alt={`${event.eventName} cover`} className="w-64 h-64 object-cover mt-2" />
                        )}
                        <div className="flex space-x-2 mt-2">
                            <button className="bg-yellow-500 text-white p-2" onClick={() => handleEditEvent(event)}><FaEdit /></button>
                            <button className="bg-red-500 text-white p-2" onClick={() => handleDeleteEvent(event.id)}><FaTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;
