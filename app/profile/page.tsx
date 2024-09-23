// app/profile/page.tsx
import AuthWrapper from '@/components/auth-wrapper'
import ProfileContent from './profile-content'

export default function ProfilePage() {
  return (
    <AuthWrapper>
      <ProfileContent />
    </AuthWrapper>
  )
}