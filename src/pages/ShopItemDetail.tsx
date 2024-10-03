import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { slugify } from '../utils';
import { Helmet } from 'react-helmet';
import { loadStripe } from '@stripe/stripe-js';
import { auth } from '../firebase'; // Import your auth instance

const stripePromise = loadStripe('pk_test_51Q5GPFFokBZMd6H1Y5gRZRjgxymtpkidvkXawPrY9nGgibQMEFDM71WTZWyUjqU2Q9dxVsGfalEYI29Ahpg7qnxN006lFJR48h');

type ShopItem = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    shopItemDescription?: string;
};

const ShopItemDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [shopItem, setShopItem] = useState<ShopItem | null>(null);
    const [user, setUser] = useState<any>(null); // User state
    const navigate = useNavigate();

    useEffect(() => {
        // Get the currently logged in user
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser); // Update the user state
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    useEffect(() => {
        if (!slug) {
            navigate('/shop');
            return;
        }

        const fetchShopItems = async () => {
            const shopItemsRef = collection(db, 'shop_items');
            const querySnapshot = await getDocs(shopItemsRef);
            const shopItemsList = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.shopItemName,
                    price: parseFloat(data.shopItemPrice),
                    imageUrl: data.shopItemImageUrl,
                    shopItemDescription: data.shopItemDescription,
                };
            });

            const matchedItem = shopItemsList.find(item => slugify(item.name) === slug);
            if (matchedItem) {
                setShopItem(matchedItem);
            } else {
                console.error('Item not found');
                navigate('/shop');
            }
        };

        fetchShopItems();
    }, [slug, navigate]);

    const handleBuyItem = async () => {
        if (!shopItem || !user) return; // Ensure shopItem and user are defined

        const stripe = await stripePromise;
        const response = await fetch('http://localhost:4242/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: shopItem.name,
                price: shopItem.price,
                imageUrl: shopItem.imageUrl,
                type: 'shop',
                userId: user.uid, // Pass user ID here
            }),
        });

        const session = await response.json();

        // Redirect to Stripe Checkout
        const { error } = await stripe!.redirectToCheckout({ sessionId: session.id });
        if (error) {
            console.error('Stripe checkout error:', error.message);
        }
    };

    if (!shopItem) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>{`Dissonant Pulse - ${shopItem.name}`}</title>
            </Helmet>
            <div className="container mx-auto w-4/5 max-w-4xl my-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
                <img src={shopItem.imageUrl} alt={shopItem.name} className="w-auto h-96 object-cover" />
                <div className="flex flex-col justify-center">
                    <h1 className="text-5xl font-bold mb-4">{shopItem.name}</h1>
                    <p className="text-3xl mb-6">€{shopItem.price.toFixed(2)}</p>
                    <p className="text-xl mb-2">{shopItem.shopItemDescription || 'No description available'}</p>
                    <button
                        className="bg-black text-white border border-gray-600 text-2xl p-2 mt-6 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={handleBuyItem}
                    >
                        Buy Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopItemDetail;
