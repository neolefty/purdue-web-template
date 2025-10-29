import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { turfResearchApi, Treatment } from '../../api/turf-research';
import TreatmentForm from '../../components/turf-research/TreatmentForm';

export default function TreatmentsPage() {
  const { plotId } = useParams<{ plotId?: string }>();
  const [showForm, setShowForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: treatments, isLoading, error } = useQuery({
    queryKey: ['treatments', plotId, filterType],
    queryFn: async () => {
      const params: any = {};
      if (plotId) params.plot = parseInt(plotId);
      if (filterType) params.treatment_type = filterType;
      const response = await turfResearchApi.getTreatments(params);
      // Handle both paginated and non-paginated responses
      return Array.isArray(response) ? response : (response as any).results || [];
    },
  });

  const { data: plot } = useQuery({
    queryKey: ['plot', plotId],
    queryFn: () => {
      if (!plotId) return null;
      return turfResearchApi.getPlot(parseInt(plotId));
    },
    enabled: !!plotId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => turfResearchApi.deleteTreatment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
  });

  const handleEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTreatment(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getTreatmentDetails = (treatment: Treatment) => {
    switch (treatment.treatment_type) {
      case 'water':
        return treatment.water_details ? (
          <div className="text-sm text-gray-600">
            <p>Amount: {treatment.water_details.amount_inches} inches</p>
            {treatment.water_details.duration_minutes && (
              <p>Duration: {treatment.water_details.duration_minutes} minutes</p>
            )}
            {treatment.water_details.method && <p>Method: {treatment.water_details.method}</p>}
          </div>
        ) : null;
      case 'fertilizer':
        return treatment.fertilizer_details ? (
          <div className="text-sm text-gray-600">
            <p>Product: {treatment.fertilizer_details.product_name}</p>
            {treatment.fertilizer_details.npk_ratio && (
              <p>NPK: {treatment.fertilizer_details.npk_ratio}</p>
            )}
            <p>Amount: {treatment.fertilizer_details.amount} {treatment.fertilizer_details.amount_unit}</p>
          </div>
        ) : null;
      case 'chemical':
        return treatment.chemical_details ? (
          <div className="text-sm text-gray-600">
            <p>Type: {treatment.chemical_details.chemical_type}</p>
            <p>Product: {treatment.chemical_details.product_name}</p>
            <p>Amount: {treatment.chemical_details.amount} {treatment.chemical_details.amount_unit}</p>
          </div>
        ) : null;
      case 'mowing':
        return treatment.mowing_details ? (
          <div className="text-sm text-gray-600">
            <p>Height: {treatment.mowing_details.height_inches} inches</p>
            <p>Clippings Removed: {treatment.mowing_details.clippings_removed ? 'Yes' : 'No'}</p>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading treatments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading treatments: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {plot ? `Treatments for ${plot.name}` : 'All Treatments'}
            </h1>
            {plot && plot.location && (
              <p className="text-gray-600 mt-1">Location: {plot.location}</p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
          >
            Add Treatment
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <label className="text-gray-700 font-semibold">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="water">Water</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="chemical">Chemical</option>
            <option value="mowing">Mowing</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <TreatmentForm
            treatment={editingTreatment}
            defaultPlotId={plotId ? parseInt(plotId) : undefined}
            onClose={handleCloseForm}
          />
        </div>
      )}

      <div className="space-y-4">
        {Array.isArray(treatments) && treatments.map((treatment) => (
          <div key={treatment.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {treatment.treatment_type.charAt(0).toUpperCase() + treatment.treatment_type.slice(1)}
                </h2>
                <p className="text-gray-600">
                  Plots: {treatment.plot_names.join(', ')}
                </p>
                <p className="text-gray-600">
                  Date: {formatDate(treatment.date)}
                  {treatment.time && ` at ${treatment.time}`}
                </p>
                {treatment.applied_by_name && (
                  <p className="text-gray-600">Applied by: {treatment.applied_by_name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(treatment)}
                  className="bg-purdue-gray hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(treatment.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            {getTreatmentDetails(treatment)}

            {treatment.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{treatment.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {treatments?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No treatments found. Click "Add Treatment" to get started.
        </div>
      )}
    </div>
  );
}
