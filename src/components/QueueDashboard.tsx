import React from 'react';
import { Phone, X, Clock, User } from 'lucide-react';
import { Customer } from '../types';

interface QueueDashboardProps {
  customers: Customer[];
  onCallCustomer: (customerId: string) => void;
  onRemoveCustomer: (customerId: string) => void;
  onVoiceAnnouncement: (text: string) => void;
}

export const QueueDashboard: React.FC<QueueDashboardProps> = ({
  customers,
  onCallCustomer,
  onRemoveCustomer,
  onVoiceAnnouncement
}) => {
  const waitingCustomers = customers.filter(c => c.status === 'waiting');
  const calledCustomers = customers.filter(c => c.status === 'called');
  
  console.log('QueueDashboard - All customers:', customers);
  console.log('QueueDashboard - Called customers:', calledCustomers);
  console.log('QueueDashboard - Waiting customers:', waitingCustomers);

  const handleCallCustomer = (customer: Customer) => {
    onCallCustomer(customer.id);
    onVoiceAnnouncement(
      `${customer.name} the owner of ${customer.device}, your device is ready`
    );
  };

  const handleRemoveCustomer = (customer: Customer) => {
    onRemoveCustomer(customer.id);
    // Removed voice announcement for customer removal
  };

  const getWaitTime = (checkedInAt: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - checkedInAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const CustomerCard: React.FC<{ customer: Customer; showCallButton?: boolean }> = ({ 
    customer, 
    showCallButton = true 
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
            customer.status === 'waiting' ? 'bg-purple-600' : 'bg-blue-600'
          }`}>
            {customer.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
            <p className="text-gray-600 mb-1">{customer.device}</p>
            <p className="text-gray-600 mb-2 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {customer.phoneNumber}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Checked in: {customer.checkedInAt.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Waited for: {getWaitTime(customer.checkedInAt)} mins</span>
              </div>
            </div>

            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.status === 'waiting' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {customer.status === 'waiting' ? 'Waiting' : 'Called'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          {showCallButton && customer.status === 'waiting' && (
            <button
              onClick={() => handleCallCustomer(customer)}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors duration-200 flex items-center gap-1 px-4"
              title="Call Customer"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">Call</span>
            </button>
          )}
          
          {customer.status === 'called' && (
            <button
              onClick={() => handleCallCustomer(customer)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200 flex items-center gap-1 px-4"
              title="Call Customer Again"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">Call Again</span>
            </button>
          )}
          
          {customer.status === 'waiting' && (
            <button
              onClick={() => handleRemoveCustomer(customer)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200"
              title="Remove Customer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Currently Waiting */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Currently Waiting</h2>
              <p className="text-gray-600">{waitingCustomers.length} customers in queue</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {waitingCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No customers currently waiting</p>
              <p className="text-gray-400 text-sm mt-1">New check-ins will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {waitingCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Called */}
      {calledCustomers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recently Called</h2>
                <p className="text-gray-600">{calledCustomers.length} customers called</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {calledCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};