import React, { useContext, useEffect } from 'react'
import axios from 'axios'
import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AboutUs from "./pages/AboutUs"
import Appointment from "./pages/Appointment"
import Login from "./pages/Login"
import Register from "./pages/Register"
 import { ToastContainer  } from 'react-toastify';
import Navbar from './Components/Navbar'
import { Context } from './main.jsx'
const App = () => {

  const { isAuthenticated, setIsAuthenticated, setUser } =
    useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/patient/me",
          {
            withCredentials: true,
          }
        );
        setIsAuthenticated(true);
        setUser(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
      }
    };
    fetchUser();
  }, [isAuthenticated]);
  
  return (
    <div>
         <Router>
          <Navbar></Navbar>
          <Routes>
            <Route path="/" element={<Home></Home>}></Route>
            <Route path="/appointment" element={<Appointment></Appointment>}></Route>
            <Route path="/about" element={<AboutUs></AboutUs>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route path="/login" element={<Login></Login>}></Route>
          </Routes>
          <ToastContainer position="top-center"></ToastContainer>
         </Router>
    </div>
  )
}

export default App
