import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../utils';

type ShopItem = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
};

const Shop: React.FC = () => {
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchShopItems = async () => {
        try {
            const shopItemsCollection = collection(db, 'shop_items');
            const shopItemsSnapshot = await getDocs(shopItemsCollection);
            const shopItemsList = shopItemsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.shopItemName || 'No Name',
                    price: data.shopItemPrice ? parseFloat(data.shopItemPrice) : null,
                    imageUrl: data.shopItemImageUrl,
                };
            }) as ShopItem[];
            setShopItems(shopItemsList);
        } catch (error) {
            console.error('Error fetching shop items:', error);
            setError('Failed to fetch shop items. Please check your permissions or network connection.');
        }
    };

    const handleViewItem = (itemName: string) => {
        const slug = slugify(itemName);
        navigate(`/shop/${slug}`);
    };
    
    useEffect(() => {
        fetchShopItems();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>Dissonant Pulse - Shop</title>
            </Helmet>
            <section className="mx-auto w-9/12 max-w-9xl text-center">
                <h1 className="my-16 text-4xl font-bold">SHOP</h1>
                {error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <div className="w-full mb-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {shopItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-black border border-gray-600 shadow-lg p-4 transform hover:scale-105 transition duration-300 ease-in-out"
                            >
                                {item.imageUrl && (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-48 object-cover mb-4 rounded"
                                    />
                                )}
                                <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                                {item.price !== null ? (
                                    <p className="text-xl font-semibold mb-2">€{item.price.toFixed(2)}</p>
                                ) : (
                                    <p className="text-xl font-semibold mb-2 text-gray-500">Price not available</p>
                                )}
                                <button
                                    className="bg-black border border-gray-600 text-white p-2 mt-4 w-full hover:bg-gray-800 transition duration-300"
                                    onClick={() => handleViewItem(item.name)}
                                >
                                    View Item
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Shop;