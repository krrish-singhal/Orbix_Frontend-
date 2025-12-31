"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState("faq")
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const navigate = useNavigate()

  const faqs = [
    {
      id: 1,
      question: "How do I book a ride?",
      answer:
        "To book a ride, simply enter your pickup and destination locations on the home screen, select your preferred vehicle type, and tap 'Book Ride'. You'll be matched with a nearby driver.",
    },
    {
      id: 2,
      question: "How is the fare calculated?",
      answer:
        "Fare is calculated based on distance, time, vehicle type, and current demand. You'll see the estimated fare before confirming your booking.",
    },
    {
      id: 3,
      question: "Can I cancel my ride?",
      answer:
        "Yes, you can cancel your ride before the driver arrives. Cancellation charges may apply depending on the timing and driver's proximity.",
    },
    {
      id: 4,
      question: "How do I pay for my ride?",
      answer:
        "You can pay using Orbix Wallet, credit/debit cards, or cash. Digital payments are processed automatically after the ride.",
    },
    {
      id: 5,
      question: "What if I left something in the vehicle?",
      answer:
        "Contact our support team immediately with your ride details. We'll help you connect with the driver to retrieve your lost item.",
    },
    {
      id: 6,
      question: "How do I add money to Orbix Wallet?",
      answer:
        "Go to Orbix Wallet from the menu, tap 'Add Money', choose your payment method, and enter the amount you want to add.",
    },
    {
      id: 7,
      question: "Is my personal information safe?",
      answer:
        "Yes, we use industry-standard encryption to protect your personal and payment information. Your data is never shared without your consent.",
    },
    {
      id: 8,
      question: "How do I become a driver?",
      answer:
        "Download the Captain app, complete the registration process with required documents, and pass our verification process to start earning.",
    },
  ]

  const handleContactSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    alert("Your message has been sent! We'll get back to you within 24 hours.")
    setContactForm({ name: "", email: "", subject: "", message: "" })
  }

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <BackButton />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Help & Support</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Animated Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75A9.75 9.75 0 0112 2.25z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">We're Here to Help!</h2>
          <p className="text-white/90">Find answers to common questions or get in touch with our support team</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === "faq" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === "contact" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab("emergency")}
            className={`flex-1 py-4 px-6 text-center font-medium ${
              activeTab === "emergency" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Emergency
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Frequently Asked Questions</h3>
              <p className="text-gray-600 text-sm">Find quick answers to the most common questions</p>
            </div>

            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      expandedFAQ === faq.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFAQ === faq.id && <div className="px-4 pb-4 text-gray-600 animate-fadeIn">{faq.answer}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone Support</h4>
                    <p className="text-gray-600">+91 1800-123-4567</p>
                    <p className="text-sm text-gray-500">24/7 Available</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Support</h4>
                    <p className="text-gray-600">support@orbixride.com</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Send us a message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={4}
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Emergency Tab */}
        {activeTab === "emergency" && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Emergency Contacts</h3>
                  <p className="text-red-700 text-sm">For immediate assistance during emergencies</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="tel:100"
                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Police</h4>
                    <p className="text-gray-600">100</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="tel:108"
                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ambulance</h4>
                    <p className="text-gray-600">108</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="tel:+911800123456"
                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M12 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Orbix Emergency</h4>
                    <p className="text-gray-600">+91 1800-123-456</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Safety Tips</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Always verify driver details before getting in</li>
                <li>• Share your trip details with trusted contacts</li>
                <li>• Keep emergency contacts readily available</li>
                <li>• Trust your instincts and report suspicious behavior</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HelpSupport
