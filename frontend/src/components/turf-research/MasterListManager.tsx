import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turfResearchApi, Location, GrassType } from '../../api/turf-research';

interface MasterListManagerProps {
  type: 'location' | 'grassType';
  onClose: () => void;
}

export default function MasterListManager({ type, onClose }: MasterListManagerProps) {
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scientific_name: '',
  });
  const queryClient = useQueryClient();

  const title = type === 'location' ? 'Locations' : 'Grass Types';
  const queryKey = type === 'location' ? 'locations' : 'grassTypes';
  const apiMethod = type === 'location' ? 
    { get: turfResearchApi.getLocations, create: turfResearchApi.createLocation, update: turfResearchApi.updateLocation, delete: turfResearchApi.deleteLocation } :
    { get: turfResearchApi.getGrassTypes, create: turfResearchApi.createGrassType, update: turfResearchApi.updateGrassType, delete: turfResearchApi.deleteGrassType };

  const { data: items, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: apiMethod.get,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiMethod.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiMethod.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiMethod.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['plots'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      name: formData.name,
      description: formData.description,
    };

    if (type === 'grassType') {
      submitData.scientific_name = formData.scientific_name;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      scientific_name: item.scientific_name || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item? This may affect existing plots or treatments.')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', scientific_name: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Manage {title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {!showForm ? (
          <>
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-4 bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
            >
              Add New {type === 'location' ? 'Location' : 'Grass Type'}
            </button>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Array.isArray(items) && items.length > 0 ? (
                items.map((item: Location | GrassType) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purdue-gold transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {type === 'grassType' && 'scientific_name' in item && item.scientific_name && (
                          <p className="text-sm text-gray-600 italic">{item.scientific_name}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-purdue-gray hover:text-gray-900 font-semibold px-3 py-1 rounded border border-purdue-gray hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No {title.toLowerCase()} yet. Click "Add New" to get started.
                </p>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>

            {type === 'grassType' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Scientific Name
                </label>
                <input
                  type="text"
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <div className="text-red-600 text-sm">
                Error: {(createMutation.error || updateMutation.error)?.message || 'An error occurred'}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
