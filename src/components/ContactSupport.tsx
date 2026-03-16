import React from 'react';
import { motion } from 'motion/react';
import { X, Mail, MessageSquare, HelpCircle } from 'lucide-react';

interface ContactSupportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupport: React.FC<ContactSupportProps> = ({ isOpen, onClose }) => {
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
        className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-8 md:p-12"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-serif italic text-stone-900">Contact Support</h2>
            <p className="text-stone-400 text-sm mt-1">We're here to help you.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-stone-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 mb-1">Email Support</h4>
              <p className="text-stone-500 text-sm mb-3">For general inquiries and technical issues.</p>
              <a 
                href="mailto:arthi.eaglenewz@gmail.com" 
                className="text-stone-900 font-medium underline underline-offset-4"
              >
                arthi.eaglenewz@gmail.com
              </a>
            </div>
          </div>

          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 mb-1">Feedback</h4>
              <p className="text-stone-500 text-sm">Have a suggestion? We'd love to hear from you to improve ExpiryGuard.</p>
            </div>
          </div>

          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 mb-1">Help Center</h4>
              <p className="text-stone-500 text-sm">Check our FAQ section on the landing page for quick answers.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 py-4 bg-stone-900 text-white rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-stone-200"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};
