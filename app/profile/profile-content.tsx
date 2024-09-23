'use client';

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfileContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [clanName, setClanName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setUsername(user.user_metadata.username || '')
        setClanName(user.user_metadata.clan_name || '')
        setMobileNumber(user.user_metadata.mobile_number || '')
        setAvatarUrl(user.user_metadata.avatar_url || '')
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLoading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      try {
        // Upload the file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)
        
        if (uploadError) {
          throw uploadError
        }

        // Get the public URL of the uploaded file
        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        if (urlError) {
          throw urlError
        }

        // Update the user's avatar_url in their metadata
        const { data: userData, error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        })

        if (updateError) {
          throw updateError
        }

        // Update local state
        setAvatarUrl(publicUrl)
        setUser(userData.user)
        showToast("Avatar updated", "Your profile picture has been successfully updated.")
      } catch (error) {
        console.error('Error uploading avatar:', error)
        showToast("Upload failed", error.message || "An error occurred while uploading the avatar.", "destructive")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { username, clan_name: clanName, mobile_number: mobileNumber }
      })
      if (error) throw error
      setUser(data.user)
      showToast("Profile updated", "Your profile has been successfully updated.")
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast("Update failed", error.message || "An error occurred while updating your profile.", "destructive")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (!user) {
    return <div>Unable to load user profile. Please try logging in again.</div>
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Input 
                    id="avatar" 
                    type="file" 
                    onChange={handleAvatarUpload}
                    accept="image/*"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="clan-name">Clan Name</Label>
                <Input 
                  id="clan-name" 
                  value={clanName} 
                  onChange={(e) => setClanName(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="mobile-number">Mobile Money Number</Label>
                <Input 
                  id="mobile-number" 
                  value={mobileNumber} 
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="mt-4" disabled={loading}>Update Profile</Button>
          </form>
        </CardContent>
      </Card>
      
    </div>
    
  )
  
}