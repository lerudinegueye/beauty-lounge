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
    <div className="container mx-auto p-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Contact</h1>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Nom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 font-bold text-white bg-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-300 ease-in-out disabled:opacity-50"
            disabled={status === 'Sending...'}
          >
            {status === 'Sending...' ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
        {status && <p className="mt-4 text-center text-sm">{status}</p>}
      </div>
    </div>
  );
};

export default ContactPage;
