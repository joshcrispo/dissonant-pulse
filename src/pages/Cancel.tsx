import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';

const Cancel: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    
    // Extract from state or fallback to query params
    const itemType = location.state?.itemType || searchParams.get('itemType') || 'event';
    const itemName = location.state?.itemName || searchParams.get('itemName') || '';

        // Debugging logs to see what values are being read
        console.log('Location state:', location.state);
        console.log('Item Type from state:', location.state?.itemType);
        console.log('Item Type from query params:', searchParams.get('itemType'));
        console.log('Item Name from state:', location.state?.itemName);
        console.log('Item Name from query params:', searchParams.get('itemName'));

    const handleGoBack = () => {
        if (itemType === 'event') {
        navigate('/events');
        } else {
        navigate('/shop');
        }
    };

  return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            <Helmet>
                <title>{`Purchase Canceled - ${itemName}`}</title>
            </Helmet>
            
            <div className='mt-48 flex items-center'></div>
            <h1 className="text-4xl font-bold mb-6">Purchase Cancelled</h1>
            <p className="text-2xl mb-10">
                Your purchase of <span className="font-bold">{itemName}</span> was cancelled.
            </p>
            <button
                className="bg-black text-white border border-gray-600 text-xl sm:text-2xl p-2 mt-6 w-full sm:w-auto hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
                onClick={handleGoBack}
            >
                ← Back to {itemType === 'event' ? 'Events' : 'Shop'}
            </button>
        </div>
    );
};

export default Cancel;
