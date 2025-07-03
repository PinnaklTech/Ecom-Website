import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  ArrowLeft,
  Save,
  X,
  Menu,
  Eye,
  Star,
  ChevronDown,
  ChevronRight,
  Shield,
  User,
  Filter,
  Grid,
  List,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
}

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Appointment {
  id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  appointment_date: string;
  time?: string;
  status: string;
  notes: string;
  cart_items: CartItem[];
  total_amount: number;
  created_at?: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [customerViewMode, setCustomerViewMode] = useState<'grid' | 'table'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updatingFeaturedStatus, setUpdatingFeaturedStatus] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Rings', 'Necklaces', 'Earrings', 'Bracelets']));
  const [updatingAppointmentStatus, setUpdatingAppointmentStatus] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock_quantity: '',
  });

  // Category options for the dropdown
  const categoryOptions = [
    'Rings',
    'Necklaces',
    'Earrings',
    'Bracelets',
    'Pendants',
    'Chains',
    'Watches',
    'Accessories'
  ];

  // Filtered profiles based on search and filter
  const filteredProfiles = useMemo(() => {
    let filtered = profiles;

    // Apply user type filter
    if (customerFilter === 'admin') {
      filtered = filtered.filter(profile => profile.is_admin);
    } else if (customerFilter === 'customer') {
      filtered = filtered.filter(profile => !profile.is_admin);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.phone && profile.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [profiles, customerFilter, searchTerm]);

  // Categorized profiles
  const categorizedProfiles = useMemo(() => {
    const admins = filteredProfiles.filter(profile => profile.is_admin);
    const customers = filteredProfiles.filter(profile => !profile.is_admin);
    return { admins, customers };
  }, [filteredProfiles]);

  // Memoized categorized products for featured section
  const categorizedProducts = useMemo(() => {
    const activeProducts = products.filter(p => p.is_active);
    const categories: Record<string, Product[]> = {};
    
    // Initialize all categories
    categoryOptions.forEach(category => {
      categories[category] = [];
    });
    
    // Group products by category (case-insensitive matching)
    activeProducts.forEach(product => {
      // Find matching category (case-insensitive)
      const categoryKey = categoryOptions.find(cat => 
        cat.toLowerCase() === product.category.toLowerCase()
      );
      
      if (categoryKey) {
        categories[categoryKey].push(product);
      } else {
        // If no exact match found, try to match with the first letter capitalized
        const capitalizedCategory = product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase();
        if (categories[capitalizedCategory]) {
          categories[capitalizedCategory].push(product);
        }
      }
    });
    
    // Sort products within each category by name for consistency
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return categories;
  }, [products]);

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchData();
    
    // Setup realtime subscriptions with proper cleanup
    const productsChannel = supabase
      .channel('admin-products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Products table changed:', payload);
        fetchProducts();
      })
      .subscribe();

    // Add real-time subscription for appointments
    const appointmentsChannel = supabase
      .channel('admin-appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        console.log('Appointments table changed:', payload);
        fetchAppointments();
      })
      .subscribe();

    // Cleanup function to unsubscribe from channels
    return () => {
      console.log('Cleaning up admin panel subscriptions...');
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchAppointments(), fetchProfiles()]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('Fetched products with featured status:', data);
      setProducts(data || []);
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeaturedStatus: boolean) => {
    console.log('Toggling featured status for product:', productId, 'from:', currentFeaturedStatus, 'to:', !currentFeaturedStatus);
    
    // Add to updating set for loading state
    setUpdatingFeaturedStatus(prev => new Set(prev).add(productId));
    
    // Optimistic update - update local state immediately
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, is_featured: !currentFeaturedStatus }
          : product
      )
    );

    const { error } = await supabase
      .from('products')
      .update({ is_featured: !currentFeaturedStatus })
      .eq('id', productId);

    // Remove from updating set
    setUpdatingFeaturedStatus(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });

    if (error) {
      console.error('Error updating featured status:', error);
      
      // Revert optimistic update on error
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, is_featured: currentFeaturedStatus }
            : product
        )
      );
      
      toast({
        title: "Error updating featured status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('Successfully updated featured status');
      toast({
        title: "Featured status updated",
        description: `Product ${!currentFeaturedStatus ? 'added to' : 'removed from'} featured products.`,
      });
    }
  };

  const fetchAppointments = async () => {
    console.log('=== Starting fetchAppointments from Supabase ===');
    
    try {
      // Fetch appointments directly from Supabase
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments from Supabase:', appointmentsError);
        toast({
          title: "Error fetching appointments",
          description: appointmentsError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Raw appointments data from Supabase:', appointmentsData);

      // Process the appointments data and manually fetch profile information
      const processedAppointments = await Promise.all(
        (appointmentsData || []).map(async (appointment: any) => {
          console.log('Processing appointment:', appointment);
          
          let customerName = appointment.customer_name || 'Unknown Customer';
          let customerPhone = appointment.customer_phone || 'N/A';
          
          // Try to fetch profile information if user_id exists
          if (appointment.user_id) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name, phone')
                .eq('id', appointment.user_id)
                .maybeSingle();

              if (!profileError && profileData) {
                customerName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || customerName;
                customerPhone = profileData.phone || customerPhone;
              }
            } catch (profileError) {
              console.log('Could not fetch profile for user:', appointment.user_id, profileError);
            }
          }

          return {
            id: appointment.id,
            customer_name: customerName,
            customer_email: appointment.customer_email || 'N/A',
            customer_phone: customerPhone,
            appointment_date: appointment.appointment_date,
            status: appointment.status || 'pending',
            notes: appointment.notes || '',
            cart_items: appointment.cart_items || [],
            total_amount: appointment.total_amount || 0,
            created_at: appointment.created_at
          };
        })
      );

      console.log('Processed appointments:', processedAppointments);
      console.log('Total appointments found:', processedAppointments.length);
      
      setAppointments(processedAppointments);
      
      toast({
        title: "Appointments loaded",
        description: `Successfully loaded ${processedAppointments.length} appointments from database.`,
      });
      
    } catch (error) {
      console.error('Unexpected error in fetchAppointments:', error);
      toast({
        title: "Error fetching appointments",
        description: "An unexpected error occurred while fetching appointment data.",
        variant: "destructive",
      });
    }
  };

  const fetchProfiles = async () => {
    console.log('Fetching all user profiles...');
    
    try {
      // Get all profiles directly from the profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error fetching customer profiles",
          description: profilesError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Profiles data:', profilesData);

      // For each profile, try to get the email from auth.users using the RPC function
      const profilesWithEmail = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: userProfileData, error: userProfileError } = await supabase
            .rpc('get_user_profile', { user_id: profile.id });
          
          let email = 'N/A';
          if (!userProfileError && userProfileData && userProfileData.length > 0) {
            email = userProfileData[0].email || 'N/A';
          }

          return {
            id: profile.id,
            first_name: profile.first_name || 'Unknown',
            last_name: profile.last_name || 'User', 
            email: email,
            phone: profile.phone || 'N/A',
            is_admin: profile.is_admin || false,
            created_at: profile.created_at
          };
        })
      );

      console.log('Profiles with email:', profilesWithEmail);
      setProfiles(profilesWithEmail);
      
    } catch (error) {
      console.error('Unexpected error fetching profiles:', error);
      toast({
        title: "Error fetching customers",
        description: "An unexpected error occurred while fetching customer data.",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    const { error } = await supabase
      .from('products')
      .insert({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        image_url: productForm.image_url,
        stock_quantity: parseInt(productForm.stock_quantity),
      });

    if (error) {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product added successfully",
        description: `${productForm.name} has been added to the catalog.`,
      });
      setShowAddProduct(false);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        stock_quantity: '',
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        image_url: productForm.image_url,
        stock_quantity: parseInt(productForm.stock_quantity),
        is_active: editingProduct.is_active,
      })
      .eq('id', editingProduct.id);

    if (error) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product updated successfully",
        description: `${productForm.name} has been updated.`,
      });
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        stock_quantity: '',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product deleted successfully",
        description: "The product has been removed from the catalog.",
      });
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity.toString(),
    });
  };

  const startAddProduct = () => {
    setShowAddProduct(true);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      stock_quantity: '',
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowAddProduct(false);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      stock_quantity: '',
    });
  };

  // Status options for appointments
  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' }
  ];

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    console.log('Updating appointment status:', appointmentId, 'to:', newStatus);
    
    // Add to updating set for loading state
    setUpdatingAppointmentStatus(prev => new Set(prev).add(appointmentId));
    
    // Optimistic update - update local state immediately
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );

    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    // Remove from updating set
    setUpdatingAppointmentStatus(prev => {
      const newSet = new Set(prev);
      newSet.delete(appointmentId);
      return newSet;
    });

    if (error) {
      console.error('Error updating appointment status:', error);
      
      // Revert optimistic update on error
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: appointment.status }
            : appointment
        )
      );
      
      toast({
        title: "Error updating appointment status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('Successfully updated appointment status');
      toast({
        title: "Appointment status updated",
        description: `Appointment status changed to ${newStatus}.`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status.toLowerCase());
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status.toLowerCase());
    return statusOption ? statusOption.icon : AlertCircle;
  };

  // Calculate stats
  const stats = [
    { title: 'Total Products', value: products.length.toString(), icon: Package, color: 'bg-navy' },
    { title: 'Featured Products', value: products.filter(p => p.is_featured).length.toString(), icon: Star, color: 'bg-gold' },
    { title: 'Total Appointments', value: appointments.length.toString(), icon: ShoppingCart, color: 'bg-navy-light' },
    { title: 'Total Users', value: profiles.length.toString(), icon: Users, color: 'bg-navy-light' }
  ];

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative bg-white border border-gray-100 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-3 md:p-6 min-h-[100px] md:min-h-[120px] flex flex-col md:flex-row items-center"
          >
            {/* Icon */}
            <div className={`${stat.color} rounded-full p-2 md:p-3 mb-2 md:mb-0 md:mr-4 flex-shrink-0`}>
              <stat.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-lg md:text-2xl font-bold text-navy">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments - Mobile Optimized */}
      <Card className="bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl text-gray-900 font-playfair">Recent Appointments</CardTitle>
          <CardDescription className="text-sm">Latest 5 appointments</CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="space-y-3 md:space-y-4">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex flex-col space-y-2 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                      {appointment.customer_name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      {appointment.customer_email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">₹{appointment.total_amount?.toLocaleString('en-IN') || '0'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-lg md:text-xl lg:text-2xl font-playfair font-bold text-navy">Products</h2>
        <Button onClick={startAddProduct} className="bg-gold hover:bg-gold-dark text-white rounded-xl w-full sm:w-auto min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add/Edit Product Form - Mobile Optimized */}
      {(showAddProduct || editingProduct) && (
        <Card className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl md:rounded-2xl shadow-lg">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-navy font-playfair text-lg md:text-xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3 md:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm md:text-base">Product Name</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Enter product name"
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm md:text-base">Category</Label>
                <Select 
                  value={productForm.category} 
                  onValueChange={(value) => setProductForm({...productForm, category: value})}
                >
                  <SelectTrigger className="w-full min-h-[44px]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm md:text-base">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  placeholder="Enter price"
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm md:text-base">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                  placeholder="Enter stock quantity"
                  min="0"
                  className="min-h-[44px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm md:text-base">Image URL</Label>
              <Input
                id="image_url"
                value={productForm.image_url}
                onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                placeholder="Enter image URL"
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Enter product description"
                rows={3}
                className="min-h-[88px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="bg-gold hover:bg-gold-dark text-white min-h-[44px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button onClick={cancelEdit} variant="outline" className="min-h-[44px]">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Display - Mobile Responsive */}
      <Card className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl md:rounded-2xl shadow-lg">
        <CardContent className="p-0">
          {isMobile ? (
            // Mobile Card Layout
            <div className="p-4 space-y-4">
              {products.map((product) => (
                <Card key={product.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`transition-all duration-300 ${product.is_featured ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                            {product.is_featured && <Star className="h-4 w-4 text-gold fill-gold" />}
                          </div>
                          <h3 className="font-semibold text-navy text-base truncate">{product.name}</h3>
                        </div>
                        <p className="text-sm text-navy/60 mb-1">{product.category}</p>
                        <p className="font-semibold text-navy text-lg">₹{product.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-navy/60 mb-1">Stock</p>
                        <p className={`font-medium text-sm ${product.stock_quantity <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stock_quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-navy/60 mb-1">Status</p>
                        <Badge className={`text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-navy/60">Featured:</span>
                        <Switch
                          checked={product.is_featured}
                          onCheckedChange={() => handleToggleFeatured(product.id, product.is_featured)}
                          disabled={updatingFeaturedStatus.has(product.id)}
                          className={`data-[state=checked]:bg-gold transition-all duration-300 ${
                            updatingFeaturedStatus.has(product.id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => startEditProduct(product)}
                          className="bg-navy/10 text-navy hover:bg-navy hover:text-white p-3 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy/5">
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Product</TableHead>
                    <TableHead className="font-semibold text-navy hidden sm:table-cell text-sm md:text-base">Category</TableHead>
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Price</TableHead>
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Stock</TableHead>
                    <TableHead className="font-semibold text-navy hidden lg:table-cell text-sm md:text-base">Featured</TableHead>
                    <TableHead className="font-semibold text-navy hidden lg:table-cell text-sm md:text-base">Status</TableHead>
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-ivory/20 transition-all duration-300 group">
                      <TableCell className="p-2 md:p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`transition-all duration-300 ${product.is_featured ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                            {product.is_featured && <Star className="h-3 w-3 md:h-4 md:w-4 text-gold fill-gold" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-navy text-sm md:text-base truncate">{product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-navy/60 hidden sm:table-cell text-sm md:text-base">{product.category}</TableCell>
                      <TableCell className="font-semibold text-navy text-sm md:text-base">₹{product.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-navy/60 text-sm md:text-base">
                        <span className={`font-medium ${product.stock_quantity <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Switch
                          checked={product.is_featured}
                          onCheckedChange={() => handleToggleFeatured(product.id, product.is_featured)}
                          disabled={updatingFeaturedStatus.has(product.id)}
                          className={`data-[state=checked]:bg-gold transition-all duration-300 ${
                            updatingFeaturedStatus.has(product.id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className={product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2 md:p-4">
                        <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => startEditProduct(product)}
                            className="relative text-navy hover:text-gold hover:bg-gold/10 p-2 rounded-lg transform transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 min-h-[36px] min-w-[36px]"
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4 transition-transform duration-200" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="relative text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transform transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 min-h-[36px] min-w-[36px]"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 transition-transform duration-200" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderFeaturedProducts = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-lg md:text-xl lg:text-2xl font-playfair font-bold text-navy">Featured Products</h2>
        <div className="text-xs md:text-sm text-navy/60">
          {products.filter(p => p.is_featured).length} / 6 products featured
        </div>
      </div>

      <Card className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl md:rounded-2xl shadow-lg">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-navy font-playfair text-lg md:text-xl">Manage Featured Products</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Select up to 6 products to feature on your homepage. Products are organized by category for easier management.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="space-y-3 md:space-y-4">
            {Object.entries(categorizedProducts).map(([category, categoryProducts]) => {
              if (categoryProducts.length === 0) return null;
              
              const featuredCount = categoryProducts.filter(p => p.is_featured).length;
              const isExpanded = expandedCategories.has(category);
              
              return (
                <div key={category} className="border border-gray-200 rounded-lg md:rounded-xl overflow-hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCategoryExpansion(category)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer min-h-[56px]">
                        <div className="flex items-center space-x-3">
                          <div className="transition-transform duration-200">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-navy" />
                            ) : (
                              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-navy" />
                            )}
                          </div>
                          <h3 className="font-semibold text-navy text-base md:text-lg">{category}</h3>
                          <Badge variant="outline" className="text-xs">
                            {categoryProducts.length} products
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${featuredCount > 0 ? 'bg-gold text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {featuredCount} featured
                          </Badge>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="p-3 md:p-4 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                          {categoryProducts.map((product, index) => (
                            <div 
                              key={product.id} 
                              className={`transition-all duration-300 transform ${
                                product.is_featured ? 'ring-2 ring-gold bg-gold/5 scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'
                              }`}
                              style={{
                                transitionDelay: `${index * 50}ms`,
                                willChange: 'transform, box-shadow'
                              }}
                            >
                              <Card className="h-full">
                                <CardContent className="p-3 md:p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-navy text-xs md:text-sm mb-1 truncate">{product.name}</h4>
                                      <p className="text-xs text-navy/60 mb-2">{product.category}</p>
                                      <p className="font-semibold text-gold text-sm md:text-base">₹{product.price.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-2">
                                      <div className={`transition-all duration-300 ${
                                        product.is_featured ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                                      }`}>
                                        {product.is_featured && <Star className="h-3 w-3 md:h-4 md:w-4 text-gold fill-gold" />}
                                      </div>
                                      <Switch
                                        checked={product.is_featured}
                                        onCheckedChange={() => handleToggleFeatured(product.id, product.is_featured)}
                                        disabled={updatingFeaturedStatus.has(product.id)}
                                        className={`data-[state=checked]:bg-gold transition-all duration-300 ${
                                          updatingFeaturedStatus.has(product.id) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                      />
                                    </div>
                                  </div>
                                  {product.image_url && (
                                    <div className="w-full h-20 md:h-24 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                      <img 
                                        src={product.image_url} 
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                      />
                                    </div>
                                  )}
                                  {updatingFeaturedStatus.has(product.id) && (
                                    <div className="flex items-center justify-center py-2">
                                      <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-gold"></div>
                                      <span className="text-xs text-navy/60 ml-2">Updating...</span>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-lg md:text-xl lg:text-2xl font-playfair font-bold text-navy">Appointments</h2>
        <Button onClick={fetchAppointments} className="bg-gold hover:bg-gold-dark text-white rounded-xl min-h-[44px] w-full sm:w-auto">
          Refresh Data
        </Button>
      </div>

      <Card className="bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
        <CardContent className="p-0">
          {isMobile ? (
            // Mobile Card Layout
            <div className="p-4 space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-navy/60">
                  No appointments found. Click "Refresh Data" to reload.
                </div>
              ) : (
                appointments.map((appointment) => {
                  const StatusIcon = getStatusIcon(appointment.status);
                  return (
                    <Card key={appointment.id} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Customer Info */}
                          <div>
                            <h3 className="font-semibold text-navy text-base mb-1">
                              {appointment.customer_name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-navy/60 mb-1">
                              {appointment.customer_email || 'N/A'}
                            </p>
                            <p className="text-sm text-navy/50">
                              {appointment.customer_phone || 'N/A'}
                            </p>
                          </div>

                          {/* Date & Time */}
                          <div>
                            <p className="text-xs text-navy/60 mb-1">Appointment Date</p>
                            <p className="text-sm font-medium text-navy">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                              {appointment.time && ` at ${appointment.time}`}
                            </p>
                          </div>

                          {/* Items */}
                          <div>
                            <p className="text-xs text-navy/60 mb-1">Items</p>
                            {appointment.cart_items && appointment.cart_items.length > 0 ? (
                              <div className="space-y-1">
                                {appointment.cart_items.slice(0, 2).map((item, index) => (
                                  <p key={index} className="text-sm text-navy/80">
                                    {item.name} (×{item.quantity})
                                  </p>
                                ))}
                                {appointment.cart_items.length > 2 && (
                                  <p className="text-xs text-navy/60">
                                    +{appointment.cart_items.length - 2} more items
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-navy/60">No items</p>
                            )}
                          </div>

                          {/* Amount & Status */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-navy/60 mb-1">Total Amount</p>
                              <p className="font-semibold text-navy text-lg">
                                ₹{appointment.total_amount?.toLocaleString('en-IN') || '0'}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Select
                                value={appointment.status}
                                onValueChange={(value) => handleUpdateAppointmentStatus(appointment.id, value)}
                                disabled={updatingAppointmentStatus.has(appointment.id)}
                              >
                                <SelectTrigger className={`w-36 min-h-[44px] ${getStatusColor(appointment.status)} border-0`}>
                                  <div className="flex items-center space-x-2">
                                    <StatusIcon className="h-4 w-4" />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                                  {statusOptions.map((option) => {
                                    const OptionIcon = option.icon;
                                    return (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center space-x-2">
                                          <OptionIcon className="h-4 w-4" />
                                          <span>{option.label}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              {updatingAppointmentStatus.has(appointment.id) && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy/5">
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Customer</TableHead>
                    <TableHead className="font-semibold text-navy hidden sm:table-cell text-sm md:text-base">Date & Time</TableHead>
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Items</TableHead>
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Amount</TableHead>
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 md:py-8 text-navy/60 text-sm md:text-base">
                        No appointments found. Click "Refresh Data" to reload.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => {
                      const StatusIcon = getStatusIcon(appointment.status);
                      return (
                        <TableRow key={appointment.id} className="hover:bg-ivory/20 transition-colors">
                          <TableCell className="p-2 md:p-4">
                            <div className="min-w-0">
                              <div className="font-medium text-navy text-sm md:text-base truncate">
                                {appointment.customer_name || 'Unknown'}
                              </div>
                              <div className="text-xs md:text-sm text-navy/60 truncate">
                                {appointment.customer_email || 'N/A'}
                              </div>
                              <div className="text-xs text-navy/50 truncate">
                                {appointment.customer_phone || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-navy/80 text-sm md:text-base p-2 md:p-4">
                            <div>{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                            {appointment.time && (
                              <div className="text-xs md:text-sm text-navy/60">{appointment.time}</div>
                            )}
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <div className="max-w-xs">
                              {appointment.cart_items && appointment.cart_items.length > 0 ? (
                                <div className="space-y-1">
                                  {appointment.cart_items.slice(0, 2).map((item, index) => (
                                    <div key={index} className="text-xs md:text-sm text-navy/80 truncate">
                                      {item.name} (×{item.quantity})
                                    </div>
                                  ))}
                                  {appointment.cart_items.length > 2 && (
                                    <div className="text-xs text-navy/60">
                                      +{appointment.cart_items.length - 2} more items
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs md:text-sm text-navy/60">No items</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-navy text-sm md:text-base p-2 md:p-4">
                            ₹{appointment.total_amount?.toLocaleString('en-IN') || '0'}
                          </TableCell>
                          <TableCell className="p-2 md:p-4">
                            <div className="flex items-center space-x-2">
                              <Select
                                value={appointment.status}
                                onValueChange={(value) => handleUpdateAppointmentStatus(appointment.id, value)}
                                disabled={updatingAppointmentStatus.has(appointment.id)}
                              >
                                <SelectTrigger className={`w-32 min-h-[36px] ${getStatusColor(appointment.status)} border-0`}>
                                  <div className="flex items-center space-x-2">
                                    <StatusIcon className="h-3 w-3" />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                                  {statusOptions.map((option) => {
                                    const OptionIcon = option.icon;
                                    return (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center space-x-2">
                                          <OptionIcon className="h-3 w-3" />
                                          <span>{option.label}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              {updatingAppointmentStatus.has(appointment.id) && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl lg:text-2xl font-playfair font-bold text-navy mb-2">Customer Management</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-navy focus:ring-navy/20 rounded-xl min-h-[44px]"
              />
            </div>
            
            {/* Filter Select */}
            <Select value={customerFilter} onValueChange={(value: 'all' | 'admin' | 'customer') => setCustomerFilter(value)}>
              <SelectTrigger className="w-full sm:w-40 min-h-[44px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <Button
                variant={customerViewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCustomerViewMode('grid')}
                className={`rounded-none min-h-[44px] px-3 ${customerViewMode === 'grid' ? 'bg-navy text-white' : 'hover:bg-gray-100'}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={customerViewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCustomerViewMode('table')}
                className={`rounded-none min-h-[44px] px-3 ${customerViewMode === 'table' ? 'bg-navy text-white' : 'hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Button onClick={fetchProfiles} className="bg-gold hover:bg-gold-dark text-white rounded-xl min-h-[44px] w-full sm:w-auto">
          Refresh Data
        </Button>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 md:p-4 text-center">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-lg md:text-2xl font-bold text-purple-800">{categorizedProfiles.admins.length}</p>
            <p className="text-xs md:text-sm text-purple-600">Administrators</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 md:p-4 text-center">
            <User className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-lg md:text-2xl font-bold text-blue-800">{categorizedProfiles.customers.length}</p>
            <p className="text-xs md:text-sm text-blue-600">Customers</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
            <p className="text-lg md:text-2xl font-bold text-green-800">{filteredProfiles.length}</p>
            <p className="text-xs md:text-sm text-green-600">Filtered Results</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gold/20 to-gold/30 border-gold/40">
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-gold-dark mx-auto mb-2" />
            <p className="text-lg md:text-2xl font-bold text-gold-dark">{profiles.length}</p>
            <p className="text-xs md:text-sm text-gold-dark">Total Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Content */}
      {customerViewMode === 'grid' ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
            <TabsTrigger value="all" className="text-xs md:text-sm">All ({filteredProfiles.length})</TabsTrigger>
            <TabsTrigger value="admins" className="text-xs md:text-sm">Admins ({categorizedProfiles.admins.length})</TabsTrigger>
            <TabsTrigger value="customers" className="text-xs md:text-sm">Customers ({categorizedProfiles.customers.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className={`hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  profile.is_admin ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' : 'bg-white border-gray-200'
                }`}>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`p-2 rounded-full ${
                            profile.is_admin ? 'bg-purple-200' : 'bg-blue-200'
                          }`}>
                            {profile.is_admin ? (
                              <Shield className="h-4 w-4 text-purple-600" />
                            ) : (
                              <User className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <Badge className={`text-xs ${
                            profile.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.is_admin ? 'Admin' : 'Customer'}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-navy text-sm md:text-base mb-1 truncate">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        
                        <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">
                          {profile.email}
                        </p>
                        
                        <p className="text-xs text-gray-500 mb-2">
                          {profile.phone || 'No phone number'}
                        </p>
                        
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="admins" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {categorizedProfiles.admins.map((profile) => (
                <Card key={profile.id} className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-2 rounded-full bg-purple-200">
                            <Shield className="h-4 w-4 text-purple-600" />
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            Administrator
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-navy text-sm md:text-base mb-1 truncate">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        
                        <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">
                          {profile.email}
                        </p>
                        
                        <p className="text-xs text-gray-500 mb-2">
                          {profile.phone || 'No phone number'}
                        </p>
                        
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {categorizedProfiles.customers.map((profile) => (
                <Card key={profile.id} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-2 rounded-full bg-blue-200">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            Customer
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-navy text-sm md:text-base mb-1 truncate">
                          {profile.first_name} {profile.last_name}
                        </h3>
                        
                        <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">
                          {profile.email}
                        </p>
                        
                        <p className="text-xs text-gray-500 mb-2">
                          {profile.phone || 'No phone number'}
                        </p>
                        
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl md:rounded-2xl shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy/5">
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Name</TableHead>
                    <TableHead className="font-semibold text-navy hidden sm:table-cell text-sm md:text-base">Email</TableHead>
                    <TableHead className="font-semibold text-navy hidden lg:table-cell text-sm md:text-base">Phone</TableHead>
                    <TableHead className="font-semibold text-navy hidden lg:table-cell text-sm md:text-base">Joined</TableHead>
                    <TableHead className="font-semibold text-navy text-sm md:text-base">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 md:py-8 text-navy/60 text-sm md:text-base">
                        No customers found. Try adjusting your search or filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id} className="hover:bg-ivory/20 transition-colors">
                        <TableCell className="font-medium text-navy p-2 md:p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-1.5 md:p-2 rounded-full ${
                              profile.is_admin ? 'bg-purple-200' : 'bg-blue-200'
                            }`}>
                              {profile.is_admin ? (
                                <Shield className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                              ) : (
                                <User className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm md:text-base font-medium truncate">
                                {profile.first_name} {profile.last_name}
                              </div>
                              {isMobile && (
                                <div className="text-xs text-navy/60 mt-1 truncate">
                                  {profile.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-navy/80 hidden sm:table-cell text-sm md:text-base p-2 md:p-4">
                          <div className="truncate">{profile.email}</div>
                        </TableCell>
                        <TableCell className="text-navy/60 hidden lg:table-cell text-sm md:text-base p-2 md:p-4">
                          {profile.phone || 'N/A'}
                        </TableCell>
                        <TableCell className="text-navy/60 hidden lg:table-cell text-sm md:text-base p-2 md:p-4">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="p-2 md:p-4">
                          <Badge className={`text-xs ${
                            profile.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.is_admin ? 'Admin' : 'Customer'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Package },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'featured', label: 'Featured Products', icon: Star },
    { id: 'appointments', label: 'Appointments', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center space-x-3 md:space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-700 hover:text-navy lg:hidden min-h-[48px] min-w-[48px] p-3"
                >
                  <Menu className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              )}
              {!isMobile && (
                <>
                  <Link to="/" className="flex items-center text-gray-700 hover:text-navy transition-colors min-h-[40px]">
                    <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                    <span className="font-medium text-sm md:text-base">Back to Site</span>
                  </Link>
                  <div className="h-4 md:h-6 border-l border-gray-300"></div>
                </>
              )}
              <h1 className="text-base md:text-lg lg:text-2xl font-playfair font-bold text-gray-900">Zaffira Admin</h1>
            </div>
            {/* <div className="flex items-center space-x-2 md:space-x-4">
              {!isMobile && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48 md:w-64 border-gray-300 focus:border-navy focus:ring-navy/20 rounded-xl min-h-[40px]"
                  />
                </div>
              )}
              <div className="h-6 w-6 md:h-8 md:w-8 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs md:text-sm">A</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 xl:px-8 py-3 md:py-4 lg:py-8">
        <div className="flex">
          {/* Mobile Navigation Overlay */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar - Mobile Optimized */}
          <div className={`${
            isMobile 
              ? `fixed left-0 top-0 h-full w-64 bg-white z-40 transform transition-transform duration-300 ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0`
              : 'w-64 flex-shrink-0'
          }`}>
            <Card className={`bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-lg ${
              isMobile ? 'h-full rounded-none' : 'sticky top-20 md:top-24'
            }`}>
              <CardContent className="p-3 md:p-4">
                {isMobile && (
                  <div className="flex justify-between items-center mb-4 md:mb-6 pt-16">
                    <h2 className="text-base md:text-lg font-playfair font-bold text-gray-900">Menu</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-700 hover:text-navy min-h-[40px] min-w-[40px] p-2"
                    >
                      <X className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                )}
                <nav className="space-y-1 md:space-y-2">
                  {/* Back to Site button - Mobile only */}
                  {isMobile && (
                    <Link
                      to="/"
                      onClick={() => setSidebarOpen(false)}
                      className="w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all duration-200 min-h-[44px] text-gray-700 hover:bg-navy/10 hover:text-navy border-b border-gray-200 mb-2"
                    >
                      <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">Back to Site</span>
                    </Link>
                  )}
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all duration-200 min-h-[44px] ${
                        activeTab === tab.id
                          ? 'bg-navy text-white shadow-md'
                          : 'text-gray-700 hover:bg-navy/10 hover:text-navy'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm md:text-base">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Mobile Optimized */}
          <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-4 md:ml-8'}`}>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'featured' && renderFeaturedProducts()}
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'customers' && renderCustomers()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
