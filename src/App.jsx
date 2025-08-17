import React, { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { handleGoogleLogin, handleSubmit } from './Config';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setFormVisible(true);
    }, 100);
  }, []);

  const loginWithGoogle = async () => {
    const result = await handleGoogleLogin(setError, navigate, setUser);
    if (result) {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center  px-4"
      style={{
        backgroundImage: `url('/loginlol.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className={`relative bg-[#d7dcdd]/20 backdrop-blur-lg border border-[#d7dcdd]/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
        rounded-2xl p-10 max-w-md w-full text-white
        transition duration-300 ${
          formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        } transform transition-all duration-500 ease-out`}
      >
        <h2 className="text-3xl font-bold text-center mb-4 text-[#5b7a8a]">Welcome to ClimAid</h2>
        <p className="text-center mb-6 text-[#5b7a8a]/70">Login to your Account</p>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={(e) => handleSubmit(e, setError)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[#5b7a8a]/70 font-medium mb-1">
              Email Address
            </label>
            <input
              required
              type="email"
              name="email"
              id="email"
              placeholder="Enter Your Email"
              className="w-full border-b border-[#d7dcdd] text-sm bg-transparent text-[#5b7a8a]/60 placeholder-[#5b7a8a]/40 px-2 py-1 focus:border-[#5b7a8a] focus:outline-none"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-[#5b7a8a]/80 font-medium mb-1">
              Password
            </label>
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Enter your Password"
              className="w-full border-b border-[#d7dcdd] text-sm bg-transparent text-[#5b7a8a]/60  placeholder-[#5b7a8a]/50  px-2 py-1 focus:border-[#5b7a8a] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-2 top-8 text-[#d7dcdd] hover:text-[#8098a3] focus:outline-none"
            >
              {passwordVisible ? (
                <AiOutlineEyeInvisible className="h-5 w-5" />
              ) : (
                <AiOutlineEye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#5b7a8a] text-white py-2 rounded-lg hover:bg-[#8098a3] transition-all duration-300 focus:ring focus:ring-[#d7dcdd] focus:outline-none shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 flex items-center justify-between">
          <span className="border-b w-1/4 border-[#d7dcdd]"></span>
          <span className="text-[#d7dcdd] text-sm">OR</span>
          <span className="border-b w-1/4 border-[#d7dcdd]"></span>
        </div>

        {/* Google Button */}
        <button
          onClick={loginWithGoogle}
          className="mt-6 w-full flex items-center justify-center bg-[#ffffff]/10 border border-[#d7dcdd]/30 py-2 rounded-lg shadow-md hover:bg-[#ffffff]/20 hover:shadow-lg transition-all duration-300 focus:ring focus:ring-[#5b7a8a] focus:outline-none"
        >
          <FcGoogle className="h-6 w-6 mr-3" />
          Continue with Google
        </button>

        <p className="text-center text-[#d7dcdd] text-sm mt-6">
          Don't have an account?{' '}
          <a href="#" className="text-white hover:text-[#d7dcdd] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default App;
