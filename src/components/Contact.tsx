import { useState } from "react";
import emailjs from "@emailjs/browser";
import Footer from "./ui/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setError("All fields are required!");
      return;
    }

    try {
      const serviceID = "demiffy";
      const templateID = "demiffytemp";
      const publicKey = "6V_QGpJhi5cnnJND6";

      const templateParams = {
        to_name: "Recipient Name",
        from_name: formData.name,
        message: formData.message,
        reply_to: formData.email
      };

      await emailjs.send(serviceID, templateID, templateParams, publicKey);

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setError("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send your message. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white">
      <div className="flex-grow flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-700 p-10 rounded-lg shadow-lg w-full max-w-3xl"
        >
          <h1 className="text-4xl font-bold text-sky-400 mb-8 text-center">Contact Me</h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-4">
              Your message has been sent successfully!
            </p>
          )}

          <div className="mb-6">
            <label className="block text-sky-400 font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sky-400 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sky-400 font-medium mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your message"
              rows={6}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;