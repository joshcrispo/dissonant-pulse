import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { Event } from "../types/Events";

type ShopItem = {
  id: string;
  shopItemName: string;
  shopItemDescription: string;
  shopItemPrice: number;
  shopItemImageUrl: string;
};

const Admin: React.FC = () => {
  // Event states
  const [events, setEvents] = useState<Event[]>([]);
  const [eventName, setEventName] = useState("");
  const [artists, setArtists] = useState<string[]>([""]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [club, setClub] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [artistImages, setArtistImages] = useState<(File | null)[]>([]);
  const [artistImagePreviews, setArtistImagePreviews] = useState<string[]>([]);
  const [ticketPrice, setTicketPrice] = useState<number | undefined>(undefined);

  // Display states
  const [displayEventModal, setDisplayEventModal] = useState(false);

  // Shop states
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopItemName, setShopItemName] = useState("");
  const [shopItemDescription, setShopItemDescription] = useState("");
  const [shopItemPrice, setShopItemPrice] = useState<number | null>(null);
  const [shopItemImage, setShopItemImage] = useState<File | null>(null);
  const [shopItemImagePreview, setShopItemImagePreview] = useState<
    string | null
  >(null);
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);

  const fetchEvents = async () => {
    const eventsCollection = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsCollection);
    const eventsList = eventsSnapshot.docs.map((doc) => {
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
        ticketPrice: data.ticketPrice || 0,
      };
    });
    const currentDate = new Date();
    const futureEvents = eventsList.filter(
      (event) => event.startDate > currentDate
    );

    setEvents(futureEvents);
  };

  // Handler for showing the event modal
  const handleShowEvents = async () => {
    await fetchEvents(); // Fetch events when button is pressed
    setDisplayEventModal(true); // Show the modal
  };

  const handleDisplayCloseModal = () => {
    setDisplayEventModal(false); // Hide modal
  };

  const handleAddEvent = async () => {
    if (
      !eventName ||
      !artists.length ||
      !startDate ||
      !endDate ||
      !location ||
      !club ||
      !bio ||
      ticketPrice === 0
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      let photoURL = "";
      if (imageUpload) {
        photoURL = await uploadFile();
      }

      const artistImageUrls = await uploadArtistImages();

      const eventsCollection = collection(db, "events");
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
        ticketPrice: Number(ticketPrice),
        createdAt: new Date(),
      });

      clearForm();
    } catch (error) {
      console.error("Error adding event:", error);
      setError("Failed to add event.");
    }
  };

  const handleUpdateEvent = async () => {
    if (
      !eventName ||
      !artists.length ||
      !startDate ||
      !endDate ||
      !location ||
      !club ||
      !bio ||
      ticketPrice === 0
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const eventRef = doc(db, "events", editingEvent!.id);

      let photoURL = editingEvent!.photoURL;
      if (imageUpload) {
        const imageRef = storageRef(storage, `events/${editingEvent!.id}`);
        await uploadBytes(imageRef, imageUpload);
        photoURL = await getDownloadURL(imageRef);
      }

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
        ticketPrice: Number(ticketPrice),
      });

      setEvents(
        events.map((event) =>
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
                ticketPrice: Number(ticketPrice),
              }
            : event
        )
      );

      clearForm();
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event.");
    }
  };

  const handleAddArtist = () => {
    setArtists([...artists, ""]);
    setArtistImages([...artistImages, null]);
    setArtistImagePreviews([...artistImagePreviews, ""]);
  };

  const handleRemoveArtist = (index: number) => {
    const newArtists = artists.filter((_, i) => i !== index);
    const newArtistImages = artistImages.filter((_, i) => i !== index);
    const newArtistImagePreviews = artistImagePreviews.filter(
      (_, i) => i !== index
    );
    setArtists(newArtists);
    setArtistImages(newArtistImages);
    setArtistImagePreviews(newArtistImagePreviews);
  };

  const handleArtistChange = (index: number, value: string) => {
    const newArtists = [...artists];
    newArtists[index] = value;
    setArtists(newArtists);
  };

  // Images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUpload(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async () => {
    if (imageUpload === null) {
      throw new Error("Please select an image");
    }

    const imageRef = storageRef(storage, `events/${uuid()}`);
    await uploadBytes(imageRef, imageUpload);
    return await getDownloadURL(imageRef);
  };

  const handleArtistImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newArtistImages = [...artistImages];
      const newArtistImagePreviews = [...artistImagePreviews];

      newArtistImages[index] = file;

      newArtistImagePreviews[index] = URL.createObjectURL(file);

      setArtistImages(newArtistImages);
      setArtistImagePreviews(newArtistImagePreviews);
    }
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

  //Editing
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventName(event.eventName);
    setArtists(event.artists);
    setStartDate(event.startDate.toISOString().substring(0, 16));
    setEndDate(event.endDate.toISOString().substring(0, 16));
    setLocation(event.location || "");
    setClub(event.club || "");
    setBio(event.bio || "");
    setTicketPrice(event.ticketPrice !== undefined ? event.ticketPrice : 0);
    setImagePreview(event.photoURL || null);

    const previews = event.artistImages?.map((img) => img || "") || [];
    setArtistImagePreviews(previews);

    setShowModal(true);
  };

  //Delete
  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents(events.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event.");
    }
  };

  const clearForm = () => {
    setEditingEvent(null);
    setEventName("");
    setArtists([""]);
    setStartDate("");
    setEndDate("");
    setLocation("");
    setClub("");
    setBio("");
    setImageUpload(null);
    setImagePreview(null);
    setArtistImages([]);
    setArtistImagePreviews([]);
    setError("");
    setTicketPrice(0);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    clearForm();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Admin Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {/* Left Container: Events */}
        <div className="flex-1 p-4 rounded">
          <h2 className="text-3xl font-bold mb-4 text-center">Events</h2>
          <hr className="border-gray-600 mb-4" />
          <div className="flex flex-col space-y-2 items-center">
            <button
              className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition 
              duration-300 ease-in-out transform hover:scale-105 w-full"
              onClick={() => setShowModal(true)}
            >
              + Add Event
            </button>
            <button
              className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition 
            duration-300 ease-in-out transform hover:scale-105 w-full"
              onClick={handleShowEvents}
            >
              Show Events
            </button>
          </div>
        </div>

        {/* Middle Container: Shop */}
        <div className="flex-1 p-4 rounded">
          <h2 className="text-3xl font-bold mb-4 text-center">Shop</h2>
          <hr className="border-gray-600 mb-4" />
          <div className="flex flex-col space-y-2 items-center">
            <button
              className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full"
              onClick={() => setShowModal(true)}
            >
              + Add Shop Item
            </button>
            <button className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full">
              Show Items
            </button>
          </div>
        </div>

        {/* Right Container: Podcasts */}
        <div className="flex-1 p-4 rounded">
          <h2 className="text-3xl font-bold mb-4 text-center">Podcasts</h2>
          <hr className="border-gray-600 mb-4" />
          <div className="flex flex-col space-y-2 items-center">
            <button className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full">
              + Add Podcast
            </button>
            <button className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full">
              Show Podcasts
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg shadow-lg relative w-3/5 max-h-[80vh] overflow-y-auto">
            <span
              className="absolute top-1 right-3 text-5xl cursor-pointer"
              onClick={handleCloseModal}
            >
              ×
            </span>
            <h2 className="text-5xl font-bold mb-4 text-center">ADD EVENT</h2>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event Name"
            />
            <button
              className="bg-green-900 rounded-lg border border-white text-white p-2"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {imagePreview ? "Change Photo" : "📷 Add Event Photo"}
            </button>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-64 h-64 object-cover my-2"
              />
            )}
            {artists.map((artist, index) => (
              <div key={index} className="">
                <input
                  className="bg-neutral-900 rounded-lg border border-white p-2 my-2 w-full text-white"
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
                  className="bg-neutral-900 rounded-lg border border-white text-white p-2 mb-2"
                  onClick={() =>
                    document.getElementById(`artistFileInput-${index}`)?.click()
                  }
                >
                  {artistImagePreviews[index]
                    ? "Change Artist Photo"
                    : "Add Artist Photo"}
                </button>
                {artistImagePreviews[index] && (
                  <img
                    src={artistImagePreviews[index]}
                    alt="Artist Preview"
                    className="w-60 h-60 object-cover mt-2 mb-2"
                  />
                )}

                {artists.length > 1 && (
                  <button
                    className="bg-red-900 rounded-lg border border-white text-white p-2 mb-2 ml-2"
                    onClick={() => handleRemoveArtist(index)}
                  >
                    Remove Artist
                  </button>
                )}
              </div>
            ))}
            <button
              className="bg-green-900 rounded-lg border border-white text-white p-2 mb-2"
              onClick={handleAddArtist}
            >
              + Add Artist
            </button>
            <label className="text-white font-bold my-1 block">
              Start Date/Time:
            </label>
            <div className="relative w-full mb-2">
              <input
                className="bg-neutral-900 rounded-lg border border-white p-2 pl-10 w-full text-white"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">
                📅
              </span>
            </div>
            <label className="text-white font-bold my-1 block">
              End Date/Time:
            </label>
            <div className="relative w-full mb-2">
              <input
                className="bg-neutral-900 rounded-lg border border-white p-2 pl-10 w-full text-white"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">
                📅
              </span>
            </div>
            <label className="text-3xl text-white font-bold my-4 block">
              DESCRIPTION & PRICE:
            </label>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="text"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="Club"
            />
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (Street Name, Eircode)"
            />
            <textarea
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Event Bio"
            ></textarea>
            <label className="text-white font-bold mb-1 block">
              Ticket Price (€)
            </label>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="number"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(Number(e.target.value))}
            />
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />

            <button
              className="bg-green-900 rounded-lg border border-white text-white p-2 my-2 w-full"
              onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
            >
              {editingEvent ? "Update Event" : "Add Event"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      )}

      {/* Events list */}
      {displayEventModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-900 text-white p-8 rounded-lg shadow-lg relative w-3/5 max-h-[80vh] overflow-y-auto">
            <span
              className="absolute top-1 right-3 text-5xl cursor-pointer"
              onClick={handleDisplayCloseModal}
            >
              ×
            </span>
            <h2 className="text-5xl font-bold mb-4 pl-4">EVENTS</h2>
            <div className="space-y-4 w-full max-w-4xl mb-4">
              {events.map((event) => {
                const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )}`;
                const endTime = `${event.endDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;

                return (
                  <div
                    key={event.id}
                    className="flex items-center bg-neutral-900 rounded-lg text-white p-4 "
                  >
                    {event.photoURL && (
                      <img
                        src={event.photoURL}
                        alt={`${event.eventName} cover`}
                        className="w-64 h-48 object-cover mr-4"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">
                        {event.eventName}
                      </h2>
                      <p className="font-bold mb-1">
                        {event.artists.join(", ")}
                      </p>
                      <p className="font-bold mb-1">{event.club}</p>
                      <p className="mb-1">
                        {startTime} - {endTime}
                      </p>
                      <p className="mb-1">Ticket Price: €{event.ticketPrice}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          className="bg-orange-600 w-full rounded-lg border border-white text-white p-2 mb-2"
                          onClick={() => handleEditEvent(event)}
                        >
                          EDIT
                        </button>
                        <button
                          className="bg-red-900 w-full font-bold rounded-lg border border-white text-white p-2 mb-2"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShopModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-black text-white p-6 border border-gray-600 shadow-lg relative w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <span className="absolute top-2 right-2 text-xl cursor-pointer">
              ×
            </span>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="text"
              value={shopItemName}
              onChange={(e) => setShopItemName(e.target.value)}
              placeholder="Item Name"
            />
            {/* Additional input fields remain unchanged */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
