import React from "react";

type Props = {};

const loading = (props: Props) => {
  return (
    <div>
      <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid-cols-1 gap-x-3 gap-y-5">
        <div className="col-span-1 h-[300px] bg-gray-200 animate-pulse border  rounded-lg overflow-hidden " />
        <div className="col-span-1 h-[300px] bg-gray-200 animate-pulse border  rounded-lg overflow-hidden " />
        <div className="col-span-1 h-[300px] bg-gray-200 animate-pulse border  rounded-lg overflow-hidden " />
        <div className="col-span-1 h-[300px] bg-gray-200 animate-pulse border  rounded-lg overflow-hidden " />
        <div className="col-span-1 h-[300px] bg-gray-200 animate-pulse border  rounded-lg overflow-hidden " />
      </div>
    </div>
  );
};

export default loading;
