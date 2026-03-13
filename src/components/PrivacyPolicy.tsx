import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 md:p-12"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-serif italic text-stone-900">Privacy Policy</h2>
            <p className="text-stone-400 text-sm mt-1">Last updated: March 13, 2026</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-stone-400" />
          </button>
        </div>

        <div className="prose prose-stone prose-sm max-w-none space-y-6 text-stone-600 leading-relaxed">
          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">Introduction</h3>
            <p>
              Welcome to ExpiryGuard. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
            </p>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">Google AdSense & Cookies</h3>
            <p>
              We use Google AdSense to serve advertisements on our site. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-stone-900 underline">Ads Settings</a>.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">Data Collection</h3>
            <p>
              ExpiryGuard stores your warranty and product data in a secure cloud database (Firebase). We collect:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Authentication data (via Google Sign-In) to secure your personal list.</li>
              <li>Product details you enter manually or via receipt scanning.</li>
              <li>Usage data to improve the application experience.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">Data Security</h3>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. Your data is stored behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
            </p>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">Contact Us</h3>
            <p>
              If you have any questions regarding this privacy policy, you may contact us using the information below:
            </p>
            <p className="mt-2 font-medium text-stone-900">arthi.eaglenewz@gmail.com</p>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-12 py-4 bg-stone-900 text-white rounded-2xl font-bold transition-transform active:scale-95"
        >
          I Understand
        </button>
      </motion.div>
    </motion.div>
  );
};
