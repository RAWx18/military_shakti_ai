'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, ShieldCheck, Mail, Calendar, Briefcase, MapPin, Phone, Globe, FileText } from 'lucide-react'
import Link from 'next/link'
import { getCookie, deleteCookie } from 'cookies-next'

interface UserData {
  email: string;
  name: string;
  createdAt: string;
  isAdmin: boolean;
  jobTitle: string | "Default";
  location: string | "India";
  phone: string | "1234567890";
  website: string | "https://example.com";
  totalContexts: number;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUser() {
        const token = getCookie('token');
        if (!token) {
          console.log("NO TOKEN");
          toast({
            title: "Authentication Error",
            description: "Please log in to view this page.",
            variant: "destructive",
          });
          return;
        }
        try {
            const response = await fetch('http://localhost:8000/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            });
            if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            } else {
            throw new Error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            toast({
            title: "Error",
            description: "Failed to load user data. Please try again.",
            variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
        }

    fetchUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    const token = getCookie('token');
    if (!token) {
      console.log("NO TOKEN");
      toast({
        title: "Authentication Error",
        description: "Please log in to update your password.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been successfully changed.",
        });
        setOldPassword('');
        setNewPassword('');
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="hover:bg-gray-200 text-gray-700">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-gray-800">User Profile</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gray-800 text-white">
                <CardTitle className="text-2xl">User Information</CardTitle>
                <CardDescription className="text-gray-300">Your account details and status</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-24 h-24 bg-gray-300 text-gray-600">
                    <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-800">{user.name}</h2>
                    <Badge 
                      variant={user.isAdmin ? "default" : "secondary"} 
                      className="mt-1 bg-gray-200 text-gray-800"
                    >
                      {user.isAdmin ? (
                        <ShieldCheck className="w-3 h-3 mr-1" />
                      ) : null}
                      {user.isAdmin ? "Admin" : "User"}
                    </Badge>
                  </div>
                </div>
                <Separator className="my-4 bg-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
              </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gray-800 text-white">
                <CardTitle className="text-2xl">Activity Summary</CardTitle>
                <CardDescription className="text-gray-300">Overview of your account activity</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Contexts Created</h3>
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-gray-600 mr-3" />
                      <span className="text-3xl font-bold text-gray-800">{user.totalContexts}</span>
                    </div>
                  </div>
                  {/* Add more activity cards here if needed */}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gray-800 text-white">
                <CardTitle className="text-2xl">Change Password</CardTitle>
                <CardDescription className="text-gray-300">Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old-password" className="text-gray-700">Current Password</Label>
                    <Input
                      id="old-password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-700">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isChangingPassword} 
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    {isChangingPassword ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

