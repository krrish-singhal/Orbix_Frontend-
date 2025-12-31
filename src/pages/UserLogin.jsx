import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import logo from '../assets/image.png'

const UserLogin = () => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ userData, setUserData ] = useState({})

  const { user, setUser } = useContext(UserDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault();
    const userData = {
      email: email,
      password: password
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData);
      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        toast.success('User login successful!');
        setEmail('');
        setPassword('');
        navigate('/home');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials and try again.');
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black px-4 py-8'>
      <div className='w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-7 sm:p-10'>
      <div>
  <img className='w-16 sm:w-20 mb-8 sm:mb-10 mx-auto' src={logo} alt="Orbix Logo" />

        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-200'>What's your email</h3>
          <input
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
            }}
            className='bg-gray-100 dark:bg-gray-700 mb-6 sm:mb-7 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600 w-full text-base sm:text-lg placeholder:text-sm sm:placeholder:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all'
            type="email"
            placeholder='email@example.com'
          />

          <h3 className='text-lg sm:text-xl font-medium mb-2 text-gray-800 dark:text-gray-200'>Enter Password</h3>

          <input
            className='bg-gray-100 dark:bg-gray-700 mb-6 sm:mb-7 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600 w-full text-base sm:text-lg placeholder:text-sm sm:placeholder:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
            }}
            required type="password"
            placeholder='password'
          />

          <button
            className='bg-black hover:bg-gray-800 text-white font-semibold mb-4 sm:mb-5 rounded-lg px-4 py-3 sm:py-4 w-full text-base sm:text-lg transition-all active:scale-95'
          >Login</button>

        </form>
        <p className='text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base'>New here? <Link to='/signup' className='text-blue-600 dark:text-blue-400 font-medium hover:underline'>Create new Account</Link></p>
      </div>
      <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <Link
          to='/captain-login'
          className='bg-[#10b461] hover:bg-[#0d9950] flex items-center justify-center text-white font-semibold rounded-lg px-4 py-3 sm:py-4 w-full text-base sm:text-lg transition-all active:scale-95 shadow-lg'
        >Sign in as Captain</Link>
      </div>
      </div>
    </div>
  )
}

export default UserLogin