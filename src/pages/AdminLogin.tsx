import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const { signInAdmin, user, isAdmin, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !loading) {
      if (user && isAdmin) {
        toast({
          title: "Welcome Admin!",
          description: "Redirecting to admin panel...",
        });
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else if (user && profile && !isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, profile, authLoading, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emailOrUsername || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both email/username and password.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { error, isAdmin: adminStatus } = await signInAdmin(formData.emailOrUsername, formData.password);
      
      if (error) {
        toast({
          title: "Admin login failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (adminStatus) {
        toast({
          title: "Login successful!",
          description: "Redirecting to admin panel...",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-gold/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-navy/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-gold/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-playfair font-bold text-navy hover:text-gold transition-colors duration-300">
            Zaffira
          </Link>
          <p className="text-navy/60 mt-2 font-inter">Admin Portal</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border border-white/30 rounded-3xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-navy to-navy-light text-white py-8">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-8 w-8 text-gold mr-2" />
            </div>
            <CardTitle className="text-2xl font-playfair">Admin Access</CardTitle>
            <CardDescription className="text-white/80 font-inter">
              Sign in to the administrative panel
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="text-navy font-medium">Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
                  <Input
                    id="emailOrUsername"
                    name="emailOrUsername"
                    type="text"
                    value={formData.emailOrUsername}
                    onChange={handleInputChange}
                    className="pl-10 border-navy/20 focus:border-gold focus:ring-gold/20 rounded-xl"
                    placeholder="admin@example.com or adminuser"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-navy font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 border-navy/20 focus:border-gold focus:ring-gold/20 rounded-xl"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy/60 hover:text-navy transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-navy to-navy-light hover:from-navy-dark hover:to-navy text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In as Admin'
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-navy/10">
              <div className="text-center space-y-3">
                <Link
                  to="/auth"
                  className="block text-navy/60 hover:text-navy transition-colors text-sm font-medium"
                >
                  Regular User Login
                </Link>
                <Link
                  to="/"
                  className="block text-navy/60 hover:text-navy transition-colors text-sm font-medium"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
