"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
}

interface LocationSearchProps {
  schoolId: string;
  onLocationSelect: (location: Location | null) => void;
  placeholder?: string;
  initialLocationId?: string;
  className?: string;
}

export function LocationSearch({ schoolId, onLocationSelect, placeholder = "Search locations...", initialLocationId, className }: LocationSearchProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId || '');

  // Fetch locations for the selected school
  useEffect(() => {
    if (!schoolId) {
      setLocations([]);
      setSelectedLocationId('');
      onLocationSelect(null);
      return;
    }

    const fetchLocations = async () => {
      setLoading(true);
      
      if (!schoolId) {
        setLocations([]);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/admin/schools/locations?schoolId=${schoolId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedLocations = data || []; // Admin API returns locations array directly
          setLocations(fetchedLocations);
          
          // If we have an initialLocationId, set the selected location
          if (initialLocationId) {
            const initialLocation = fetchedLocations.find((loc: Location) => loc.id === initialLocationId);
            if (initialLocation) {
              onLocationSelect(initialLocation);
            }
          }
        } else {
          setLocations([]);
        }
      } catch (error) {
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [schoolId]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    const selectedLocation = locations.find(loc => loc.id === locationId) || null;
    onLocationSelect(selectedLocation);
  };

  return (
    <div className="relative">
      <select
        value={selectedLocationId}
        onChange={(e) => handleLocationChange(e.target.value)}
        className={`w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${className || ''}`}
        disabled={!schoolId || loading}
      >
        <option value="">
          {loading ? 'Loading locations...' : placeholder}
        </option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
            {location.city && ` - ${location.city}`}
            {location.state && `, ${location.state}`}
          </option>
        ))}
      </select>
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
