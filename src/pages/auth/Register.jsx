import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/DataContext';

import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardFooter, 
  Select, 
  Label, 
  ListBox 
} from '@heroui/react';

import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Logom from "./../../cvhsinc.png"

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    assignedPlant: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const regRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const regData = await regRes.json();

      if (!regRes.ok) throw new Error(regData.message || 'Registration failed');

      // Auto Login after successful registration
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        login(loginData.user, loginData.token);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        <CardHeader className="flex flex-col items-center gap-4 pt-10 pb-0 px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="w-40 h-30 bg-primary/10 flex items-center justify-center rounded-xl p-4">
            <img src={Logom} alt="Logo" className="max-h-24 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
        </CardHeader>

        <CardFooter className="flex flex-col gap-6 p-8">
          <form onSubmit={handleRegister} className="space-y-5 w-full">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              size="lg"
              radius="lg"
              isRequired
            />

            <Input
              type="email"
              label="Email"
              placeholder="example@domain.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              size="lg"
              radius="lg"
              isRequired
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                fullWidth
                size="lg"
                radius="lg"
                isRequired
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-default-100"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Fixed Select for Role (HeroUI v3) */}
            <div className="space-y-1">
              <Label>Role</Label>
              <Select 
                placeholder="Select role"
                selectedKey={formData.role}
                onSelectionChange={(key) => handleChange('role', key)}
                size="lg"
                radius="lg"
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="user" textValue="Simple User">
                      Simple User
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="production" textValue="Production">
                      Production
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="admin" textValue="Admin">
                      Admin
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <Input
              label="Assigned Plant"
              placeholder="e.g. California Main Plant"
              value={formData.assignedPlant}
              onChange={(e) => handleChange('assignedPlant', e.target.value)}
              fullWidth
              size="lg"
              radius="lg"
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              fullWidth
              radius="lg"
              isLoading={loading}
            >
              <UserPlus className="mr-2" size={20} />
              Register & Login
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <span 
              onClick={() => navigate('/login')} 
              className="text-primary hover:underline cursor-pointer"
            >
              Login
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}