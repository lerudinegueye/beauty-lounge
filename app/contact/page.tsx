'use client';

import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Message sent successfully!');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      } else {
        const errorData = await response.json();
        setStatus(`Failed to send message: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setStatus('Failed to send message. Please try again later.');
      console.error('Contact form submission error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-[linear-gradient(135deg,#f8e1f4_0%,#fce4ec_100%)] bg-opacity-75 flex justify-center items-center z-40 p-2 sm:p-3">
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-md sm:max-w-2xl max-h-[86vh] mt-6 sm:mt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-pink-700 mb-4">Contact</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-1">
          <div>
            <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-1">Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-1">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            ></textarea>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-pink-600 text-white font-semibold py-2.5 px-5 rounded-full hover:bg-pink-700 transition-all disabled:opacity-50"
              disabled={status === 'Sending...'}
            >
              {status === 'Sending...' ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </form>
        {status && <p className="mt-3 text-center text-sm">{status}</p>}
      </div>
    </div>
  );
};

export default ContactPage;
