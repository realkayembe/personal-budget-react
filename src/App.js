import './App.scss';
import Menu from './Menu/Menu';
import HomePage from './HomePage/HomePage';
import LoginPage from './LoginPage/LoginPage';  
import Hero from './Hero/Hero'; 
import Footer from './Footer/Footer';
import AboutPage from './AboutPage/AboutPage';
import { DataProvider } from "./DataContext";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <DataProvider>
      <Router>
      <Menu />
      <Hero />
      <div className="mainContainer">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
    </DataProvider>
  );
}

export default App;
