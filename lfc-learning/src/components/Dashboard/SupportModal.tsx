import { useState } from "react";
import { FaTimes, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import axios from "axios";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/support", form); // your backend route
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-semibold text-lfc-red mb-2">Contact Support</h2>
        <p className="text-sm text-gray-600 mb-4">
          Having issues? Send us a message or reach out directly.
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lfc-red"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lfc-red"
            />
            <textarea
              name="message"
              placeholder="Describe your issue"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lfc-red"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lfc-red text-white py-2 rounded-lg hover:bg-lfc-gold hover:text-lfc-red transition-all duration-200"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium mb-3">
              ✅ Message sent successfully!
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-lfc-red text-sm hover:underline"
            >
              Send another message
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Direct contact section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <FaEnvelope className="text-lfc-red" />
            <a
              href="mailto:hello@lfctechlearn.com"
              className="hover:text-lfc-gold text-sm font-medium"
            >
              hello@lfctechlearn.com
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaWhatsapp className="text-green-500" />
            <a
              href="https://wa.me/2349015845913"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lfc-gold text-sm font-medium"
            >
              +234 901 584 5913
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
