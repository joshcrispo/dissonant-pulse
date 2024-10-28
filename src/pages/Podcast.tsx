import React from "react";
import { Helmet } from "react-helmet";
import Player from "../components/Player";

const Podcast: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Helmet>
        <title>{`Dissonant Pulse - Podcast Session`}</title>
      </Helmet>

      <div className="mt-48 flex items-center"></div>
      <div className="w-9/12 max-w-9xl">
        <h1 className="text-4xl font-bold mb-6">PODCAST SERIES</h1>
        <Player />
      </div>
    </div>
  );
};

export default Podcast;
