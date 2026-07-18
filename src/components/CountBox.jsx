import React from 'react'

const CountBox = ({ title, value }) => {
  return (
    <div className="flex flex-col items-center w-[150px]">
      <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-t-[10px] w-full py-4 text-center">
        <h4 className="font-bold text-[30px] text-slate-900 dark:text-white truncate px-2">
          {value}
        </h4>
      </div>
      <p className="bg-slate-100 dark:bg-[#28282e] font-medium text-[16px] text-slate-600 dark:text-[#808191] px-3 py-2 w-full rounded-b-[10px] text-center">
        {title}
      </p>
    </div>
  )
}

export default CountBox