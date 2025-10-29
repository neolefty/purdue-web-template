import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, Polygon } from '@react-google-maps/api';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';

interface MapPolygonDrawerProps {
  onPolygonComplete: (coordinates: any, center: { lat: number; lng: number }) => void;
  initialPolygon?: any;
  initialCenter?: { lat: number; lng: number };
}

const defaultCenter = {
  lat: 40.4237, // Purdue University
  lng: -86.9212
};

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

export default function MapPolygonDrawerV2({ 
  onPolygonComplete, 
  initialPolygon,
  initialCenter 
}: MapPolygonDrawerProps) {
  const [polygon, setPolygon] = useState<any>(initialPolygon);
  const [center, setCenter] = useState(initialCenter || defaultCenter);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{lat: number; lng: number}[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useGoogleMaps();

  // Update polygon when initialPolygon changes (for editing)
  useEffect(() => {
    if (initialPolygon) {
      setPolygon(initialPolygon);
    }
  }, [initialPolygon]);

  // Update center when initialCenter changes (for editing)
  useEffect(() => {
    if (initialCenter && 
        typeof initialCenter.lat === 'number' && 
        typeof initialCenter.lng === 'number' &&
        isFinite(initialCenter.lat) && 
        isFinite(initialCenter.lng) &&
        Math.abs(initialCenter.lat) <= 90 &&
        Math.abs(initialCenter.lng) <= 180) {
      const validCenter = {
        lat: Number(initialCenter.lat),
        lng: Number(initialCenter.lng)
      };
      setCenter(validCenter);
      // Pan map to new center
      if (mapRef.current) {
        mapRef.current.panTo(validCenter);
      }
    }
  }, [initialCenter]);

  // Clean up listeners
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(listener => listener.remove());
    };
  }, []);

  const calculateCenter = (coords: {lat: number; lng: number}[]) => {
    if (coords.length === 0) return center;
    
    const bounds = new google.maps.LatLngBounds();
    coords.forEach(coord => bounds.extend(coord));
    const centerPoint = bounds.getCenter();
    
    return { lat: centerPoint.lat(), lng: centerPoint.lng() };
  };

  const completePolygon = useCallback((coords: {lat: number; lng: number}[]) => {
    if (coords.length < 3) {
      alert('A polygon needs at least 3 points');
      return;
    }

    const centerPoint = calculateCenter(coords);
    
    // Round coordinates to 8 decimal places to match Django DecimalField
    // lat: max_digits=11, decimal_places=8 (e.g., -90.12345678)
    // lng: max_digits=12, decimal_places=8 (e.g., -180.12345678)
    const lat = Number(centerPoint.lat.toFixed(8));
    const lng = Number(centerPoint.lng.toFixed(8));
    
    if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      alert('Invalid coordinates calculated. Please try drawing the polygon again.');
      return;
    }
    
    const roundedCenter = { lat, lng };
    
    const polygonData = {
      type: 'Polygon',
      coordinates: [coords.map(c => [
        Number(c.lng.toFixed(8)),
        Number(c.lat.toFixed(8))
      ])]
    };
    
    setPolygon(polygonData);
    setCenter(roundedCenter);
    setIsDrawing(false);
    setPoints([]);
    onPolygonComplete(polygonData, roundedCenter);
  }, [onPolygonComplete]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isDrawing || !e.latLng) return;
    
    const newPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    // Check if clicking near first point to close polygon
    if (points.length >= 3) {
      const firstPoint = points[0];
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(firstPoint),
        e.latLng
      );
      
      // If within 10 meters of first point, complete the polygon
      if (distance < 10) {
        completePolygon(points);
        return;
      }
    }
    
    setPoints(prev => [...prev, newPoint]);
  }, [isDrawing, points, completePolygon]);

  const startDrawing = () => {
    setIsDrawing(true);
    setPoints([]);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setPoints([]);
  };

  const handleClearPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setPolygon(null);
    setPoints([]);
    setIsDrawing(false);
    onPolygonComplete(null, center);
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800 font-semibold">
          Google Maps API key not configured
        </p>
        <p className="text-sm text-yellow-700 mt-2">
          To enable mapping features:
        </p>
        <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal">
          <li>Get an API key from <a href="https://console.cloud.google.com/google/maps-apis/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
          <li>Create <code className="bg-yellow-100 px-1">frontend/.env</code> file</li>
          <li>Add: <code className="bg-yellow-100 px-1">VITE_GOOGLE_MAPS_API_KEY=your_key</code></li>
          <li>Restart frontend: <code className="bg-yellow-100 px-1">docker compose restart frontend</code></li>
        </ol>
        <p className="text-sm text-yellow-600 mt-3">
          You can still create plots without mapping functionality.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800 font-semibold">Error loading Google Maps</p>
        <p className="text-sm text-red-700 mt-2">
          {loadError.message || 'Failed to load Google Maps. Please check your API key and try again.'}
        </p>
        <p className="text-sm text-red-600 mt-2">
          Common issues:
        </p>
        <ul className="text-sm text-red-600 mt-1 ml-4 list-disc">
          <li>Invalid API key</li>
          <li>API key restrictions blocking localhost</li>
          <li>Maps JavaScript API not enabled in Google Cloud Console</li>
          <li>Billing not enabled on Google Cloud account</li>
        </ul>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-gray-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading Google Maps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-gray-700 font-semibold">Draw Plot Boundary</label>
        <div className="flex gap-2">
          {!polygon && !isDrawing && (
            <button
              type="button"
              onClick={startDrawing}
              className="text-sm bg-purdue-gold hover:bg-yellow-600 text-black font-semibold px-3 py-1 rounded"
            >
              Start Drawing
            </button>
          )}
          {isDrawing && (
            <>
              <button
                type="button"
                onClick={() => completePolygon(points)}
                disabled={points.length < 3}
                className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded disabled:opacity-50"
              >
                Complete ({points.length} points)
              </button>
              <button
                type="button"
                onClick={cancelDrawing}
                className="text-sm bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-1 rounded"
              >
                Cancel
              </button>
            </>
          )}
          {polygon && !isDrawing && (
            <button
              type="button"
              onClick={handleClearPolygon}
              className="text-sm text-red-600 hover:text-red-800 font-semibold"
            >
              Clear Polygon
            </button>
          )}
        </div>
      </div>
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={18}
        mapTypeId="satellite"
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          tilt: 0,
        }}
      >
        {/* Current drawing points */}
        {isDrawing && points.length > 0 && (
          <>
            {/* Draw lines between points */}
            <Polygon
              paths={points}
              options={{
                strokeColor: '#FFD700',
                strokeWeight: 2,
                strokeOpacity: 1,
                fillOpacity: 0,
              }}
            />
            {/* Show markers for each point */}
            {points.map((_point, index) => (
              <div key={index} style={{
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: index === 0 ? '#00FF00' : '#FFD700',
                  border: '2px solid white',
                }}/>
              </div>
            ))}
          </>
        )}
        
        {/* Completed polygon */}
        {polygon && polygon.coordinates && !isDrawing && (
          <Polygon
            paths={polygon.coordinates[0].map((coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            }))}
            options={{
              fillColor: '#FFD700',
              fillOpacity: 0.4,
              strokeWeight: 2,
              strokeColor: '#FFD700'
            }}
          />
        )}
      </GoogleMap>
      
      <div className="text-sm text-gray-500">
        {!polygon && !isDrawing && (
          <p>Click "Start Drawing" to begin. This uses a non-deprecated drawing method.</p>
        )}
        {isDrawing && points.length === 0 && (
          <p>Click on the map to add points for your plot boundary.</p>
        )}
        {isDrawing && points.length > 0 && points.length < 3 && (
          <p>Add at least {3 - points.length} more point{3 - points.length > 1 ? 's' : ''} to complete the polygon.</p>
        )}
        {isDrawing && points.length >= 3 && (
          <p>Click near the first point (green) to close the polygon, or click "Complete" button above.</p>
        )}
        {polygon && (
          <p className="text-green-600">✓ Polygon saved. You can clear it and draw a new one if needed.</p>
        )}
      </div>
    </div>
  );
}
