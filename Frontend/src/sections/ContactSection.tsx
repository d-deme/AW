import React from 'react';
import { motion } from 'motion/react';
import { MapIcon, Clock, BookOpen } from 'lucide-react';
import { CitySupportTickets } from '../components/layout/CitySupportTickets';
import { useApi } from '../services/api';

interface ContactSectionProps {
  onNavigate: (page: string) => void;
}

export const ContactSection = ({ onNavigate }: ContactSectionProps) => {
  const { data: siteSettings } = useApi<any>('/site-settings');

  const email = siteSettings?.contact_email || 'info@adamacity.gov.et';
  const phone = siteSettings?.contact_phone || '+251 22 111 2345';
  const address = siteSettings?.address || 'Main Street, Central District, Adama, Ethiopia';

  return (
    <section id="contact" className="section-padding bg-neutral-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan mb-4">Contact & Support</h3>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy mb-8">Get in Touch</h2>
            <p className="text-neutral-500 text-sm md:text-lg mb-12 leading-relaxed font-medium">
              Have questions or need assistance? Reach out to the Adama City Administration. 
              We are here to serve you and ensure your experience with our city is exceptional.
            </p>
            
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-cyan shrink-0 border border-neutral-100">
                  <MapIcon size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-navy mb-1">City Hall Address</h4>
                  <p className="text-base text-neutral-500 font-medium">{address}</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-cyan shrink-0 border border-neutral-100">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-navy mb-1">Office Hours</h4>
                  <p className="text-base text-neutral-500 font-medium">Monday - Friday: 8:30 AM - 5:30 PM</p>
                  <p className="text-base text-neutral-500 font-medium">Saturday: 9:00 AM - 12:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-cyan shrink-0 border border-neutral-100">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-navy mb-1">General Inquiries</h4>
                  <p className="text-base text-neutral-500 font-medium">{email}</p>
                  <p className="text-base text-neutral-500 font-medium">{phone}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <CitySupportTickets />
        </div>
      </div>
    </section>
  );
};
