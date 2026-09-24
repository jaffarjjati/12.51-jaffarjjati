"use client";

import React from "react";

interface SocialProps {
  onClick?: () => void;
  icon: React.ElementType;
  color: "black" | "white";
}

const colorClasses = {
  black: "bg-black hover:bg-yellow-300 text-white hover:text-black",
  white: "bg-white hover:bg-yellow-300 text-black",
};

const Social: React.FC<SocialProps> = ({ onClick, icon: Icon, color }) => {
  return (
    <div className="flex items-center">
      <button
        onClick={onClick}
        className={`flex items-center justify-center rounded-full focus:outline-none w-12 h-12 ${colorClasses[color]} transition transform hover:scale-110`}
      >
        <Icon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Social;
