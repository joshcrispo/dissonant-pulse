import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemType, itemName } = location.state || { itemType: 'event', itemName: '' };

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
        <title>{`Thank You - ${itemName}`}</title>
      </Helmet>
      <h1 className="text-4xl font-bold mb-6">Thank you for your purchase!</h1>
      <p className="text-2xl mb-10">
        You have successfully purchased {itemType === 'event' ? 'a ticket for' : ''} <span className="font-bold">{itemName}</span>.
      </p>
      <button
        className="bg-gray-800 text-white border border-gray-600 text-xl px-6 py-3 rounded-md hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleGoBack}
      >
        ← Back to {itemType === 'event' ? 'Events' : 'Shop'}
      </button>
    </div>
  );
};

export default Success;
