
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus } from 'lucide-react';

interface AuthRequiredNoticeProps {
  message?: string;
  showSignUp?: boolean;
}

const AuthRequiredNotice: React.FC<AuthRequiredNoticeProps> = ({ 
  message = "Sign in to access this feature", 
  showSignUp = true 
}) => {
  return (
    <Card className="bg-gradient-to-r from-gold/10 via-white to-gold/10 border-gold/20 rounded-xl">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gold/20 p-3 rounded-full">
            <Lock className="h-6 w-6 text-gold" />
          </div>
        </div>
        
        <h3 className="text-lg font-playfair font-semibold text-navy mb-2">
          Authentication Required
        </h3>
        
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth">
            <Button className="bg-gold hover:bg-gold-dark text-navy font-semibold px-6 py-2">
              Sign In
            </Button>
          </Link>
          
          {showSignUp && (
            <Link to="/auth">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold/10 px-6 py-2">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthRequiredNotice;
