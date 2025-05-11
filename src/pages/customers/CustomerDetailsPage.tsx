import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const supabase = useSupabaseClient<Database>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCustomer();
    }
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{customer.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Contact Information</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Contact Name:</span> {customer.contact_name || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Phone:</span> {customer.phone || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {customer.email || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span> {customer.address || 'N/A'}
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Business Details</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Customer Type:</span>{' '}
                  <span className="capitalize">{customer.customer_type}</span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">VAT Number:</span> {customer.vat_number || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Credit Limit:</span>{' '}
                  {customer.credit_limit ? `$${customer.credit_limit.toFixed(2)}` : 'N/A'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`${customer.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Additional Information</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Created:</span>{' '}
                {new Date(customer.created_at).toLocaleDateString()}
              </p>
              {customer.updated_at && (
                <p className="text-gray-600">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(customer.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}