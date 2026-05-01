import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/DataContext';

import { Button, Input, Card, CardHeader, CardFooter, Link } from '@heroui/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Logom from "./../../cvhsinc.png"

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
console.log("data",data)
      login(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        <CardHeader className="flex flex-col items-center gap-4 pt-10 pb-0 px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="w-40 h-30 bg-primary/10 flex items-center justify-center rounded-xl p-4">
            <img src={Logom} alt="Logo" className="max-h-24 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-center">
            Welcome Back
          </h1>
          <p className="text-center text-default-500">Sign in to continue</p>
        </CardHeader>

        <CardFooter className="flex flex-col gap-6 p-8">
          <form onSubmit={handleLogin} className="space-y-6 w-full">
            <Input
              type="email"
              label="Email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              fullWidth
              variant="ghost"
              size="lg"
              radius="lg"
              isRequired
              isInvalid={!!error}
              errorMessage={error}
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="ghost"
                size="lg"
                radius="lg"
                isRequired
                isInvalid={!!error}
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-default-100"
              >
                {showPassword ? (
                  <EyeOff className="size-5 text-default-500" />
                ) : (
                  <Eye className="size-5 text-default-500" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              color="primary"
              variant="solid"
              size="lg"
              fullWidth
              radius="lg"
              isLoading={loading}
              className="font-semibold"
            >
              <LogIn className="mr-2" size={20} />
              Login
            </Button>
          </form>

          <div className="text-center text-xs text-default-400 pt-2">
            Don't have an account?{' '}
            <Link
              onClick={() => navigate('/register')}
              className="text-primary hover:underline cursor-pointer"
            >
              Register here
            </Link>
          </div>

          <div className="text-center text-xs text-default-400">
            Powered by{' '}
            <Link href="https://globalpackagetracker.com/" isExternal showAnchorIcon>
              Dynamochart
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}