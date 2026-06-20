import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-gray-200 rounded-md ${className}`}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
    <Skeleton className="h-48 w-full rounded-2xl" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex justify-between pt-4">
      <Skeleton className="h-8 w-24 rounded-xl" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-gray-50">
    <td className="px-6 py-4"><Skeleton className="h-10 w-10 rounded-full inline-block mr-3" /><Skeleton className="h-4 w-32 inline-block" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></td>
  </tr>
);
