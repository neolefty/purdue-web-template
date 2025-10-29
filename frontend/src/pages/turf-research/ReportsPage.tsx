import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, Polygon } from '@react-google-maps/api';
import { turfResearchApi, Treatment } from '../../api/turf-research';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';

const defaultCenter = {
  lat: 40.4237,
  lng: -86.9212
};

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

export default function ReportsPage() {
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [expandedPlots, setExpandedPlots] = useState<Set<number>>(new Set());
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useGoogleMaps();
  
  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const response = await turfResearchApi.getPlots();
      return Array.isArray(response) ? response : (response as any).results || [];
    },
  });

  // Build hierarchy structure
  const buildHierarchy = () => {
    if (!plots || !Array.isArray(plots)) return [];
    
    const plotMap = new Map(plots.map((p: any) => [p.id, { ...p, children: [] as any[] }]));
    const rootPlots: any[] = [];
    
    plots.forEach((plot: any) => {
      const plotNode = plotMap.get(plot.id);
      if (plot.parent_plot) {
        const parent = plotMap.get(plot.parent_plot);
        if (parent) {
          parent.children.push(plotNode);
        }
      } else {
        rootPlots.push(plotNode);
      }
    });
    
    return rootPlots;
  };

  const hierarchy = buildHierarchy();

  const toggleExpand = (plotId: number) => {
    setExpandedPlots(prev => {
      const next = new Set(prev);
      if (next.has(plotId)) {
        next.delete(plotId);
      } else {
        next.add(plotId);
      }
      return next;
    });
  };

  const { data: treatments, isLoading: loadingTreatments } = useQuery({
    queryKey: ['plot-treatments', selectedPlotId],
    queryFn: () => {
      if (!selectedPlotId) return [];
      return turfResearchApi.getPlotTreatmentHistory(selectedPlotId);
    },
    enabled: !!selectedPlotId,
  });

  const selectedPlot = plots?.find((p: any) => p.id === selectedPlotId);

  const handlePlotClick = (plotId: number) => {
    setSelectedPlotId(plotId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'water':
        return '💧';
      case 'fertilizer':
        return '🌱';
      case 'chemical':
        return '🧪';
      case 'mowing':
        return '✂️';
      default:
        return '📝';
    }
  };

  const getTreatmentColor = (type: string) => {
    switch (type) {
      case 'water':
        return 'bg-blue-50 border-blue-200';
      case 'fertilizer':
        return 'bg-green-50 border-green-200';
      case 'chemical':
        return 'bg-purple-50 border-purple-200';
      case 'mowing':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Render plot tree recursively
  const renderPlotNode = (plotNode: any, depth: number = 0): JSX.Element => {
    const hasChildren = plotNode.children && plotNode.children.length > 0;
    const isExpanded = expandedPlots.has(plotNode.id);
    const isSelected = selectedPlotId === plotNode.id;
    
    return (
      <div key={plotNode.id}>
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
            isSelected
              ? 'bg-purdue-gold border-purdue-gold text-black font-semibold'
              : 'bg-white border-gray-200 hover:border-purdue-gold'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(plotNode.id);
              }}
              className="text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center flex-shrink-0"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-5 flex-shrink-0" />}
          
          <div 
            className="flex-1 min-w-0"
            onClick={() => handlePlotClick(plotNode.id)}
          >
            <div className="font-medium truncate">{plotNode.name}</div>
            {plotNode.location && (
              <div className="text-sm text-gray-600 truncate">{plotNode.location}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {plotNode.treatment_count} treatment{plotNode.treatment_count !== 1 ? 's' : ''}
              {hasChildren && ` · ${plotNode.children.length} sub-plot${plotNode.children.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {plotNode.children.map((child: any) => renderPlotNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Calculate map bounds to fit all plots
  const plotsWithCoords = plots?.filter((p: any) => p.center_lat && p.center_lng) || [];
  const mapRef = useRef<google.maps.Map | null>(null);

  // Pan and zoom to show all plots or selected plot
  const fitBoundsToPlots = (plotsToFit: any[]) => {
    if (!isLoaded || !mapRef.current || plotsToFit.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    let validPlots = 0;
    
    plotsToFit.forEach(plot => {
      // Safely parse coordinates
      const lat = typeof plot.center_lat === 'string' ? parseFloat(plot.center_lat) : Number(plot.center_lat);
      const lng = typeof plot.center_lng === 'string' ? parseFloat(plot.center_lng) : Number(plot.center_lng);
      
      // Validate coordinates are finite numbers
      if (isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
        bounds.extend({ lat, lng });
        validPlots++;
      }
    });
    
    if (validPlots === 0) return;
    
    mapRef.current.fitBounds(bounds);
    
    // If only one plot, zoom to it more closely
    if (validPlots === 1) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setZoom(19);
        }
      }, 100);
    }
  };

  // Fit bounds when plots load initially
  useEffect(() => {
    if (plotsWithCoords.length > 0 && isLoaded && mapRef.current) {
      setTimeout(() => fitBoundsToPlots(plotsWithCoords), 500);
    }
  }, [plots, isLoaded, mapRef.current]);

  // Fit bounds when plot is selected
  useEffect(() => {
    if (selectedPlot && isLoaded && mapRef.current) {
      setTimeout(() => fitBoundsToPlots([selectedPlot]), 300);
    }
  }, [selectedPlotId, isLoaded, mapRef.current]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900">Treatment Reports</h1>
        <div className="flex gap-2">
          <a
            href="/turf-research/reports/print"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Printable Reports
          </a>
          {selectedPlot && (
            <button
              onClick={handlePrint}
              className="bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print This Plot
            </button>
          )}
        </div>
      </div>

      <h1 className="hidden print:block text-3xl font-bold text-gray-900 mb-6">Treatment Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 print:hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plot Map</h2>
            {!apiKey ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800 font-semibold">
                  Google Maps not configured
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Select a plot from the list below to view its treatment history.
                </p>
              </div>
            ) : loadError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-semibold">Error loading Google Maps</p>
                <p className="text-sm text-red-700 mt-2">
                  {loadError.message || 'Failed to load map. Check your API key.'}
                </p>
              </div>
            ) : !isLoaded ? (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 h-96 flex items-center justify-center">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-gray-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">Loading map...</span>
                </div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={18}
                mapTypeId="satellite"
                onLoad={(map) => { 
                  mapRef.current = map;
                  if (plotsWithCoords.length > 0) {
                    setTimeout(() => fitBoundsToPlots(plotsWithCoords), 500);
                  }
                }}
                options={{
                  zoomControl: true,
                  zoomControlOptions: {
                    position: 3 // RIGHT_TOP
                  },
                  tilt: 0,
                  rotateControl: false
                }}
              >
                {Array.isArray(plots) && plots.map((plot) => {
                  if (!plot.polygon_coordinates?.coordinates) return null;
                  
                  return (
                    <Polygon
                      key={plot.id}
                      paths={plot.polygon_coordinates.coordinates[0].map((coord: number[]) => ({
                        lat: coord[1],
                        lng: coord[0]
                      }))}
                      onClick={() => handlePlotClick(plot.id)}
                      options={{
                        fillColor: selectedPlotId === plot.id ? '#B1810B' : '#FFD700',
                        fillOpacity: selectedPlotId === plot.id ? 0.6 : 0.4,
                        strokeWeight: selectedPlotId === plot.id ? 3 : 2,
                        strokeColor: selectedPlotId === plot.id ? '#B1810B' : '#FFD700',
                        clickable: true
                      }}
                    />
                  );
                })}
              </GoogleMap>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Click on a plot on the map or select from the list to view treatment history
            </p>
          </div>

          {/* Treatment History */}
          {selectedPlot && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6 print:shadow-none print:mt-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlot.name}</h2>
                  {selectedPlot.location && (
                    <p className="text-gray-600">{selectedPlot.location}</p>
                  )}
                  {selectedPlot.grass_type && (
                    <p className="text-sm text-gray-500">Grass Type: {selectedPlot.grass_type}</p>
                  )}
                  {selectedPlot.size_sqft && (
                    <p className="text-sm text-gray-500 print:block">Size: {selectedPlot.size_sqft} sq ft</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPlotId(null)}
                  className="text-gray-500 hover:text-gray-700 print:hidden"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Treatment History</h3>
              
              {loadingTreatments ? (
                <p className="text-gray-500">Loading treatments...</p>
              ) : Array.isArray(treatments) && treatments.length > 0 ? (
                <div className="space-y-3">
                  {treatments.map((treatment: Treatment) => (
                    <div
                      key={treatment.id}
                      className={`border rounded-lg p-4 ${getTreatmentColor(treatment.treatment_type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{getTreatmentIcon(treatment.treatment_type)}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {treatment.treatment_type.charAt(0).toUpperCase() + treatment.treatment_type.slice(1)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(treatment.date)}
                              {treatment.time && ` at ${treatment.time}`}
                            </p>
                            {treatment.applied_by_name && (
                              <p className="text-xs text-gray-500">
                                Applied by: {treatment.applied_by_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Treatment-specific details */}
                      <div className="mt-2 ml-11 text-sm text-gray-700">
                        {treatment.water_details && (
                          <p>Amount: {treatment.water_details.amount_inches} inches</p>
                        )}
                        {treatment.fertilizer_details && (
                          <p>
                            Product: {treatment.fertilizer_details.product_name}
                            {treatment.fertilizer_details.npk_ratio && ` (${treatment.fertilizer_details.npk_ratio})`}
                          </p>
                        )}
                        {treatment.chemical_details && (
                          <p>
                            Product: {treatment.chemical_details.product_name} 
                            ({treatment.chemical_details.chemical_type})
                          </p>
                        )}
                        {treatment.mowing_details && (
                          <p>Height: {treatment.mowing_details.height_inches} inches</p>
                        )}
                      </div>

                      {treatment.notes && (
                        <p className="mt-2 ml-11 text-sm text-gray-600 italic">
                          {treatment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No treatments recorded for this plot yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Plot List */}
        <div className="print:hidden">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Plots</h2>
            <div className="space-y-1">
              {hierarchy.length > 0 ? (
                hierarchy.map((plotNode: any) => renderPlotNode(plotNode, 0))
              ) : (
                <p className="text-gray-500 text-center py-4">No plots available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
