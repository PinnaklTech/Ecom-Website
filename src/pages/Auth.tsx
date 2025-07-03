import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, AtSign, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: ''
  });

  const { signIn, signUp, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // After successful login, redirect to intended destination or home
    if (user && profile) {
      if (profile.is_admin && from === '/') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, profile, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.emailOrUsername, formData.password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          // The useEffect will handle the redirect based on user role and intended destination
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          formData.username
        );
        
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-gold/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-playfair font-bold text-navy hover:text-gold transition-colors duration-300">
            Zaffira
          </Link>
          <p className="text-navy/60 mt-2 font-inter">Luxury Jewelry Collection</p>
          {location.state?.from && (
            <p className="text-sm text-gold mt-1">Sign in to continue your journey</p>
          )}
        </div>

        {/* Auth Card */}
        <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border border-white/30 rounded-3xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-navy to-navy-light text-white py-8">
            <CardTitle className="text-2xl font-playfair">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-white/80 font-inter">
              {isLogin ? 'Sign in to your account' : 'Join our exclusive collection'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-navy font-medium">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10 border-navy/20 focus:border-gold focus:ring-gold/20 rounded-xl"
                          placeholder="John"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-navy font-medium">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10 border-navy/20 focus:border-gold focus:ring-gold/20 rounded-xl"
                          placeholder="Doe"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-navy font-medium">Username</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-10 border-navy/20 focus:border-gold focus:ring-gold/20 rounded-xl"
                        placeholder="johndoe"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-navy font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 border-navy/20 focus:border-gold focus:ring-gold/20 rounded-xl"
                        placeholder="john@example.com"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}

              {isLogin && (
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
                      placeholder="john@example.com or johndoe"
                      required={isLogin}
                    />
                  </div>
                </div>
              )}

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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy/60 hover:text-navy transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-navy font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/60 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 border-navy/20 focus:border-gold focus:ring-gold/20 rounded-xl"
                      placeholder="••••••••"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-navy/10">
              <p className="text-center text-navy/60">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-gold hover:text-gold-dark font-semibold transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Admin Login Section */}
            <div className="mt-6 pt-4 border-t border-navy/10">
              <div className="text-center">
                <p className="text-navy/60 text-sm mb-3">
                  Are you an admin? 
                </p>
                <Link
                  to="/admin-login"
                  className="inline-flex items-center justify-center gap-2 text-navy/70 hover:text-navy transition-colors text-sm font-medium bg-navy/5 hover:bg-navy/10 px-4 py-2 rounded-lg"
                >
                  <Shield className="h-4 w-4" />
                  Login as Admin
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-navy/60 hover:text-navy transition-colors text-sm font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
