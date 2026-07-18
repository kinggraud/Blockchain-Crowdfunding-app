import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-[#1c1c24] mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-[#8c6dfd] transition-colors"
      >
        <span className="font-bold text-lg dark:text-white text-slate-900">{question}</span>
        <span className={`text-2xl transition-transform ${isOpen ? 'rotate-45' : 'rotate-0'}`}>+</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-600 dark:text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpCenter = () => {
  const faqs = [
    {
      question: "How does the Departmental Vetting work?",
      answer: "Every campaign must be linked to a verified academic domain. The Department Head (Admin) must approve the domain registration before a student can launch a campaign under that banner, ensuring 100% academic legitimacy."
    },
    {
      question: "Is my donation secure?",
      answer: "Yes. All transactions are handled by Solidity smart contracts. Funds are transferred directly to the campaign creator's wallet once the transaction is confirmed on the blockchain, with no middleman holding your money."
    },
    {
      question: "Which cryptocurrency can I use?",
      answer: "Currently, FundSphere supports Ethereum (ETH) for all donations and campaign goals."
    },
    {
      question: "How do I become a verified Admin?",
      answer: "Admin roles are assigned through the smart contract's owner. If you are a department head, please contact our support team with your institutional credentials."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f12] py-20 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold dark:text-white text-slate-900 mb-4"
          >
            Protocol <span className="text-[#8c6dfd]">Support</span>
          </motion.h1>
          <p className="text-slate-600 dark:text-gray-400">Everything you need to know about the FundSphere ecosystem.</p>
        </div>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 dark:text-white text-slate-900">Frequently Asked Questions</h2>
          <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 border border-slate-200 dark:border-[#3a3a43] shadow-xl">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <div className="bg-gradient-to-br from-[#8c6dfd] to-[#4acd8d] p-[1px] rounded-[32px]">
            <div className="bg-white dark:bg-[#13131a] rounded-[32px] p-10">
              <h2 className="text-3xl font-bold mb-2 dark:text-white text-slate-900">Still have questions?</h2>
              <p className="text-slate-600 dark:text-gray-400 mb-8">Send a direct message to our core developers.</p>

              <form action="https://formspree.io/f/xpqorpgn" method="POST" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2 dark:text-gray-400 text-slate-600">Full Name</label>
                    <input type="text" name="name" required className="bg-slate-50 dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-xl p-4 outline-none focus:border-[#8c6dfd] transition-all text-slate-900 dark:text-white" placeholder="John Doe" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-bold mb-2 dark:text-gray-400 text-slate-600">Email Address</label>
                    <input type="email" name="_replyto" required className="bg-slate-50 dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-xl p-4 outline-none focus:border-[#8c6dfd] transition-all text-slate-900 dark:text-white" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold mb-2 dark:text-gray-400 text-slate-600">Your Message</label>
                  <textarea name="message" rows="5" required className="bg-slate-50 dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-xl p-4 outline-none focus:border-[#8c6dfd] transition-all text-slate-900 dark:text-white" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="w-full bg-[#8c6dfd] py-4 rounded-xl font-bold text-white hover:bg-[#7a59e6] transition-all shadow-lg shadow-[#8c6dfd]/20">
                  Send Protocol Message
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HelpCenter;