import { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-lfc-red via-lfc-red/95 to-lfc-red/90 dark:from-[var(--bg-elevated)] dark:via-[var(--bg-elevated)]/95 dark:to-[var(--bg-elevated)]/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white/90 dark:text-gray-300 max-w-3xl">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-8 rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-primary)]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
            
            {status === "success" && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-400">✅ Message sent successfully! We'll get back to you soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-lfc-red bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-lfc-red bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-lfc-red bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-lfc-red bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-lfc-red hover:bg-lfc-red/90 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <FaPaperPlane />
                <span>{status === "sending" ? "Sending..." : "Send Message"}</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-8">
                We're here to help and answer any questions you might have. We look forward to hearing from you!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-lfc-red/10 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="text-lfc-red dark:text-red-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Address</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    LFC Jahi Abuja<br />
                    Jahi District, Abuja<br />
                    Federal Capital Territory, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-lfc-gold/10 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <FaEnvelope className="text-lfc-gold dark:text-yellow-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                  <a href="mailto:info@lfcjahi.edu.ng" className="text-lfc-red dark:text-red-400 hover:underline">
                    info@lfcjahi.edu.ng
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-lfc-red/10 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <FaPhone className="text-lfc-red dark:text-red-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                  <a href="tel:+2348012345678" className="text-lfc-red dark:text-red-400 hover:underline">
                    +234 801 234 5678
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--bg-elevated)] p-6 rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-primary)]">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Office Hours</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><span className="font-medium">Monday - Friday:</span> 8:00 AM - 6:00 PM</p>
                <p><span className="font-medium">Saturday:</span> 9:00 AM - 2:00 PM</p>
                <p><span className="font-medium">Sunday:</span> Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
