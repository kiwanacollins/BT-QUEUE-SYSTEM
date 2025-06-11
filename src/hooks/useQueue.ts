import { useState, useCallback, useEffect } from 'react';
import { Customer, QueueStats } from '../types';
import * as XLSX from 'xlsx';

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
          const customersWithDates = parsedQueue.map((customer: Customer) => ({
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
    // Clear all customers including recently called
    setCustomers([]);
  }, []);

  const exportCalledCustomersToExcel = useCallback(() => {
    // Get only called customers
    const calledCustomers = customers.filter(customer => customer.status === 'called');
    
    if (calledCustomers.length === 0) {
      alert('No called customers to export.');
      return;
    }

    // Prepare data for Excel
    const excelData = calledCustomers.map((customer, index) => ({
      'No.': index + 1,
      'Customer Name': customer.name,
      'Phone Number': customer.phoneNumber,
      'Device/Equipment': customer.device,
      'Check-in Time': customer.checkedInAt.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      'Called Time': customer.calledAt ? customer.calledAt.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) : 'Not called yet',
      'Wait Duration (minutes)': customer.calledAt 
        ? Math.round((customer.calledAt.getTime() - customer.checkedInAt.getTime()) / 60000)
        : Math.round((new Date().getTime() - customer.checkedInAt.getTime()) / 60000),
      'Status': customer.status.charAt(0).toUpperCase() + customer.status.slice(1)
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 5 },   // No.
      { wch: 20 },  // Customer Name
      { wch: 15 },  // Phone Number
      { wch: 25 },  // Device/Equipment
      { wch: 20 },  // Check-in Time
      { wch: 20 },  // Called Time
      { wch: 18 },  // Wait Duration
      { wch: 12 }   // Status
    ];
    ws['!cols'] = colWidths;

    // Add title row
    const today = new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const titleData = [
      ['BT Repair Centre - Recently Called Customers'],
      [`Export Date: ${today}`],
      [`Total Called Customers: ${calledCustomers.length}`],
      [] // Empty row before headers
    ];

    // Insert title rows at the beginning
    XLSX.utils.sheet_add_aoa(ws, titleData, { origin: 'A1' });
    XLSX.utils.sheet_add_json(ws, excelData, { origin: 'A5', skipHeader: false });

    // Style the title (if supported)
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center' }
      };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Called Customers');

    // Generate filename with current date
    const filename = `BT-Called-Customers-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write and download the file
    XLSX.writeFile(wb, filename);
  }, [customers]);

  return {
    customers,
    stats,
    addCustomer,
    callCustomer,
    removeCustomer,
    completeCustomer,
    getNextCustomer,
    clearQueue,
    exportCalledCustomersToExcel
  };
};