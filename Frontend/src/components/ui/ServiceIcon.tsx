import React from 'react';
import { 
  CreditCard, 
  FileCheck, 
  Droplets, 
  Zap, 
  Truck, 
  Home, 
  Shield, 
  Briefcase, 
  Activity, 
  Wind, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';

export const ServiceIcon = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'CreditCard': return <CreditCard size={24} />;
    case 'FileCheck': return <FileCheck size={24} />;
    case 'Droplets': return <Droplets size={24} />;
    case 'Zap': return <Zap size={24} />;
    case 'Truck': return <Truck size={24} />;
    case 'Home': return <Home size={24} />;
    case 'Shield': return <Shield size={24} />;
    case 'Briefcase': return <Briefcase size={24} />;
    case 'Activity': return <Activity size={24} />;
    case 'Wind': return <Wind size={24} />;
    case 'AlertTriangle': return <AlertTriangle size={24} />;
    default: return <FileText size={24} />;
  }
};
