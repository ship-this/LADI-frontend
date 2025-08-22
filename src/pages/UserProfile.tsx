import * as React from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Lock, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Shield,
  Mail,
  Calendar,
  Clock
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/services/api"

interface UserProfileData {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

const UserProfile = () => {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState("profile")
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false)
  
  // Profile form state
  const [profileData, setProfileData] = React.useState<UserProfileData | null>(null)
  const [profileForm, setProfileForm] = React.useState({
    email: "",
    first_name: "",
    last_name: ""
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = React.useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Account deletion state
  const [deleteForm, setDeleteForm] = React.useState({
    password: "",
    confirmation: ""
  })
  const [showDeletePassword, setShowDeletePassword] = React.useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false)

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth')
    }
  }, [user, isLoading, navigate])

  // Load user profile data
  React.useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true)
      const response = await apiService.getUserProfile()
      
      if (response.success && response.data) {
        const userData = response.data.user
        setProfileData(userData)
        setProfileForm({
          email: userData.email || "",
          first_name: userData.first_name || "",
          last_name: userData.last_name || ""
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      const response = await apiService.updateUserProfile(profileForm)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        // Reload profile data
        await loadUserProfile()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive"
      })
      return
    }
    
    if (passwordForm.new_password.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsChangingPassword(true)
      const response = await apiService.changePassword(passwordForm)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        })
        // Clear password form
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        })
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to change password",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (deleteForm.confirmation !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsDeletingAccount(true)
      const response = await apiService.deleteAccount(deleteForm)
      
      if (response.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
        })
        // Logout and redirect to auth
        await logout()
        navigate('/auth')
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete account",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">User Profile</h1>
              <p className="text-slate-600">Manage your account settings and information</p>
            </div>
          </div>
        </div>

        {/* Profile Overview Card */}
        {profileData && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{profileData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Role</p>
                      <p className="font-medium text-slate-900 capitalize">{profileData.role}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Member Since</p>
                      <p className="font-medium text-slate-900">{formatDate(profileData.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Last Updated</p>
                      <p className="font-medium text-slate-900">{formatDate(profileData.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Info
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Change Password
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="border-slate-200 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-slate-700">First Name</Label>
                      <Input
                        id="first_name"
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                        className="border-slate-200 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-slate-700">Last Name</Label>
                      <Input
                        id="last_name"
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                        className="border-slate-200 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                {/* Account Status Information */}
                <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Account Status:</span>
                      {profileData.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Email Verification:</span>
                      {profileData.email_verified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Not Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">User Role:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {profileData.role}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="password" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Lock className="h-5 w-5 text-orange-600" />
                  </div>
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-slate-700">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                        className="border-slate-200 focus:border-blue-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-slate-700">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                        className="border-slate-200 focus:border-blue-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-500">Password must be at least 8 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-slate-700">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="border-slate-200 focus:border-blue-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delete Account Tab */}
          <TabsContent value="delete" className="space-y-6">
            <Card className="shadow-lg border-0 bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Warning: This action cannot be undone</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Deleting your account will permanently remove all your data, including:
                        </p>
                        <ul className="text-sm text-red-700 mt-2 space-y-1">
                          <li>• All evaluation history and reports</li>
                          <li>• Uploaded templates and files</li>
                          <li>• Account settings and preferences</li>
                          <li>• All associated data and metadata</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleDeleteAccount} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="delete_password" className="text-red-700">Enter Your Password</Label>
                      <div className="relative">
                        <Input
                          id="delete_password"
                          type={showDeletePassword ? "text" : "password"}
                          value={deleteForm.password}
                          onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                          className="border-red-300 focus:border-red-500 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                        >
                          {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delete_confirmation" className="text-red-700">
                        Type "DELETE" to confirm
                      </Label>
                      <Input
                        id="delete_confirmation"
                        type="text"
                        value={deleteForm.confirmation}
                        onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmation: e.target.value }))}
                        className="border-red-300 focus:border-red-500"
                        placeholder="DELETE"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isDeletingAccount || deleteForm.confirmation !== 'DELETE'}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                      >
                        {isDeletingAccount ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting Account...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Permanently Delete Account
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default UserProfile
