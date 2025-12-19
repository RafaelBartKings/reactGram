import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Login'

function App() {
   return (
      <div className="App">
         <div>
            <BrowserRouter>
               <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
               </Routes>
            </BrowserRouter>
         </div>
      </div>
   );
}

export default App;
