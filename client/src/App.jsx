import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LibraryPage from './pages/LibraryPage'
import AddShowPage from './pages/AddShowPage'
import ShowDetailPage from './pages/ShowDetailPage'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/add" element={<AddShowPage />} />
        <Route path="/show/:id" element={<ShowDetailPage />} />
      </Routes>
    </AppLayout>
  )
}
