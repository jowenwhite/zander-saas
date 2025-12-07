import React from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Navy Sidebar */}
      <div className="w-1/3 bg-[#0C2340] flex flex-col justify-between p-12 text-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">Zander</h1>
          <p className="text-2xl font-light opacity-90">Your AI-Powered Executive Team</p>
        </div>
        
        {/* Hamilton Quote */}
        <div className="mt-auto">
          <blockquote className="italic text-lg opacity-80 mb-6">
            "The true direction of commerce is not just the exchange of goods, but the expansion of human potential through strategic innovation."
          </blockquote>
          <p className="font-semibold">— Alexander Hamilton</p>
        </div>
        
        {/* 64 West Branding */}
        <div className="text-sm opacity-70 mt-6">
          By 64 West
        </div>
      </div>
      
      {/* Login Form */}
      <div className="w-2/3 bg-white flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-[#0C2340]">Welcome Back</h2>
          <p className="mb-8 text-gray-600">Sign in to access your Zander dashboard</p>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#BF0A30] focus:border-[#BF0A30]"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#BF0A30] focus:border-[#BF0A30]"
                placeholder="Enter your password"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-[#BF0A30] focus:ring-[#BF0A30] border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-[#BF0A30] hover:text-[#A00A28]">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#BF0A30] hover:bg-[#A00A28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF0A30]"
              >
                Sign In
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? {' '}
              <a href="/signup" className="font-medium text-[#BF0A30] hover:text-[#A00A28]">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
