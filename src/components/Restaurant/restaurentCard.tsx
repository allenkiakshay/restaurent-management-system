import React from "react";

interface RestaurentData {
  id: number;
  name: string;
  image: string;
  address: string;
  rating: number;
  cuisine: string;
  description: string;
  pricelevel: string;
}

interface RestaurentCardProps {
  data: RestaurentData;
}

const RestaurentCard: React.FC<RestaurentCardProps> = ({ data }) => {
  const { name, image, address, rating, cuisine, description, pricelevel } = data;

  return (
    <div
      className="
        max-w-[520px] w-full rounded-2xl overflow-hidden shadow-lg
        bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-100
        my-8 mx-auto font-sans border border-indigo-100 flex flex-col
        transition-transform transition-shadow duration-200
        sm:max-w-[98vw] sm:my-4 sm:rounded-xl
      "
    >
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="
            w-full h-[240px] object-cover brightness-95 block
            sm:h-[160px] xs:h-[110px]
          "
        />
        <span
          className="
            absolute top-4 right-4 bg-white/85 text-blue-600 rounded-lg
            px-4 py-1.5 font-bold text-lg shadow
            tracking-wider
          "
        >
          ★ {rating.toFixed(1)}
        </span>
      </div>
      <div className="p-7 xs:p-4">
        <h2 className="m-0 mb-2.5 text-2xl font-extrabold text-blue-600 sm:text-xl">
          {name}
        </h2>
        <div className="text-gray-500 text-lg mb-2.5 font-medium">
          {cuisine} • {address}
        </div>
        <div className="text-gray-700 text-base mb-3.5 min-h-[40px]">
          {description}
        </div>
        <div className="flex items-center mb-4.5">
          <span
            className="
              bg-indigo-100 text-indigo-900 rounded px-3 py-1
              font-bold text-base mr-3 tracking-wider
            "
          >
            {pricelevel}
          </span>
        </div>
        <a href={`/restaurants/${data.id}`} className="no-underline block">
          <button
            className="
              mt-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-400
              text-white border-none rounded-lg font-bold text-lg cursor-pointer
              shadow tracking-wider transition-colors duration-200
              hover:from-blue-700 hover:to-blue-500
            "
          >
            View Menu
          </button>
        </a>
      </div>
    </div>
  );
};

export default RestaurentCard;
