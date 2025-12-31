import toast from 'react-hot-toast'
import logo from '../assets/image.png'
import {useNavigate} from 'react-router-dom'
import { useState,useContext } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import { Link } from 'react-router-dom'
import axios from 'axios'

const CaptainSignup = () => {
  const navigate = useNavigate()    

  // Email is auto-generated
  const [ password, setPassword ] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')

  const [ vehicleColor, setVehicleColor ] = useState('')
  const [ vehiclePlate, setVehiclePlate ] = useState('')
  const [ vehicleCapacity, setVehicleCapacity ] = useState('')
  const [ vehicleType, setVehicleType ] = useState('')
  const [ profileIcon, setProfileIcon ] = useState(null)
  const { captain,setCaptain } = useContext(CaptainDataContext)

  // Generate a random two-digit number for email preview
  const [randomNum, setRandomNum] = useState(() => Math.floor(10 + Math.random() * 90));
  const submitHandler = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    if (!firstName || firstName.length < 3) {
      toast.error('First name must be at least 3 characters long');
      return;
    }
    
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (!vehicleColor || vehicleColor.length < 3) {
      toast.error('Vehicle color must be at least 3 characters long');
      return;
    }
    
    if (!vehiclePlate || vehiclePlate.length < 3) {
      toast.error('Vehicle plate must be at least 3 characters long');
      return;
    }
    
    if (!vehicleCapacity || parseInt(vehicleCapacity) < 1) {
      toast.error('Vehicle capacity must be at least 1');
      return;
    }
    
    if (!vehicleType) {
      toast.error('Please select a vehicle type');
      return;
    }
    
    // Use the current randomNum for email
    const email = `${firstName.toLowerCase()}${randomNum}${vehicleType}@orbix.com`
    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: parseInt(vehicleCapacity) || 1, // Convert to integer
        vehicleType: vehicleType
      },
      profileIcon: profileIcon // You may need to handle file upload separately
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData)
      if (response.status === 201) {
        setCaptain(response.data)
        localStorage.setItem('token', response.data.token)
        toast.success('Captain account created successfully!')
        navigate('/captain-home')
      }
    } catch (err) {if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Display specific validation errors
        err.response.data.errors.forEach(error => {
          toast.error(error.msg || error.message);
        });
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Captain signup failed!');
      }
    }
    setFirstName('')
    setLastName('')
    setPassword('')
    setVehicleColor('')
    setVehiclePlate('')
    setVehicleCapacity('')
    setVehicleType('')
    setProfileIcon(null)
  }
  
  return (
    <div className='py-5 px-5 h-screen flex flex-col justify-between'>
      <div>
  <img className='w-20 mb-3' src={logo} alt="Orbix Logo" />

        <form onSubmit={(e) => {
          submitHandler(e)
        }}>

          <h3 className='text-lg w-full  font-medium mb-2'>What's our Captain's name</h3>
          <div className='flex gap-4 mb-7'>
            <input
              required
              className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border  text-lg placeholder:text-base'
              type="text"
              placeholder='First name'
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
              }}
            />
            <input
              required
              className='bg-[#eeeeee] w-1/2  rounded-lg px-4 py-2 border  text-lg placeholder:text-base'
              type="text"
              placeholder='Last name'
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>

          {/* Email is auto-generated, show preview */}
          <h3 className='text-lg font-medium mb-2'>Captain's Email (auto-generated)</h3>
          <input
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
            type="text"
            value={firstName && vehicleType ? `${firstName.toLowerCase()}${randomNum}${vehicleType}@orbix.com` : ''}
            readOnly
            placeholder='Will be generated after entering name and vehicle type'
          />
          <h3 className='text-lg font-medium mb-2'>Profile Icon</h3>
          <input
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
            type="file"
            accept="image/*"
            onChange={e => setProfileIcon(e.target.files[0])}
          />

          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>

          <input
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            required type="password"
            placeholder='password'
          />

          <h3 className='text-lg font-medium mb-2'>Vehicle Information</h3>
          <div className='flex gap-4 mb-7'>
            <input
              required
              className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base'
              type="text"
              placeholder='Vehicle Color'
              value={vehicleColor}
              onChange={(e) => {
                setVehicleColor(e.target.value)
              }}
            />
            <input
              required
              className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base'
              type="text"
              placeholder='Vehicle Plate'
              value={vehiclePlate}
              onChange={(e) => {
                setVehiclePlate(e.target.value)
              }}
            />
          </div>
          <div className='flex gap-4 mb-7'>
            <input
              required
              className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base'
              type="number"
              placeholder='Vehicle Capacity'
              value={vehicleCapacity}
              onChange={(e) => {
                setVehicleCapacity(e.target.value)
              }}
            />
            <select
              required
              className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base'
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value)
              }}
            >
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
            </select>
          </div>

          <button
            className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base'
          >Create Captain Account</button>

        </form>
        <p className='text-center'>Already have a account? <Link to='/captain-login' className='text-blue-600'>Login here</Link></p>
      </div>
      <div>
        <p className='text-[10px] mt-6 leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy
          Policy</span> and <span className='underline'>Terms of Service apply</span>.</p>
      </div>
    </div>
  )
}

export default CaptainSignup