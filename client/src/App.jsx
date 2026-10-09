import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LibraryPage from './pages/LibraryPage'
import AddShowPage from './pages/AddShowPage'
import ShowDetailPage from './pages/ShowDetailPage'
import LoginPage from './pages/LoginPage'
import useLoggedIn from './hooks/useLoggedIn'

export default function App() {
  // Always true in demo mode, so the login only ever appears against the real API.
  const loggedIn = useLoggedIn()

  return (
    <AppLayout>
      {loggedIn ? (
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/add" element={<AddShowPage />} />
          <Route path="/show/:id" element={<ShowDetailPage />} />
        </Routes>
      ) : (
        <LoginPage />
      )}
    </AppLayout>
  )
}
