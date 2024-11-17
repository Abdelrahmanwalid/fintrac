import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token } = response.data;
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Redirect to protected route or homepage
      navigate('/dashboard'); // Change this to your desired route
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-custom-gradient text-white px-4">
    
      {/* Navbar */}
      <nav className="w-full max-w-md pb-6">
        <Link to="/" className="text-blue-400 hover:underline text-lg font-semibold">
          &larr; Back to Home
        </Link>
      </nav>
      
      {/* Title */}
      <h2 className="text-4xl font-bold mb-8">
        Login to <span className="text-blue-400">Fin</span><span className="text-orange-400">Trac</span>
      </h2>
      
      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-full max-w-md shadow-lg">
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 rounded bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
        >
          Login
        </button>
      </form>
      
      {/* Sign-Up Link */}
      <p className="mt-6 text-gray-400 text-center">
        Don't have an account?{' '}
        <Link to="/signup" className="text-orange-400 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;