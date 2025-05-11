import supabase from '../lib/supabase';
import { Item, QueryParams, PaginatedResponse } from '../types/common.types';

export const getItems = async (params?: QueryParams): Promise<PaginatedResponse<Item>> => {
  try {
    // Start building the query
    let query = supabase
      .from('items')
      .select('*, item_categories(name), units(name, conversion_to_base)', { count: 'exact' });
    
    // Apply filters
    if (params?.filters) {
      params.filters.forEach(filter => {
        if (filter.operator === 'like' || filter.operator === 'ilike') {
          query = query.filter(filter.field, filter.operator, `%${filter.value}%`);
        } else {
          query = query.filter(filter.field, filter.operator || 'eq', filter.value);
        }
      });
    }
    
    // Apply sorting
    if (params?.sort) {
      query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }
    
    // Apply pagination
    const page = params?.pagination?.page || 1;
    const pageSize = params?.pagination?.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match our Item type
    const items = data.map(item => ({
      ...item,
      category: item.item_categories,
      unit: item.units,
    })) as Item[];
    
    return {
      data: items,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

export const getItemById = async (id: string): Promise<Item> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*, item_categories(name), units(name, conversion_to_base)')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match our Item type
    const item = {
      ...data,
      category: data.item_categories,
      unit: data.units,
    } as Item;
    
    // Get current stock
    const { data: stockData } = await supabase.rpc('calculate_stock', {
      p_item_id: id,
      p_warehouse_id: null, // null to get total stock across all warehouses
    });
    
    item.current_stock = stockData || 0;
    
    return item;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
};

export const createItem = async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Item;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, item: Partial<Item>): Promise<Item> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .update({
        ...item,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Item;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const getItemCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('item_categories')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching item categories:', error);
    throw error;
  }
};

export const getUnits = async () => {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

export const uploadItemImage = async (file: File, itemId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      throw uploadError;
    }
    
    const { data } = supabase.storage.from('item-images').getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};