import React from 'react';
import { Brain, Check, Calendar, Users, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SessionPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Brain className="h-16 w-16 text-indigo-600" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
              SessionPro
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
              Streamline your therapy practice with our comprehensive practice management solution
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="btn text-lg px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Everything you need to manage your practice
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <Calendar className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Scheduling
              </h3>
              <p className="text-gray-600">
                Effortlessly manage appointments with our intuitive calendar system
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Client Management
              </h3>
              <p className="text-gray-600">
                Keep track of client information, history, and progress in one place
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <FileText className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Session Notes
              </h3>
              <p className="text-gray-600">
                Create and manage session notes with our secure documentation system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that works best for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-indigo-500 transition-colors">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Monthly</h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-5xl font-extrabold text-gray-900">$9.99</span>
                  <span className="ml-1 text-xl text-gray-500">/month</span>
                </div>
                <p className="mt-4 text-gray-500">Perfect for getting started</p>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  'Unlimited clients',
                  'Calendar management',
                  'Session notes',
                  'Client portal',
                  'Email reminders',
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup?plan=monthly')}
                className="mt-8 w-full btn"
              >
                Get started
              </button>
            </div>

            {/* Annual Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-indigo-500 transition-colors relative overflow-hidden">
              <div className="absolute top-5 right-5">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Save 17%
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Annual</h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-5xl font-extrabold text-gray-900">$99.99</span>
                  <span className="ml-1 text-xl text-gray-500">/year</span>
                </div>
                <p className="mt-4 text-gray-500">Best value for professionals</p>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  'Everything in Monthly',
                  'Priority support',
                  'Advanced analytics',
                  'Custom branding',
                  'API access',
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup?plan=annual')}
                className="mt-8 w-full btn"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to streamline your practice?
            </h2>
            <p className="mt-4 text-xl text-indigo-100">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:text-lg"
              >
                Get started for free
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};