import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import supabase from '../../lib/supabase'; // Use default import
import type { Database } from '../../types/database.types';

type Item = Database['public']['Tables']['items']['Row'];

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchItem();
    } else {
      setLoading(false);
    }
  }, [id]);

  async function fetchItem() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setItem(data);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/items')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {id === 'new' ? 'New Item' : item?.name}
          </h1>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          Save Changes
        </button>
      </div>

      {/* Placeholder for item form */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Item details form will be implemented here</p>
      </div>
    </div>
  );
}