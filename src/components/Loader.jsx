import React from 'react';
import { loader } from '../assets'; // Ensure you have a loader/spinner icon in assets

const Loader = () => {
  return (
    <div className="fixed inset-0 z-10 h-screen bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col backdrop-blur-sm">
      <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain"/>
      <p className="mt-[20px] font-epilogue font-bold text-[20px] text-white text-center">
        Transaction in progress <br /> 
        <span className="text-[#8c6dfd] text-[14px]">Please wait while we verify with the blockchain...</span>
      </p>
    </div>
  )
}

export default Loader