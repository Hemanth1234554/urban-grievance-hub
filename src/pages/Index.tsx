
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Shield, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize demo data if not exists
    const existingUsers = localStorage.getItem('grievance_users');
    if (!existingUsers) {
      const demoUsers = [
        {
          id: '1',
          name: 'Demo Citizen',
          email: 'citizen@demo.com',
          password: 'password',
          role: 'citizen'
        },
        {
          id: '2',
          name: 'Demo Authority',
          email: 'authority@demo.com',
          password: 'password',
          role: 'authority',
          department: 'Public Works'
        },
        {
          id: '3',
          name: 'Demo Admin',
          email: 'admin@demo.com',
          password: 'password',
          role: 'admin',
          department: 'Administration'
        }
      ];
      localStorage.setItem('grievance_users', JSON.stringify(demoUsers));
    }

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: FileText,
      title: 'Submit Complaints',
      description: 'Easily submit your grievances online with detailed information and track their progress.'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access the system anytime, anywhere. No more limited office hours.'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Communication',
      description: 'Direct communication between citizens and municipal authorities.'
    },
    {
      icon: CheckCircle,
      title: 'Track Progress',
      description: 'Monitor the status of your complaints from submission to resolution.'
    },
    {
      icon: Users,
      title: 'Community Groups',
      description: 'Form groups, share experiences, and discuss common problems.'
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Your data is secure and the process is completely transparent.'
    }
  ];

  const userTypes = [
    {
      title: 'Citizens',
      description: 'Submit complaints, track status, join community groups',
      features: ['Submit grievances', 'Track complaint status', 'Community discussions', 'Feedback system']
    },
    {
      title: 'Municipal Authorities',
      description: 'Manage and respond to citizen complaints efficiently',
      features: ['View assigned complaints', 'Update complaint status', 'Respond to citizens', 'Generate reports']
    },
    {
      title: 'Administrators',
      description: 'Oversee the entire system and manage users',
      features: ['Monitor all complaints', 'Manage user accounts', 'System administration', 'Analytics & reports']
    },
    {
      title: 'NGOs',
      description: 'Advocate for social causes and support citizens',
      features: ['Form user groups', 'Publicize social causes', 'Support citizen complaints', 'Community engagement']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Online Grievance
              <span className="text-blue-600"> Redressal System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Bridge the gap between citizens and administration. Submit complaints, track progress, 
              and engage with your community for a better tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="px-8 py-3"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our system promotes transparency, reduces bureaucratic delays, and encourages citizen participation 
              in governance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Everyone</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform serves different user types with tailored features and capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((userType, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{userType.title}</h3>
                  <p className="text-gray-600 mb-4">{userType.description}</p>
                  <ul className="space-y-2">
                    {userType.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens working together to improve their communities through 
            transparent and efficient grievance resolution.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
          >
            Start Your Journey
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Online Grievance Redressal System. Built for transparent governance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
