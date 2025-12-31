"use client";
import React from "react";

function VehiclePanel({ setShowVehiclePanel, onConfirm, onClose, fare }) {const vehicles = [
    {
      name: "UberGo",
      capacity: 4,
      time: "2 mins away",
      description: "Affordable, compact rides",
      price: fare?.car || "Loading...",
      image: "https://tse4.mm.bing.net/th/id/OIP.ymjpxr4RPlwbLenCbbpYywHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
      type: "car"
    },
    {
      name: "Moto",
      capacity: 1,
      time: "3 mins away",
      description: "Affordable motorcycle rides", 
      price: fare?.moto || "Loading...",
      image: "https://static.vecteezy.com/system/resources/previews/045/840/640/non_2x/food-delivery-man-riding-scooter-vector.jpg",
      type: "moto"
    },
    {
      name: "UberAuto",
      capacity: 3,
      time: "3 mins away",
      description: "Affordable Auto rides",
      price: fare?.auto || "Loading...",
      image: "https://i.pinimg.com/originals/2c/5e/14/2c5e1485755e664bcf7614cc4d492003.png",
      type: "auto"
    },
  ];

  const handleVehicleSelect = (vehicle) => {onConfirm(vehicle);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-30 bg-white dark:bg-gray-800 p-3 sm:p-5 md:p-6 rounded-t-3xl md:rounded-3xl md:mb-4 shadow-2xl border-t-2 border-gray-200 dark:border-gray-700">
      <h5
        className="p-1 text-center w-[93%] cursor-pointer"
        onClick={() => {
          setShowVehiclePanel(false);
          onClose && onClose();
        }}
      >
        <i className="text-2xl sm:text-3xl text-gray-400 dark:text-gray-500 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-5 text-center text-gray-800 dark:text-gray-100">
        Choose a Vehicle
      </h3>
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {vehicles.map((vehicle, idx) => (
          <div
            key={idx}
            onClick={() => handleVehicleSelect(vehicle)}
            className="flex items-center justify-between p-3 sm:p-4 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl cursor-pointer transition-all active:scale-95 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <img
              className="h-12 w-16 sm:h-14 sm:w-20 md:h-16 md:w-24 object-contain"
              src={vehicle.image}
              alt={vehicle.name}
            />
            <div className="ml-2 flex-1 px-2">
              <h4 className="font-medium text-base sm:text-lg text-gray-800 dark:text-gray-100">
                {vehicle.name}
                <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <i className="ri-user-3-fill"></i> {vehicle.capacity}
                </span>
              </h4>
              <h5 className="font-medium text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {vehicle.time}
              </h5>
              <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.description}</p>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {typeof vehicle.price === 'number' ? `₹${vehicle.price}` : vehicle.price}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VehiclePanel;
