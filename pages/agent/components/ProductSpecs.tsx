import {
  Bath,
  BedDouble,
  Briefcase,
  Car,
  Clock,
  Coffee,
  Mountain,
  Settings,
  Users,
} from 'lucide-react';
import React from 'react';
import { Product } from '../../../types';

type Props = { product: Product };

const ProductSpecs: React.FC<Props> = ({ product }) => {
  const d: any = product.details;
  if (!d) return null;

  if (d.type === 'stay') {
    return (
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 font-medium">
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <BedDouble className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          {d.beds} Beds
        </div>
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Bath className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          {d.bathrooms} Baths
        </div>
        {d.breakfastIncluded && (
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <Coffee className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            Breakfast
          </div>
        )}
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <span className="text-primary-600 font-bold mr-1.5 uppercase text-[10px]">
            {d.stayCategory}
          </span>
        </div>
      </div>
    );
  }

  if (d.type === 'tour') {
    return (
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 font-medium">
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          {d.duration}
        </div>
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Users className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          Max {d.groupSize}
        </div>
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Mountain className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          {d.difficulty}
        </div>
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <span className="text-primary-600 font-bold mr-1.5 uppercase text-[10px]">
            {d.tourCategory}
          </span>
        </div>
      </div>
    );
  }

  if (d.type === 'car') {
    return (
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 font-medium">
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Car className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          {d.seats} Seats
        </div>
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Settings className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          {d.transmission}
        </div>
        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Briefcase className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          {d.luggage} Bags
        </div>
        {d.year && (
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <span className="text-gray-600 font-bold text-[10px]">{d.year}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ProductSpecs;
