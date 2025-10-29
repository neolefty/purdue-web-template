import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { turfResearchApi, Plot, CreatePlotData } from '../../api/turf-research';
import MapPolygonDrawer from './MapPolygonDrawerV2';

interface PlotFormProps {
  plot?: Plot | null;
  onClose: () => void;
}

export default function PlotForm({ plot, onClose }: PlotFormProps) {
  const [formData, setFormData] = useState<CreatePlotData>({
    name: '',
    parent_plot: null,
    location: '',
    size_sqft: undefined,
    grass_type: '',
    notes: '',
    polygon_coordinates: null,
    center_lat: undefined,
    center_lng: undefined,
  });
  const [validationError, setValidationError] = useState<string>('');
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [showNewGrassType, setShowNewGrassType] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newGrassTypeName, setNewGrassTypeName] = useState('');

  const queryClient = useQueryClient();

  // Fetch all plots for parent selection
  const { data: allPlots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const response = await turfResearchApi.getPlots();
      return Array.isArray(response) ? response : (response as any).results || [];
    },
  });

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: turfResearchApi.getLocations,
  });

  const locations = Array.isArray(locationsData) ? locationsData : [];

  // Fetch grass types
  const { data: grassTypesData } = useQuery({
    queryKey: ['grassTypes'],
    queryFn: turfResearchApi.getGrassTypes,
  });

  const grassTypes = Array.isArray(grassTypesData) ? grassTypesData : [];

  // Quick-add location
  const createLocationMutation = useMutation({
    mutationFn: (name: string) => turfResearchApi.createLocation({ name }),
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setFormData({ ...formData, location: newLocation.name });
      setShowNewLocation(false);
      setNewLocationName('');
    },
  });

  // Quick-add grass type
  const createGrassTypeMutation = useMutation({
    mutationFn: (name: string) => turfResearchApi.createGrassType({ name }),
    onSuccess: (newGrassType) => {
      queryClient.invalidateQueries({ queryKey: ['grassTypes'] });
      setFormData({ ...formData, grass_type: newGrassType.name });
      setShowNewGrassType(false);
      setNewGrassTypeName('');
    },
  });

  useEffect(() => {
    if (plot) {
      setFormData({
        name: plot.name,
        parent_plot: plot.parent_plot,
        location: plot.location,
        size_sqft: plot.size_sqft || undefined,
        grass_type: plot.grass_type,
        notes: plot.notes,
        polygon_coordinates: plot.polygon_coordinates,
        center_lat: plot.center_lat || undefined,
        center_lng: plot.center_lng || undefined,
      });
    }
  }, [plot]);

  const createMutation = useMutation({
    mutationFn: (data: CreatePlotData) => turfResearchApi.createPlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreatePlotData) => turfResearchApi.updatePlot(plot!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate coordinates before submission
    if (!formData.center_lat || !formData.center_lng || !formData.polygon_coordinates) {
      setValidationError('Please draw the plot boundary on the map before saving.');
      return;
    }
    
    setValidationError('');
    
    if (plot) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'size_sqft' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handlePolygonComplete = (coordinates: any, center: { lat: number; lng: number }) => {
    // Validate and format coordinates
    if (coordinates && center && 
        typeof center.lat === 'number' && 
        typeof center.lng === 'number' &&
        isFinite(center.lat) && 
        isFinite(center.lng) &&
        Math.abs(center.lat) <= 90 &&
        Math.abs(center.lng) <= 180) {
      // Round to 8 decimal places to match Django DecimalField
      // lat: max_digits=11, decimal_places=8
      // lng: max_digits=12, decimal_places=8
      setFormData((prev) => ({
        ...prev,
        polygon_coordinates: coordinates,
        center_lat: Number(center.lat.toFixed(8)),
        center_lng: Number(center.lng.toFixed(8)),
      }));
      setValidationError('');
    } else if (coordinates === null) {
      // Clearing polygon
      setFormData((prev) => ({
        ...prev,
        polygon_coordinates: null,
        center_lat: undefined,
        center_lng: undefined,
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {plot ? 'Edit Plot' : 'Create New Plot'}
      </h2>
      <form onSubmit={handleSubmit}>
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 text-sm">{validationError}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Parent Plot</label>
            <select
              name="parent_plot"
              value={formData.parent_plot || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                parent_plot: e.target.value ? parseInt(e.target.value) : null
              }))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
            >
              <option value="">No Parent (Top Level Plot)</option>
              {Array.isArray(allPlots) && allPlots.filter(p => p.id !== plot?.id).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.hierarchy_display || p.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select a parent plot to make this a sub-plot
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Location</label>
            {!showNewLocation ? (
              <div className="flex gap-2">
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
                >
                  <option value="">Select a location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewLocation(true)}
                  className="bg-purdue-gray hover:bg-gray-700 text-white font-semibold px-3 py-2 rounded"
                  title="Add new location"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="New location name"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
                />
                <button
                  type="button"
                  onClick={() => createLocationMutation.mutate(newLocationName)}
                  disabled={!newLocationName || createLocationMutation.isPending}
                  className="bg-purdue-gold hover:bg-yellow-600 text-black font-semibold px-3 py-2 rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewLocation(false);
                    setNewLocationName('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-3 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Size (sq ft)</label>
            <input
              type="number"
              name="size_sqft"
              value={formData.size_sqft || ''}
              onChange={handleChange}
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Grass Type</label>
            {!showNewGrassType ? (
              <div className="flex gap-2">
                <select
                  name="grass_type"
                  value={formData.grass_type}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
                >
                  <option value="">Select a grass type...</option>
                  {grassTypes.map((gt) => (
                    <option key={gt.id} value={gt.name}>
                      {gt.name}
                      {gt.scientific_name && ` (${gt.scientific_name})`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewGrassType(true)}
                  className="bg-purdue-gray hover:bg-gray-700 text-white font-semibold px-3 py-2 rounded"
                  title="Add new grass type"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGrassTypeName}
                  onChange={(e) => setNewGrassTypeName(e.target.value)}
                  placeholder="New grass type name"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
                />
                <button
                  type="button"
                  onClick={() => createGrassTypeMutation.mutate(newGrassTypeName)}
                  disabled={!newGrassTypeName || createGrassTypeMutation.isPending}
                  className="bg-purdue-gold hover:bg-yellow-600 text-black font-semibold px-3 py-2 rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewGrassType(false);
                    setNewGrassTypeName('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-3 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
            />
          </div>

          <div className="md:col-span-2">
            <MapPolygonDrawer
              onPolygonComplete={handlePolygonComplete}
              initialPolygon={formData.polygon_coordinates}
              initialCenter={
                formData.center_lat && formData.center_lng
                  ? { lat: formData.center_lat, lng: formData.center_lng }
                  : undefined
              }
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : plot ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
