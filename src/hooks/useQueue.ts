import { useState, useCallback, useEffect } from 'react';
import { Customer, QueueStats } from '../types';

const STORAGE_KEY = 'bt-repair-queue';
const STATS_KEY = 'bt-repair-stats';

export const useQueue = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stats, setStats] = useState<QueueStats>({
    waiting: 0,
    called: 0,
    completed: 0,
    totalToday: 0
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const savedQueue = localStorage.getItem(STORAGE_KEY);
      const savedStats = localStorage.getItem(STATS_KEY);

      console.log('Loading from localStorage:', savedQueue);

      if (savedQueue) {
        try {
          const parsedQueue = JSON.parse(savedQueue);
          console.log('Parsed queue data:', parsedQueue);
          const customersWithDates = parsedQueue.map((customer: any) => ({
            ...customer,
            checkedInAt: new Date(customer.checkedInAt),
            calledAt: customer.calledAt ? new Date(customer.calledAt) : undefined
          }));
          console.log('Customers with dates:', customersWithDates);
          setCustomers(customersWithDates);
        } catch (error) {
          console.error('Error loading queue from storage:', error);
        }
      }

      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats));
        } catch (error) {
          console.error('Error loading stats from storage:', error);
        }
      }
      
      // Mark as initialized after loading
      setIsInitialized(true);
    };

    // Load immediately
    loadData();
  }, []);

  // Save to localStorage whenever customers change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      console.log('Saving customers to localStorage:', customers);
      // Always save the current state to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
      
      // Update stats
      const newStats = {
        waiting: customers.filter(c => c.status === 'waiting').length,
        called: customers.filter(c => c.status === 'called').length,
        completed: customers.filter(c => c.status === 'completed').length,
        totalToday: customers.length
      };
      
      setStats(newStats);
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    }
  }, [customers, isInitialized]);

  const addCustomer = useCallback((name: string, device: string, phoneNumber: string): Customer => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: name.trim(),
      device: device.trim(),
      phoneNumber: phoneNumber.trim(),
      checkedInAt: new Date(),
      status: 'waiting'
    };

    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  }, []);

  const callCustomer = useCallback((customerId: string) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === customerId
          ? { ...customer, status: 'called' as const, calledAt: new Date() }
          : customer
      )
    );
  }, []);

  const removeCustomer = useCallback((customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
  }, []);

  const completeCustomer = useCallback((customerId: string) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === customerId
          ? { ...customer, status: 'completed' as const }
          : customer
      )
    );
  }, []);

  const getNextCustomer = useCallback(() => {
    return customers.find(customer => customer.status === 'waiting');
  }, [customers]);

  const clearQueue = useCallback(() => {
    // Only clear waiting customers, keep called customers
    setCustomers(prev => prev.filter(customer => customer.status === 'called'));
  }, []);

  const exportData = useCallback(() => {
    const data = {
      customers,
      stats,
      exportedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-GB')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bt-repair-queue-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [customers, stats]);

  return {
    customers,
    stats,
    addCustomer,
    callCustomer,
    removeCustomer,
    completeCustomer,
    getNextCustomer,
    clearQueue,
    exportData
  };
};