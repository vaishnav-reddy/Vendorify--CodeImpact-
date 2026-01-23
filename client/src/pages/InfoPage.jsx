import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Link2, Briefcase, BookOpen, HelpCircle, Scale, Lock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

const pageContent = {
  about: {
    title: 'About Vendorify',
    icon: FileText,
    content: 'Vendorify connects local street vendors with customers, making it easy to discover and order from your favorite nearby vendors. We empower small businesses while providing convenience to customers.',
    sections: [
      { title: 'Our Mission', text: 'To digitize and empower street vendors across India, helping them reach more customers and grow their businesses.' },
      { title: 'Our Vision', text: 'A world where every street vendor has access to technology that helps them thrive.' },
      { title: 'Our Values', text: 'Community, Transparency, Innovation, and Empowerment guide everything we do.' }
    ]
  },
  security: {
    title: 'Security',
    icon: Shield,
    content: 'Your security is our top priority. We use industry-standard encryption and security practices to protect your data.',
    sections: [
      { title: 'Data Encryption', text: 'All data is encrypted in transit and at rest using AES-256 encryption.' },
      { title: 'Secure Payments', text: 'We partner with trusted payment processors and never store your card details.' },
      { title: 'Privacy First', text: 'We only collect data necessary to provide our services and never sell your information.' }
    ]
  },
  integrations: {
    title: 'Integrations',
    icon: Link2,
    content: 'Vendorify integrates with popular tools and platforms to enhance your experience.',
    sections: [
      { title: 'Payment Gateways', text: 'Seamless integration with Razorpay, PhonePe, Google Pay, and more.' },
      { title: 'Maps & Navigation', text: 'Real-time vendor tracking powered by Google Maps.' },
      { title: 'Communication', text: 'In-app messaging and SMS notifications to keep you updated.' }
    ]
  },
  careers: {
    title: 'Careers',
    icon: Briefcase,
    content: 'Join our team and help us revolutionize how people connect with local vendors.',
    sections: [
      { title: 'Why Join Us?', text: 'Work on meaningful problems, learn from talented colleagues, and make a real impact.' },
      { title: 'Benefits', text: 'Competitive salary, flexible work hours, health insurance, and growth opportunities.' },
      { title: 'Open Positions', text: 'Check our LinkedIn page for current openings or email careers@vendorify.com' }
    ]
  },
  blog: {
    title: 'Blog',
    icon: BookOpen,
    content: 'Stay updated with the latest news, tips, and stories from the Vendorify community.',
    sections: [
      { title: 'Coming Soon', text: 'We are working on bringing you insightful articles about street food culture, vendor success stories, and tips for customers.' },
      { title: 'Subscribe', text: 'Sign up for our newsletter to get notified when we publish new content.' }
    ]
  },
  docs: {
    title: 'Documentation',
    icon: FileText,
    content: 'Everything you need to know about using Vendorify.',
    sections: [
      { title: 'Getting Started', text: 'Download the app, create an account, and start exploring vendors near you.' },
      { title: 'For Vendors', text: 'Learn how to set up your shop, manage products, and accept orders.' },
      { title: 'API Reference', text: 'Developer documentation for integrating with Vendorify (coming soon).' }
    ]
  },
  help: {
    title: 'Help Center',
    icon: HelpCircle,
    content: 'Find answers to common questions or reach out to our support team.',
    sections: [
      { title: 'FAQs', text: 'Browse frequently asked questions about orders, payments, and account management.' },
      { title: 'Contact Support', text: 'Email us at support@vendorify.com or call +91 1234567890' },
      { title: 'Report an Issue', text: 'Found a bug? Let us know through the app or email bugs@vendorify.com' }
    ]
  },
  terms: {
    title: 'Terms of Service',
    icon: Scale,
    content: 'By using Vendorify, you agree to these terms and conditions.',
    sections: [
      { title: 'Usage', text: 'You must be at least 13 years old to use Vendorify. Use our services responsibly and legally.' },
      { title: 'Content', text: 'You retain ownership of content you post. By posting, you grant us license to display it.' },
      { title: 'Liability', text: 'We provide our services "as is" and are not liable for vendor actions or product quality.' }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Lock,
    content: 'We respect your privacy. Here is how we collect, use, and protect your data.',
    sections: [
      { title: 'Data Collection', text: 'We collect information you provide and usage data to improve our services.' },
      { title: 'Data Usage', text: 'Your data is used to provide services, personalize experience, and communicate with you.' },
      { title: 'Your Rights', text: 'You can access, update, or delete your data anytime through your account settings.' }
    ]
  },
  customers: {
    title: 'Our Customers',
    icon: Users,
    content: 'Join thousands of happy customers who use Vendorify daily.',
    sections: [
      { title: 'Success Stories', text: 'Read how Vendorify has helped customers discover amazing local food and products.' },
      { title: 'Testimonials', text: '"Vendorify changed how I discover street food. I love supporting local vendors!" - Priya, Bangalore' },
      { title: 'Join Us', text: 'Download the app today and become part of our growing community.' }
    ]
  }
};

const InfoPage = ({ page }) => {
  const location = useLocation();
  const currentPage = page || location.pathname.slice(1) || 'about';
  const content = pageContent[currentPage] || pageContent.about;
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-[#FDF9DC]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1A6950] mb-8 font-bold text-sm uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[48px] p-8 md:p-12 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#CDF546] rounded-2xl flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-900" />
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-gray-900 uppercase tracking-tight">
                {content.title}
              </h1>
            </div>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              {content.content}
            </p>

            <div className="space-y-8">
              {content.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-[#CDF546] pl-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600">{section.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-400">
                Last updated: January 2026
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InfoPage;
