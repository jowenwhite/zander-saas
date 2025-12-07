import React from 'react';

export default function SignupPage() {
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
            "Commerce is the great engine of social progress, transforming individual potential into collective achievement."
          </blockquote>
          <p className="font-semibold">— Alexander Hamilton</p>
        </div>
        
        {/* 64 West Branding */}
        <div className="text-sm opacity-70 mt-6">
          By 64 West
        </div>
      </div>
      
      {/* Signup Form */}
      <div className="w-2/3 bg-white flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-[#0C2340]">Create Your Account</h2>
          <p className="mb-8 text-gray-600">Start transforming your business with Zander</p>
          
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#BF0A30] focus:border-[#BF0A30]"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#BF0A30] focus:border-[#BF0A30]"
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Work Email
              </label>
              <input
                type="email"
                id="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#BF0A30] focus:border-[#BF0A30]"
                placeholder="you@company.com"
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
                placeholder="Create a strong password"
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                id="company"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#BF0A30] focus:border-[#BF0A30]"
                placeholder="Your company"
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#BF0A30] hover:bg-[#A00A28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF0A30]"
              >
                Create Account
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? {' '}
              <a href="/login" className="font-medium text-[#BF0A30] hover:text-[#A00A28]">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
