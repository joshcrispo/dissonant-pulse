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

type ShopItem = {
  id: string;
  shopItemName: string;
  shopItemDescription: string;
  shopItemPrice: number;
  shopItemImageUrl: string;
};

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
  ticketPrice?: number;
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
  const [ticketPrice, setTicketPrice] = useState<number | null>(null); // Change initial state to null

  // Shop states
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopItemName, setShopItemName] = useState("");
  const [shopItemDescription, setShopItemDescription] = useState("");
  const [shopItemPrice, setShopItemPrice] = useState<number | null>(null); // Use number type for price
  const [shopItemImage, setShopItemImage] = useState<File | null>(null);
  const [shopItemImagePreview, setShopItemImagePreview] = useState<
    string | null
  >(null);
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null); // Use ShopItem type

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Admin Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {/* Left Container: Events */}
        <div className="flex-1 p-4 rounded">
          <h2 className="text-3xl font-bold mb-4 text-center">Events</h2>
          <hr className="border-gray-600 mb-4" />
          <div className="flex flex-col space-y-2 items-center">
            <button className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full">
              + Add Event
            </button>
            <button className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 w-full">
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

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-black text-white p-6 border border-gray-600 shadow-lg relative w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <span className="absolute top-2 right-2 text-xl cursor-pointer">
              ×
            </span>
            {/* Event Form Fields */}
            <input
              className="bg-black border border-gray-600 p-2 mb-2 w-full text-white"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event Name"
            />
            {/* Additional input fields remain unchanged */}
            {error && <p className="text-red-500 mt-2">{error}</p>}
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
              className="bg-black border border-gray-600 p-2 mb-2 w-full text-white"
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
