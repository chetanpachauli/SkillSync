"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, ShieldCheck, Loader2, Award, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 499 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "SkillSync Premium",
        description: "Unlimited AI features & mock interviews",
        order_id: data.id,
        handler: function (response) {
          setPaymentDetails({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          });
          setPaymentSuccess(true);
        },
        prefill: {
          name: "SkillSync User",
          email: "user@skillsync.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment setup error:", error);
      alert(error.message || "An error occurred during checkout setup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="relative py-20 px-6 md:px-16 overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            <Sparkles size={16} className="animate-pulse" />
            <span>Pricing Plans</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Upgrade Your <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Interview Game</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Choose the perfect plan to accelerate your interview preparation and land your dream tech job.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="flex flex-col justify-between p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-zinc-800 dark:text-white">Free Starter</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Perfect for testing the waters</p>
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-extrabold text-zinc-800 dark:text-white">₹0</span>
                <span className="text-zinc-500 dark:text-zinc-400 ml-2">/ month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="text-emerald-500 mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-600 dark:text-zinc-300">Basic Resume Analysis (1/day)</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-500 mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-600 dark:text-zinc-300">3 AI Mock Interview Simulations</span>
                </li>
                <li className="flex items-start text-zinc-400 dark:text-zinc-600">
                  <X className="mr-3 mt-1 shrink-0" size={18} />
                  <span>Unlimited AI Resume Analyzer uploads</span>
                </li>
                <li className="flex items-start text-zinc-400 dark:text-zinc-600">
                  <X className="mr-3 mt-1 shrink-0" size={18} />
                  <span>Real-time code compiler in interviews</span>
                </li>
                <li className="flex items-start text-zinc-400 dark:text-zinc-600">
                  <X className="mr-3 mt-1 shrink-0" size={18} />
                  <span>Premium Interview improvement roadmap</span>
                </li>
              </ul>
            </div>
            <Button variant="outline" className="w-full py-6 text-base font-semibold" disabled>
              Current Plan
            </Button>
          </div>

          {/* Premium Tier */}
          <div className="relative flex flex-col justify-between p-8 rounded-3xl bg-zinc-900 dark:bg-black border-2 border-blue-500 shadow-2xl transition-all duration-300 hover:shadow-blue-500/20 hover:-translate-y-1 text-white">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Zap size={12} /> Most Popular
            </div>

            <div>
              <div className="mb-6 mt-2">
                <h3 className="text-2xl font-bold">Premium Pro</h3>
                <p className="text-zinc-400 text-sm mt-1">Unlock full potential of ChetanAI</p>
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">₹499</span>
                <span className="text-zinc-400 ml-2">/ month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="text-blue-400 mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-200">Unlimited Resume uploads & analysis</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-blue-400 mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-200">Unlimited AI Mock Interviews</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-blue-400 mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-200">Real-time Compiler & Coding challenges</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-blue-400 mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-200">Detailed Feedback & Improvement Roadmap</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-blue-400 mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-200">Priority 24/7 Support with Experts</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleUpgrade}
              className="w-full py-6 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 transition-transform active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initializing Checkout...
                </>
              ) : (
                "Upgrade to Premium"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Notification Modal */}
      <AnimatePresence>
        {paymentSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
            >
              {/* Inner Success Glow */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={36} />
              </div>

              <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Thank you! Your account has been upgraded to Premium Pro. Enjoy unlimited features.
              </p>

              {paymentDetails && (
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 text-left text-sm space-y-2 border border-zinc-150 dark:border-zinc-800 mb-6 font-mono text-zinc-700 dark:text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payment ID:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 select-all">{paymentDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Order ID:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 select-all">{paymentDetails.orderId}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setPaymentSuccess(false)}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Pricing;
