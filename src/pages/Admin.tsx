import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { v4 as uuid } from 'uuid';  // For unique image filenames
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
    photoURL?: string;
    location?: string;
    club?: string;
    bio?: string;
    artistImages?: (string | null)[];
};

const Admin: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventName, setEventName] = useState('');
    const [artists, setArtists] = useState<string[]>(['']);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [club, setClub] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [imageUpload, setImageUpload] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);  
    const [artistImages, setArtistImages] = useState<(File | null)[]>([]);
    const [artistImagePreviews, setArtistImagePreviews] = useState<string[]>([]);

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
                photoURL: data.photoURL,
                location: data.location,
                club: data.club,
                bio: data.bio,
                artistImages: data.artistImages || [],
            };
        }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        setEvents(eventsList);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleAddArtist = () => {
        setArtists([...artists, '']);
        setArtistImages([...artistImages, null]);
        setArtistImagePreviews([...artistImagePreviews, '']);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageUpload(file);
            setImagePreview(URL.createObjectURL(file));
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
        setLocation(event.location || '');
        setClub(event.club || '');
        setBio(event.bio || '');
        setImagePreview(event.photoURL || null); // Show existing image if available
    
        // Handle artist images: If any image is null, replace with empty string for the preview
        const previews = event.artistImages?.map(img => img || '') || [];
        setArtistImagePreviews(previews);  // This must be an array of strings
    
        setShowModal(true);
    };
    

    const uploadArtistImages = async () => {
        const urls: (string | null)[] = [];
        for (let i = 0; i < artistImages.length; i++) {
            if (artistImages[i]) {
                const imageRef = storageRef(storage, `artists/${uuid()}`);
                await uploadBytes(imageRef, artistImages[i]!);
                const url = await getDownloadURL(imageRef);
                urls.push(url);
            } else if (editingEvent?.artistImages && editingEvent.artistImages[i]) {
                urls.push(editingEvent.artistImages[i]);
            } else {
                urls.push(null);
            }
        }
        return urls;
    };

    const handleRemoveArtist = (index: number) => {
        const newArtists = artists.filter((_, i) => i !== index);
        const newArtistImages = artistImages.filter((_, i) => i !== index);
        const newArtistImagePreviews = artistImagePreviews.filter((_, i) => i !== index);
        setArtists(newArtists);
        setArtistImages(newArtistImages);
        setArtistImagePreviews(newArtistImagePreviews);
    };


    const handleArtistImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newArtistImages = [...artistImages];
            const newArtistImagePreviews = [...artistImagePreviews];
            
            newArtistImages[index] = file;
            
            // Always ensure the preview is a string, no null values
            newArtistImagePreviews[index] = URL.createObjectURL(file);
            
            setArtistImages(newArtistImages);
            setArtistImagePreviews(newArtistImagePreviews);  // This must always be string[]
        }
    };
     
    
    const handleAddEvent = async () => {
        if (!eventName || !artists.length || !startDate || !endDate || !location || !club || !bio) {
            setError('Please fill in all fields.');
            return;
        }
    
        try {
            let photoURL = "";
            if (imageUpload) {
                photoURL = await uploadFile();
            }
    
            const artistImageUrls = await uploadArtistImages();
    
            const eventsCollection = collection(db, 'events');
            await addDoc(eventsCollection, {
                eventName,
                artists,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                photoURL,
                location,
                club,
                bio,
                artistImages: artistImageUrls,
                createdAt: new Date(),
            });
    
            // Clear the form and close the modal
            clearForm();
            fetchEvents(); 
        } catch (error) {
            console.error('Error adding event:', error);
            setError('Failed to add event.');
        }
    };
    
    const handleUpdateEvent = async () => {
        if (!eventName || !artists.length || !startDate || !endDate || !location || !club || !bio) {
            setError('Please fill in all fields.');
            return;
        }
    
        try {
            const eventRef = doc(db, 'events', editingEvent!.id);
    
            // Handle event image
            let photoURL = editingEvent!.photoURL;
            if (imageUpload) {
                const imageRef = storageRef(storage, `events/${editingEvent!.id}`);
                await uploadBytes(imageRef, imageUpload);
                photoURL = await getDownloadURL(imageRef);
            }
    
            // Handle artist images
            const artistImageUrls: (string | null)[] = [];
            for (let i = 0; i < artistImages.length; i++) {
                if (artistImages[i]) {
                    const imageRef = storageRef(storage, `artists/${uuid()}`);
                    await uploadBytes(imageRef, artistImages[i]!);
                    const url = await getDownloadURL(imageRef);
                    artistImageUrls.push(url);
                } else if (editingEvent?.artistImages && editingEvent.artistImages[i]) {
                    artistImageUrls.push(editingEvent.artistImages[i]);
                } else {
                    artistImageUrls.push(null);
                }
            }
    
            // Update the event in Firestore
            await updateDoc(eventRef, {
                eventName,
                artists,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                club,
                bio,
                photoURL,
                artistImages: artistImageUrls,
            });
    
            // Update the local state
            setEvents(events.map(event =>
                event.id === editingEvent!.id
                    ? {
                        ...event,
                        eventName,
                        artists,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        location,
                        club,
                        bio,
                        photoURL,
                        artistImages: artistImageUrls,
                    }
                    : event
            ));
    
            // Clear the form and close the modal
            clearForm();
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Failed to update event.');
        }
    };

    const clearForm = () => {
        setEditingEvent(null);
        setEventName('');
        setArtists(['']);
        setStartDate('');
        setEndDate('');
        setLocation('');
        setClub('');
        setBio('');
        setImageUpload(null);
        setImagePreview(null);
        setArtistImages([]);
        setArtistImagePreviews([]);
        setError('');
        setShowModal(false);
    };

    const handleCloseModal = () => {
        clearForm();
    };
    
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-4">Admin Page</h1>
            <button className="bg-black text-white p-2 border border-white rounded mb-4" onClick={() => setShowModal(true)}><FaPlus /></button>
                {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-black text-white p-6 border border-gray-600 shadow-lg relative w-3/4 max-h-[80vh] overflow-y-auto">
                        <span className="absolute top-2 right-2 text-xl cursor-pointer" onClick={handleCloseModal}>×</span>
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event Name" />
                        {artists.map((artist, index) => (
                            <div key={index} className="mb-2">
                                <input
                                    className="bg-black border border-gray-600 p-2 mb-2 w-full text-white"
                                    type="text"
                                    value={artist}
                                    onChange={(e) => handleArtistChange(index, e.target.value)}
                                    placeholder="Artist Name"
                                />
                                <input
                                    type="file"
                                    id={`artistFileInput-${index}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleArtistImageChange(index, e)}
                                />
                                <button
                                    className="bg-black text-white p-2 border border-gray-600 rounded mb-2"
                                    onClick={() => document.getElementById(`artistFileInput-${index}`)?.click()}
                                >
                                    {artistImagePreviews[index] ? 'Change Artist Photo' : 'Add Artist Photo'}
                                </button>
                                {artistImagePreviews[index] && <img src={artistImagePreviews[index]} alt="Artist Preview" className="w-60 h-60 object-cover mt-2 mb-2" />}
                                
                                {/* Remove Artist Button */}
                                {artists.length > 1 && (
                                    <button
                                        className="bg-black text-white p-2 border border-red-600 rounded mb-2"
                                        onClick={() => handleRemoveArtist(index)}
                                    >
                                        Remove Artist
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="bg-black text-white p-2 border border-gray-600 rounded mb-2" onClick={handleAddArtist}><FaPlus /> Add Artist</button>
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" />
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="text" value={club} onChange={(e) => setClub(e.target.value)} placeholder="Club" />
                        <input className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (Street Name, Eircode)" />
                        <textarea className="bg-black border border-gray-600 p-2 mb-2 w-full text-white" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Event Bio" rows={10}></textarea>
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
                        {imagePreview && (
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-64 h-64 object-cover mt-2" 
                            />
                        )}
                        <button className="bg-black text-white p-2 border border-white mt-2" onClick={editingEvent ? handleUpdateEvent : handleAddEvent}>
                            {editingEvent ? 'Update Event' : 'Add Event'}
                        </button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                </div>
            )}
            <div className="space-y-4 w-full max-w-4xl">
                {events.map(event => {
                    // Formatting start and end times
                    const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    const endTime = `${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    
                    return (
                        <div key={event.id} className="flex items-center bg-black text-white p-4 border border-gray-600 shadow-lg">
                            {event.photoURL && (
                                <img src={event.photoURL} alt={`${event.eventName} cover`} className="w-32 h-32 object-cover mr-4" />
                            )}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{event.eventName}</h2>
                                <p className="font-bold mb-1">{event.artists.join(', ')}</p>
                                <p className="font-bold mb-1">{event.club}, {event.location}</p>
                                <p className="mb-1">{startTime} - {endTime}</p>
                                <div className="flex space-x-2 mt-2">
                                    <button className="bg-black text-white p-2" onClick={() => handleEditEvent(event)}><FaEdit /></button>
                                    <button className="bg-black text-white p-2" onClick={() => handleDeleteEvent(event.id)}><FaTrash /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Admin;
