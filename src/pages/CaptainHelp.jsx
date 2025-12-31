"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"
import toast from "react-hot-toast"

const CaptainHelp = () => {
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const navigate = useNavigate()

  const faqCategories = {
    general: {
      title: "General Questions",
      faqs: [
        {
          question: "How do I go online to receive ride requests?",
          answer: "Tap the toggle switch in the top right of your home screen to go online. Make sure location permissions are enabled."
        },
        {
          question: "How are my earnings calculated?",
          answer: "Your earnings are calculated based on the ride fare minus Orbix's service fee (typically 15%). You keep 85% of each ride fare."
        },
        {
          question: "When do I get paid?",
          answer: "Earnings are transferred to your account immediately after completing a ride. You can cash out anytime through the wallet."
        }
      ]
    },
    rides: {
      title: "Ride Management",
      faqs: [
        {
          question: "What should I do if a rider doesn't show up?",
          answer: "Wait for 5 minutes at the pickup location, then you can cancel the ride with a cancellation fee. Contact support if needed."
        },
        {
          question: "How do I handle difficult passengers?",
          answer: "Remain calm and professional. If you feel unsafe, end the trip safely and report the incident through the app immediately."
        },
        {
          question: "Can I reject ride requests?",
          answer: "Yes, you can decline ride requests, but maintaining a high acceptance rate helps you receive more requests."
        }
      ]
    },
    technical: {
      title: "Technical Issues",
      faqs: [
        {
          question: "The app is not showing ride requests",
          answer: "Check your internet connection, ensure you're online in the app, and verify your location permissions are enabled."
        },
        {
          question: "GPS is not working properly",
          answer: "Make sure location services are enabled for the Orbix app. Try restarting the app or your phone if issues persist."
        },
        {
          question: "Payment issues",
          answer: "Contact our support team immediately for payment-related issues. Keep screenshots of any error messages."
        }
      ]
    },
    account: {
      title: "Account & Vehicle",
      faqs: [
        {
          question: "How do I update my vehicle information?",
          answer: "Go to Settings > My Vehicle to update your vehicle details. Some changes may require document verification."
        },
        {
          question: "How do I change my profile information?",
          answer: "Navigate to Settings > Profile to update your personal information and contact details."
        },
        {
          question: "How do I delete my account?",
          answer: "You can delete your account in Settings > Account Management. Note that this action is permanent."
        }
      ]
    }
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    toast.success("Your message has been sent! We'll get back to you within 24 hours.")
    setContactForm({ name: '', email: '', subject: '', message: '' })
  }

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  const emergencyActions = [
    {
      icon: "ri-phone-line",
      title: "Emergency Call",
      description: "Call emergency services",
      action: () => window.open('tel:911', '_self'),
      color: "bg-red-600 hover:bg-red-700"
    },
    {
      icon: "ri-customer-service-line",
      title: "24/7 Support",
      description: "Contact Orbix support",
      action: () => window.open('tel:+1-800-ORBIX-HELP', '_self'),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      icon: "ri-shield-check-line",
      title: "Safety Center",
      description: "Report safety concerns",
      action: () => toast.info("Safety reporting feature coming soon"),
      color: "bg-green-600 hover:bg-green-700"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate("/captain-home")} 
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Help & Support</h1>
          <div className="w-6 h-6"></div>
        </div>
      </div>

      <div className="p-4">
        {/* Emergency Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Emergency & Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-lg transition-colors flex flex-col items-center text-center`}
              >
                <i className={`${action.icon} text-2xl mb-2`}></i>
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(faqCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqCategories[selectedCategory].faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
          </p>
          
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={contactForm.subject}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            
            <textarea
              name="message"
              placeholder="Describe your issue or question..."
              value={contactForm.message}
              onChange={handleInputChange}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            ></textarea>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/captain-profile')}
              className="flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="ri-user-line text-blue-600"></i>
              <span>Update Profile</span>
            </button>
            
            <button
              onClick={() => navigate('/captain-vehicle')}
              className="flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="ri-car-line text-blue-600"></i>
              <span>Vehicle Information</span>
            </button>
            
            <button
              onClick={() => navigate('/captain-wallet')}
              className="flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="ri-wallet-line text-blue-600"></i>
              <span>Wallet & Earnings</span>
            </button>
            
            <button
              onClick={() => navigate('/captain-settings')}
              className="flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="ri-settings-line text-blue-600"></i>
              <span>App Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-gray-400`}></i>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default CaptainHelp