import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Footer from './components/Footer'
import ProductDetails from './components/pages/ProductDetails'
import LipstickAR from "./AR/LipstickAR";

const App = () => {
  return (
    <main>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/product/:id" element={<ProductDetails/>} />
        <Route
          path="/ar/lipstick"
          element={
            <div className="min-h-screen bg-gray-50 p-6">
              <h1 className="text-2xl font-semibold mb-4  mt-10">Lipstick AR Test</h1>
              <LipstickAR />
            </div>
          }
        />
      </Routes>
      <Footer/>
    </main>
  )
}

export default App
