import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ isOpen, onClose }) => {
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
            <h2 className="text-3xl font-serif italic text-stone-900">Terms of Service</h2>
            <p className="text-stone-400 text-sm mt-1">Last updated: March 16, 2026</p>
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
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">1. Acceptance of Terms</h3>
            <p>
              By accessing and using ExpiryGuard, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">2. Description of Service</h3>
            <p>
              ExpiryGuard is a tool designed to help users track product warranties and expiration dates. We provide features such as AI-powered receipt scanning, manual data entry, and notification alerts.
            </p>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">3. User Accounts</h3>
            <p>
              You must use a Google account to sign in to ExpiryGuard. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">4. User Conduct</h3>
            <p>
              You agree not to use the service for any unlawful purpose or to engage in any conduct that harms the service or its users. This includes but is not limited to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Uploading fraudulent receipts or data.</li>
              <li>Attempting to interfere with the security or integrity of the application.</li>
              <li>Using automated systems to access the service.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">5. Limitation of Liability</h3>
            <p>
              ExpiryGuard is provided "as is" without any warranties. We are not liable for any missed warranty claims, expired products, or data loss resulting from the use of our service. Users are encouraged to maintain original copies of important documents.
            </p>
          </section>

          <section>
            <h3 className="text-stone-900 font-bold uppercase tracking-widest text-xs mb-3">6. Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the service after such changes constitutes your acceptance of the new terms.
            </p>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-12 py-4 bg-stone-900 text-white rounded-2xl font-bold transition-transform active:scale-95"
        >
          Accept Terms
        </button>
      </motion.div>
    </motion.div>
  );
};
