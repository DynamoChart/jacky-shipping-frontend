import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/DataContext';

import { Button, Input, Card, CardHeader, CardFooter, Link } from '@heroui/react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logom from "./../../cvhsinc.png"

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { token } = useAppContext();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      
      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Optional: redirect after success
      setTimeout(() => {
        navigate('/');
      }, 2000);

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
          <h1 className="text-3xl font-bold text-foreground text-center">
            Change Password
          </h1>
          <p className="text-center text-default-500">Update your account password</p>
        </CardHeader>

        <CardFooter className="flex flex-col gap-6 p-8">
          <form onSubmit={handleChangePassword} className="space-y-6 w-full">
            
            {/* Current Password */}
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                label="Current Password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                variant="ghost"
                size="lg"
                radius="lg"
                isRequired
                isInvalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-default-100"
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                label="New Password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                variant="ghost"
                size="lg"
                radius="lg"
                isRequired
                isInvalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-default-100"
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                variant="ghost"
                size="lg"
                radius="lg"
                isRequired
                isInvalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-default-100"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <p className="text-danger text-sm text-center">{error}</p>}
            {success && <p className="text-success text-sm text-center">{success}</p>}

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
              <Lock className="mr-2" size={20} />
              Change Password
            </Button>
          </form>

          <div className="flex justify-center">
            <Button
              variant="light"
              onClick={() => navigate('/')}
              className="text-default-500"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center text-xs text-default-400 pt-4">
            Powered by{' '}
            <Link 
              href="https://globalpackagetracker.com/" 
              isExternal 
              showAnchorIcon
            >
              Dynamochart
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}