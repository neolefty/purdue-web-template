import { useCallback, useState, useRef } from 'react';
import { GoogleMap, useLoadScript, DrawingManager, Polygon } from '@react-google-maps/api';

interface MapPolygonDrawerProps {
  onPolygonComplete: (coordinates: any, center: { lat: number; lng: number }) => void;
  initialPolygon?: any;
  initialCenter?: { lat: number; lng: number };
}

const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"];

const defaultCenter = {
  lat: 40.4237, // Purdue University
  lng: -86.9212
};

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

export default function MapPolygonDrawer({ 
  onPolygonComplete, 
  initialPolygon,
  initialCenter 
}: MapPolygonDrawerProps) {
  const [polygon, setPolygon] = useState<any>(initialPolygon);
  const [center] = useState(initialCenter || defaultCenter);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: libraries as any,
  });

  const handlePolygonComplete = useCallback((newPolygon: google.maps.Polygon) => {
    // Remove old polygon if exists
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    
    polygonRef.current = newPolygon;
    
    const path = newPolygon.getPath();
    const coordinates = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      coordinates.push({
        lat: latLng.lat(),
        lng: latLng.lng()
      });
    }
    
    // Calculate center
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    const centerPoint = bounds.getCenter();
    
    const polygonData = {
      type: 'Polygon',
      coordinates: [coordinates.map(c => [c.lng, c.lat])]
    };
    
    setPolygon(polygonData);
    onPolygonComplete(polygonData, { lat: centerPoint.lat(), lng: centerPoint.lng() });
  }, [onPolygonComplete]);

  const handleClearPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setPolygon(null);
    onPolygonComplete(null, center);
  };

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
        {polygon && (
          <button
            type="button"
            onClick={handleClearPolygon}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear Polygon
          </button>
        )}
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={18}
        mapTypeId="satellite"
      >
        {!polygon && (
          <DrawingManager
            onPolygonComplete={handlePolygonComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
              },
              polygonOptions: {
                fillColor: '#FFD700',
                fillOpacity: 0.4,
                strokeWeight: 2,
                strokeColor: '#FFD700',
                clickable: true,
                editable: true,
                zIndex: 1
              }
            }}
          />
        )}
        {polygon && polygon.coordinates && (
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
      <p className="text-sm text-gray-500">
        Click the polygon tool above the map, then click on the map to draw the plot boundary. 
        Click the first point again to complete the polygon.
      </p>
    </div>
  );
}
