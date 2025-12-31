// Utility for vehicle image selection
export function getVehicleImage(vehicleType) {
  // Returns the correct vehicle image URL for a given vehicle type
  switch ((vehicleType || '').toLowerCase()) {
    case 'car':
      return 'https://tse4.mm.bing.net/th/id/OIP.ymjpxr4RPlwbLenCbbpYywHaE7?rs=1&pid=ImgDetMain&o=7&rm=3';
    case 'moto':
    case 'bike':
    case 'motorbike':
      return 'https://static.vecteezy.com/system/resources/previews/045/840/640/non_2x/food-delivery-man-riding-scooter-vector.jpg';
    case 'auto':
    case 'rickshaw':
      return 'https://i.pinimg.com/originals/2c/5e/14/2c5e1485755e664bcf7614cc4d492003.png';
    default:
      return 'https://tse4.mm.bing.net/th/id/OIP.ymjpxr4RPlwbLenCbbpYywHaE7?rs=1&pid=ImgDetMain&o=7&rm=3';
  }
}
