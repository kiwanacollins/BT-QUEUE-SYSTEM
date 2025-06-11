import React from 'react';
import { Users, Phone, CheckCircle, Clock } from 'lucide-react';
import { QueueStats } from '../types';

interface StatisticsProps {
  stats: QueueStats;
}

export const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Customers Waiting',
      value: stats.waiting,
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      valueColor: 'text-green-700'
    },
    {
      title: 'Customers Called',
      value: stats.called,
      icon: Phone,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700'
    },
    {
      title: 'Total Today',
      value: stats.totalToday,
      icon: Clock,
      color: 'gray',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      valueColor: 'text-gray-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Queue Statistics</h2>
        <p className="text-gray-600">Real-time overview of today's activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`${stat.bgColor} rounded-lg p-4 border border-opacity-20 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                <span className={`text-2xl font-bold ${stat.valueColor}`}>
                  {stat.value}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last updated: {new Date().toLocaleTimeString('en-US', { hour12: true })}</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live updates enabled
          </span>
        </div>
      </div>
    </div>
  );
};