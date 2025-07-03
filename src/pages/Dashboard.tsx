import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Phone, Mail, User as UserIcon, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  cartItems: CartItem[];
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string | null;
  createdAt: string;
  totalAmount: number;
}

const Dashboard = () => {
  const { user } = useAuth();

  const { data: appointments, isLoading, error, refetch } = useQuery({
    queryKey: ['user-appointments', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        return [];
      }
      
      console.log('Fetching appointments for user:', user._id);
      
      const data = await DatabaseService.getAppointmentsByUserId(user._id);

      console.log('User appointments found:', data?.length || 0);
      return data as Appointment[];
    },
    enabled: !!user?._id,
  });

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getServiceType = (cartItems: CartItem[]) => {
    if (!cartItems || cartItems.length === 0) return 'Consultation';
    if (cartItems.length === 1) return cartItems[0].name;
    return `${cartItems.length} items consultation`;
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-gold/10">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-navy mb-2">Dashboard</h1>
            <p className="text-navy/60">Welcome back! Here's your account overview.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Card */}
            <div className="lg:col-span-1">
              <Card className="border-gold/20 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-gold/10 text-navy font-bold text-xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl font-playfair text-navy">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || 'User'
                    }
                  </CardTitle>
                  {user?.isAdmin && (
                    <Badge className="bg-gold text-navy">Admin</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gold" />
                    <span className="text-sm text-navy/80">{user?.email}</span>
                  </div>
                  
                  {user?.username && (
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-4 w-4 text-gold" />
                      <span className="text-sm text-navy/80">@{user.username}</span>
                    </div>
                  )}
                  
                  {user?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gold" />
                      <span className="text-sm text-navy/80">{user.phone}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gold/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-navy/60">Total Appointments</span>
                      <span className="font-semibold text-navy">{appointments?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointments History */}
            <div className="lg:col-span-2">
              <Card className="border-gold/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 font-playfair text-navy">
                      <CalendarDays className="h-5 w-5" />
                      <span>Appointment History</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="border-gold text-gold hover:bg-gold hover:text-navy"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="text-center py-8">
                      <div className="text-red-600 mb-4">
                        Error loading appointments: {error.message}
                      </div>
                      <Button 
                        onClick={handleRefresh}
                        variant="outline"
                        className="border-gold text-gold hover:bg-gold hover:text-navy"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.map((appointment) => (
                            <TableRow key={appointment._id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1 text-sm font-medium">
                                    <CalendarDays className="h-3 w-3 text-gold" />
                                    <span>{formatDate(appointment.appointmentDate)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-navy/60">
                                    <Clock className="h-3 w-3 text-gold" />
                                    <span>{formatTime(appointment.appointmentDate)}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-navy">
                                  {getServiceType(appointment.cartItems)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-navy">
                                  ₹{appointment.totalAmount?.toLocaleString() || '0'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-navy/70">
                                  {appointment.notes || 'No notes'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 text-gold/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-navy mb-2">No appointments yet</h3>
                      <p className="text-navy/60 mb-4">You haven't booked any appointments yet.</p>
                      <a 
                        href="/book-appointment" 
                        className="inline-flex items-center px-4 py-2 bg-gold text-navy font-medium rounded-lg hover:bg-gold/90 transition-colors"
                      >
                        Book Your First Appointment
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;