import React, { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { Event } from "../types/Events";
import DisplayEventModal from "../components/DisplayEventModal";
import { fetchEvents } from "../utils/FetchEvents";
import { deleteEvent } from "../utils/DeleteEvent";
import { uploadFile } from "../utils/UploadFile";
import { uploadArtistImages } from "../utils/UploadArtistImage";
import AdminShop from "../components/AdminShop";

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
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [artistImages, setArtistImages] = useState<(File | null)[]>([]);
  const [artistImagePreviews, setArtistImagePreviews] = useState<string[]>([]);
  const [ticketPrice, setTicketPrice] = useState<number | undefined>(undefined);

  // Display states
  const [displayEventModal, setDisplayEventModal] = useState(false);
  const [showItems, setShowItems] = useState(false);

  // Shop states
  const [showShopModal, setShowShopModal] = useState(false);

  // Handler for showing the event modal
  const handleShowEvents = async () => {
    const fetchedEvents = await fetchEvents();
    setEvents(fetchedEvents);
    setDisplayEventModal(true);
  };

  const handleDisplayCloseModal = () => {
    setDisplayEventModal(false); // Hide modal
  };

  const handleShopOpenModal = () => {
    setShowShopModal(true);
  };
  const handleShopCloseModal = () => {
    setShowShopModal(false);
  };

  const handleShowItems = () => {
    setShowItems(!showItems);
  };

  const handleShowItemsClose = () => {
    setShowItems(false);
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
        photoURL = await uploadFile(imageUpload, `events/${uuid()}`);
      }

      const artistImageUrls = await uploadArtistImages(artistImages);

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

    setDisplayEventModal(false);
    setShowModal(true);
  };

  // Deleting
  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id, setEvents, setError);
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
              onClick={handleShopOpenModal}
            >
              + Add Shop Item
            </button>
            <button
              className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full"
              onClick={handleShowItems}
            >
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
          <div className="bg-neutral-900 text-white p-6 rounded-lg shadow-lg relative w-5/6 md:w-3/5 max-h-[80vh] overflow-y-auto">
            <span
              className="absolute top-1 right-3 text-5xl cursor-pointer"
              onClick={handleCloseModal}
            >
              ×
            </span>
            <h2 className="text-5xl font-bold mb-4 text-center">
              {editingEvent ? "EDIT EVENT" : "ADD EVENT"}
            </h2>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event Name"
            />
            <button
              className="bg-blue-600 rounded-[25px] text-white p-2 w-full"
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
                <div className="flex gap-2">
                  <button
                    className="bg-blue-600 rounded-[25px] text-white p-2 mb-2 w-full"
                    onClick={() =>
                      document
                        .getElementById(`artistFileInput-${index}`)
                        ?.click()
                    }
                  >
                    {artistImagePreviews[index]
                      ? "Change Artist Photo"
                      : "Add Artist Photo"}
                  </button>
                  {artists.length > 1 && (
                    <button
                      className="bg-red-900 rounded-[25px] text-white p-2 mb-2 w-full"
                      onClick={() => handleRemoveArtist(index)}
                    >
                      Remove Artist
                    </button>
                  )}
                </div>
                {artistImagePreviews[index] && (
                  <img
                    src={artistImagePreviews[index]}
                    alt="Artist Preview"
                    className="w-60 h-60 object-cover mt-2 mb-2"
                  />
                )}
              </div>
            ))}
            <button
              className="bg-green-700 rounded-[25px] text-white p-2 mb-2 w-full"
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
              className="bg-green-700 rounded-[25px] text-white p-2 mt-2 w-full"
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
        <DisplayEventModal
          events={events}
          onClose={handleDisplayCloseModal}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Shop Modal */}
      <AdminShop
        showShopModal={showShopModal}
        showItems={showItems}
        onClose={handleShopCloseModal}
        onCloseItems={handleShowItemsClose}
      />
    </div>
  );
};

export default Admin;
