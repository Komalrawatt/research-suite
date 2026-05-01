import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages (to be implemented)
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import PaperSearch from "./pages/Search/PaperSearch";
import SavedPapers from "./pages/Saved/SavedPapers";
import JournalSelector from "./pages/Journals/JournalSelector";
import ConferenceFinder from "./pages/Conferences/ConferenceFinder";
import CitationTool from "./pages/Citations/CitationTool";
import SavedCitations from "./pages/Citations/SavedCitations";
import PreprintServers from "./pages/Preprints/PreprintServers";
import EthicsGuide from "./pages/Ethics/EthicsGuide";
import Profile from "./pages/Profile/Profile";
import AcademicResources from "./pages/Resources/AcademicResources";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/search" element={<PaperSearch />} />
              <Route path="/journals" element={<JournalSelector />} />
              <Route path="/conferences" element={<ConferenceFinder />} />
              <Route path="/preprints" element={<PreprintServers />} />
              <Route path="/resources" element={<AcademicResources />} />
              <Route path="/ethics" element={<EthicsGuide />} />

              <Route path="/saved" element={
                <ProtectedRoute>
                  <SavedPapers />
                </ProtectedRoute>
              } />
              
              <Route path="/citations" element={
                <ProtectedRoute>
                  <CitationTool />
                </ProtectedRoute>
              } />

              <Route path="/citations/saved" element={
                <ProtectedRoute>
                  <SavedCitations />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'toast-custom',
              duration: 3000,
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
