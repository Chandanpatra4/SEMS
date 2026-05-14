import { useNavigate } from 'react-router-dom'
import FeaturesSection from '../../components/FeaturesSection'
import HeroSection from '../../components/HeroSection'
import HowItWorks from '../../components/HowItWorks'
import RolesSection from '../../components/RolesSection'

function Home() {
  const navigate = useNavigate()

  const handleNavigateToLogin = () => {
    navigate('/login')
  }

  return (
    <>
      <HeroSection
        onGetStarted={handleNavigateToLogin}
        onLogin={handleNavigateToLogin}
      />
      <FeaturesSection />
      <RolesSection />
      <HowItWorks />
    </>
  )
}

export default Home
