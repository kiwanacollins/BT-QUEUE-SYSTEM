import React, { useState } from 'react';
import { UserPlus, Phone } from 'lucide-react';

interface CustomerCheckInProps {
  onCheckIn: (name: string, device: string, phoneNumber: string) => void;
  onVoiceAnnouncement: (text: string) => void;
}

export const CustomerCheckIn: React.FC<CustomerCheckInProps> = ({
  onCheckIn,
  onVoiceAnnouncement
}) => {
  const [name, setName] = useState('');
  const [device, setDevice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !device.trim() || !phoneNumber.trim()) return;

    setIsSubmitting(true);
    
    try {
      onCheckIn(name.trim(), device.trim(), phoneNumber.trim());
      
      // Clear form
      setName('');
      setDevice('');
      setPhoneNumber('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-lg">
          <UserPlus className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Customer Check-In</h2>
          <p className="text-gray-600">Add a new customer to the repair queue</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <input
            id="customerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
            placeholder="Enter customer's full name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
            placeholder="Enter customer's phone number"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-2">
            Device / Equipment
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="deviceName"
              type="text"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
              placeholder="e.g., iPhone 13, Samsung Galaxy, Home Hub"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !device.trim() || !phoneNumber.trim() || isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Add to Queue
            </>
          )}
        </button>
      </form>

      {/* <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
        <p className="text-sm text-purple-700">
          <strong>Voice Commands:</strong> Say "Check in [name] with [device]" to add customers hands-free
        </p>
      </div> */}
    </div>
  );
};