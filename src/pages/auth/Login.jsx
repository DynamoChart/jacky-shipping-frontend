import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/DataContext';

import { Button, Input, Card, CardHeader, CardFooter, Link,Label } from '@heroui/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Logom from "./../../logoin.jpeg"
import Logom2 from "./../../rlogo.png"
export default function Login({isDark}) {
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
    <div className={`min-h-screen flex items-center justify-center ${isDark?"bg-zinc-900":""} p-6`}>
      <Card className={`w-full max-w-md shadow-2xl  rounded-2xl overflow-hidden border border-gray-200 ${isDark?"bg-zinc-700":"bg-white"} ${isDark?"border-gray-700":""}`}>
        <CardHeader className="flex flex-col items-center gap-4 pt-10 pb-0 px-8 ">
        <div className="w-100 h-30  flex items-center justify-center rounded-xl p-4">
  <img 
    src={isDark ? Logom2 : Logom} 
    alt="Logo" 
    className="object-contain" 
  />
</div>
          <h1 className="text-3xl font-bold text-foreground text-center">
            Welcome Back
          </h1>
          <p className="text-center text-default-500">Sign in to continue</p>
        </CardHeader>

        <CardFooter className="flex flex-col gap-6 p-8">
          <form onSubmit={handleLogin} className="space-y-6 w-full">
          <Label>Email:</Label>
            <Input
              type="email"
              label="Email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              fullWidth
              variant="primary"
              className={`bg-warning-soft`}
              size="lg"
              radius="lg"
              isRequired
              isInvalid={!!error}
              errorMessage={error}
            />

            <div className="relative">
            <Label>Password:</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="primary"
                size="lg"
                radius="lg"
                isRequired
                className={`bg-warning-soft`}
                isInvalid={!!error}
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-10  hover:cursor-pointer -translate-y-1/2 p-1 rounded-full hover:bg-default-100"
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
         
              size="lg"
              fullWidth
              radius="lg"
              isLoading={loading}
              className={`font-semibold bg-success-soft ${isDark?"text-gray-100":"text-gray-950"}`}
            >
              <LogIn className={`mr-2  ${isDark?"text-gray-100":""}`} size={20} />
              Login
            </Button>
          </form>

          {/* <div className="text-center text-xs text-default-400 pt-2">
            Don't have an account?{' '}
            <Link
              onClick={() => navigate('/register')}
              className="text-primary hover:underline cursor-pointer"
            >
              Register here
            </Link>
          </div> */}

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