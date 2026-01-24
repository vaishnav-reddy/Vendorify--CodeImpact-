import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Truck, Heart, Gift, X, Sparkles } from 'lucide-react';

const CustomerSubscriptionPlans = ({ isOpen, onClose, currentPlan = 'free' }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'Forever',
      icon: Star,
      color: 'bg-gray-100 text-gray-900',
      borderColor: 'border-gray-200',
      popular: false,
      features: [
        'Browse all vendors',
        'Basic search & filters',
        'Order tracking',
        'Standard delivery',
        'Basic customer support'
      ],
      limitations: [
        'Standard delivery fees',
        'Limited deals access',
        'Basic support only'
      ]
    },
    {
      id: 'plus',
      name: 'Vendorify Plus',
      price: 99,
      period: 'per month',
      icon: Crown,
      color: 'bg-gradient-to-r from-[#1A6950] to-emerald-600 text-white',
      borderColor: 'border-[#1A6950]',
      popular: true,
      features: [
        'Free delivery on orders above ₹100',
        'Exclusive deals and discounts',
        'Priority customer support',
        'Early access to new vendors',
        '2x loyalty points multiplier',
        'Advanced order tracking',
        'Personalized recommendations'
      ],
      savings: 'Save up to ₹500 monthly on delivery'
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
        className="bg-white rounded-[32px] p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
              Upgrade Your Experience
            </h2>
            <p className="text-gray-600">
              Get more value with Vendorify Plus membership
            </p>
          </div>
        -10 orders per month
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Questions about membership? <span className="text-[#1A6950] font-bold cursor-pointer hover:underline">Contact Support</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerSubscriptionPlans;ext-[#1A6950] mb-1">₹200</div>
                <div className="text-xs font-bold text-gray-600 uppercase">Exclusive Discounts</div>
              </div>
            </div>
            
            <p className="text-sm font-bold text-gray-700 mt-4">
              Total Monthly Savings: <span className="text-[#1A6950]">₹600</span> vs Plan Cost: <span className="text-[#1A6950]">₹99</span>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              *Based on average customer usage of 8e with Vendorify Plus
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-white rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-[#1A6950] mb-1">₹400</div>
                <div className="text-xs font-bold text-gray-600 uppercase">Avg. Delivery Savings</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center">
                <div className="text-2xl font-black te/80">
                Get faster response times and dedicated customer care
              </p>
            </div>
          </div>
        </div>

        {/* Savings Calculator */}
        <div className="bg-[#CDF546] rounded-[24px] p-6 text-gray-900">
          <div className="text-center">
            <h4 className="font-black text-xl uppercase tracking-tight mb-2">
              Monthly Savings Calculator
            </h4>
            <p className="text-gray-700 mb-4">
              See how much you can savbold text-lg mb-2">Exclusive Deals</h4>
              <p className="text-white/80">
                Access member-only discounts and early bird offers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Heart size={32} />
              </div>
              <h4 className="font-bold text-lg mb-2">Priority Support</h4>
              <p className="text-whitk size={32} />
              </div>
              <h4 className="font-bold text-lg mb-2">Free Delivery</h4>
              <p className="text-white/80">
                No delivery charges on orders above ₹100. Save ₹20-50 per order!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Gift size={32} />
              </div>
              <h4 className="font-">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
              Plus Member Benefits
            </h3>
            <p className="text-white/80">
              Enjoy premium perks and save money on every order
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Truc.
                  </div>
                ) : selectedPlan === plan.id ? (
                  'Current Plan'
                ) : plan.price === 0 ? (
                  'Current Plan'
                ) : (
                  'Upgrade Now'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Benefits Showcase */}
        <div className="bg-gradient-to-r from-[#1A6950] to-emerald-700 rounded-[24px] p-8 text-white mb-8">
          <div className="text-center mb-8ault'
                    : plan.popular
                    ? 'bg-[#1A6950] text-white hover:bg-[#145240]'
                    : 'bg-gray-900 text-white hover:bg-black'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing..            {feature}
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
                    ? 'bg-green-500 text-white cursor-def      </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">
          
                    </span>
                  )}
                </div>
                {plan.price === 0 && (
                  <p className="text-[#1A6950] font-bold text-lg uppercase tracking-wide">
                    {plan.period}
                  </p>
                )}
                {plan.savings && (
                  <p className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full inline-block">
                    {plan.savings}
                  </p>
                )}
        an.icon size={40} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-black text-gray-900">
                    ₹{plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 text-lg ml-2">
                      /{plan.period.split(' ')[1]}              <div className="bg-[#CDF546] text-gray-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={12} />
                    Recommended
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`w-20 h-20 ${plan.color} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
                  <pl 0.1 }}
              className={`relative rounded-[24px] p-8 border-2 transition-all hover:scale-105 ${
                selectedPlan === plan.id 
                  ? `${plan.borderColor} shadow-xl` 
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.popular ? 'ring-4 ring-[#CDF546] ring-opacity-50' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
      <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index *