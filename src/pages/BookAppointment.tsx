import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add your Render backend URL here
  const BACKEND_URL = 'https://zaffira-backend.onrender.com'; // Backend URL

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to send data to your Node.js backend
  const sendToBackend = async (appointmentData) => {
    try {
      const backendData = {
        name: appointmentData.customer_name,
        email: appointmentData.customer_email,
        phone: appointmentData.customer_phone,
        date: appointmentData.appointment_date,
        time: selectedTime,
        notes: appointmentData.notes || '',
        cartItems: appointmentData.cart_items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        }))
      };

      console.log('Sending data to backend:', backendData);

      const response = await fetch(`${BACKEND_URL}/api/book-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending to backend:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert time string to 24-hour format for database storage
      const timeIn24Hour = convertTo24Hour(selectedTime);
      
      // Combine date and time
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = timeIn24Hour.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData = {
        user_id: user.id,
        appointment_date: appointmentDateTime.toISOString(),
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        notes: formData.notes,
        cart_items: state.items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: state.total,
        status: 'pending'
      };

      console.log('Creating appointment with data:', appointmentData);

      // 1. Save appointment to Supabase (existing functionality)
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError);
        throw new Error('Failed to save appointment to database');
      }

      console.log('Supabase save successful:', supabaseData);

      // 2. Send data to your Node.js backend (new functionality)
      try {
        const backendResult = await sendToBackend(appointmentData);
        console.log('Backend email sent successfully:', backendResult);
        
        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been successfully booked and confirmation emails have been sent.",
        });
      } catch (backendError) {
        console.error('Backend email failed, but appointment saved:', backendError);
        
        // Show success message even if email fails, since appointment is saved
        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been saved. We'll contact you soon to confirm. (Note: Confirmation email may be delayed)",
        });
      }

      // Clear cart after successful booking
      dispatch({ type: 'CLEAR_CART' });
      
      // Reset form
      setFormData({ name: '', email: '', phone: '', notes: '' });
      setSelectedDate(undefined);
      setSelectedTime('');

      // Navigate to dashboard to see the appointment
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert 12-hour format to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-playfair font-bold text-navy mb-4">
              Book Your Appointment
            </h1>
            <p className="text-xl text-gray-600">
              Schedule a consultation to discuss your jewelry needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-playfair font-semibold text-navy mb-6">
                Selected Items
              </h2>
              
              {state.items.length === 0 ? (
                <p className="text-gray-600">No items in cart</p>
              ) : (
                <>
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-b-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-navy">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-navy">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-navy">Total:</span>
                      <span className="text-xl font-bold text-navy">
                        ₹{state.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Appointment Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-playfair font-semibold text-navy mb-6">
                Appointment Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label>Preferred Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Preferred Time *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        className={selectedTime === time ? "bg-gold hover:bg-gold-dark text-navy" : ""}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold py-3"
                >
                  {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;