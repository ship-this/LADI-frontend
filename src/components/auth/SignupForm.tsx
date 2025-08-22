import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface SignupFormProps {
  onToggleMode: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleMode }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string): string => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validateName = (name: string, fieldName: string): string => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters long`;
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return '';
  };

  // Validate form on field changes
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (touched.firstName) {
      newErrors.firstName = validateName(firstName, 'First name');
    }
    
    if (touched.lastName) {
      newErrors.lastName = validateName(lastName, 'Last name');
    }
    
    if (touched.email) {
      newErrors.email = validateEmail(email);
    }
    
    if (touched.password) {
      newErrors.password = validatePassword(password);
    }
    
    if (touched.confirmPassword) {
      newErrors.confirmPassword = validateConfirmPassword(confirmPassword);
    }
    
    setErrors(newErrors);
  }, [firstName, lastName, email, password, confirmPassword, touched]);

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const isFormValid = () => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password &&
      confirmPassword &&
      Object.keys(errors).length === 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Check if form is valid
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signup(email, password, firstName, lastName);
      if (result.success) {
        toast({
          title: "Account created!",
          description: "Welcome to LADI Evaluator. You can now start analyzing manuscripts.",
        });
        // Navigate to dashboard after successful signup
        navigate('/');
      } else {
        toast({
          title: "Signup failed",
          description: result.error || "Please check your information and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => handleFieldBlur('firstName')}
                  placeholder="First name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {touched.firstName && errors.firstName && (
                  <div className="flex items-center mt-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.firstName}
                  </div>
                )}
                {touched.firstName && !errors.firstName && firstName && (
                  <div className="flex items-center mt-1 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valid
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => handleFieldBlur('lastName')}
                  placeholder="Last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {touched.lastName && errors.lastName && (
                  <div className="flex items-center mt-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.lastName}
                  </div>
                )}
                {touched.lastName && !errors.lastName && lastName && (
                  <div className="flex items-center mt-1 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valid
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {touched.email && errors.email && (
                <div className="flex items-center mt-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}
              {touched.email && !errors.email && email && (
                <div className="flex items-center mt-1 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Valid email
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                placeholder="Create a password"
                className={errors.password ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {touched.password && errors.password && (
                <div className="flex items-center mt-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </div>
              )}
              {touched.password && !errors.password && password && (
                <div className="flex items-center mt-1 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Strong password
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase, and number
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleFieldBlur('confirmPassword')}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="flex items-center mt-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
              {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
                <div className="flex items-center mt-1 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Passwords match
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isFormValid()}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};