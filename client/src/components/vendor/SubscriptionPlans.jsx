import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Package, TrendingUp, MapPin, Headphones, X } from 'lucide-react';

const SubscriptionPlans = ({ isOpen, onClose, currentPlan = 'basic' }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      period: 'Forever Free',
      icon: Package,
      color: 'bg-gray-100 text-gray-900',
      borderColor: 'border-gray-200',
      popular: false,
      features: [
        'List up to 10 products',
        'Basic location tracking',
        'Standard customer support',
        '8% commission rate',
        'Basic analytics'
      ],
      limitations: [
        'Limited product listings',
        'Higher commission fees',
        'Basic support only'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 299,
      period: 'per month',
      icon: Star,
      color: 'bg-[#1A6950] text-white',
      borderColor: 'border-[#1A6950]',
      popular: true,
      features: [
        'Unlimited products',
        'Advanced analytics dashboard',
        'Priority listing in search',
        '5% commission rate',
        'Promotional tools access',
        'Email support',
        'Route optimization'
      ],
      savings: 'Save ₹1,200 yearly'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 599,
      period: 'per month',
      icon: Crown,
      color: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
      borderColor: 'border-purple-500',
      popular: false,
      features: [
        'All Pro features',
        'Featured vendor badge',
        'Custom branding options',
        '3% commission rate',
        'Dedicated account manager',
        'Advanced roaming route optimization',
        'Priority customer support',
        'Marketing assistance'
      ],
      savings: 'Best value for growth'
    }
  ];

  const handlePlanSelect = async (planId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSelectedPlan(planId);
      // Here you would integrate with your payment system
      console.log(`Selected plan: ${planId}`);
    } catch (error) {
      console.error('Plan selection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[32px] p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
              Choose Your Plan
            </h2>
            <p className="text-gray-600">
              Grow your business with the right tools and features
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-[24px] p-6 border-2 transition-all hover:scale-105 ${
                selectedPlan === plan.id 
                  ? `${plan.borderColor} shadow-xl` 
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.popular ? 'ring-4 ring-[#CDF546] ring-opacity-50' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#CDF546] text-gray-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-black text-gray-900">
                    ₹{plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 text-sm ml-2">
                      {plan.period}
                    </span>
                  )}
                </div>
                {plan.price === 0 && (
                  <p className="text-[#1A6950] font-bold text-sm uppercase tracking-wide">
                    {plan.period}
                  </p>
                )}
                {plan.savings && (
                  <p className="text-green-600 font-bold text-sm">
                    {plan.savings}
                  </p>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isLoading || selectedPlan === plan.id}
                className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-green-500 text-white cursor-default'
                    : plan.popular
                    ? 'bg-[#1A6950] text-white hover:bg-[#145240]'
                    : 'bg-gray-900 text-white hover:bg-black'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : selectedPlan === plan.id ? (
                  'Current Plan'
                ) : plan.price === 0 ? (
                  'Get Started'
                ) : (
                  'Upgrade Now'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-[#1A6950] to-emerald-700 rounded-[24px] p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
              Why Upgrade?
            </h3>
            <p className="text-white/80">
              Unlock powerful features to grow your vendor business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={24} />
              </div>
              <h4 className="font-bold mb-2">Increase Revenue</h4>
              <p className="text-white/80 text-sm">
                Lower commission rates mean more money in your pocket
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} />
              </div>
              <h4 className="font-bold mb-2">Better Visibility</h4>
              <p className="text-white/80 text-sm">
                Priority listing and featured badges attract more customers
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headphones size={24} />
              </div>
              <h4 className="font-bold mb-2">Premium Support</h4>
              <p className="text-white/80 text-sm">
                Get dedicated support and account management
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Questions about plans? <span className="text-[#1A6950] font-bold cursor-pointer hover:underline">Contact Support</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionPlans;