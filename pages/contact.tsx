import { useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface ContactResponse {
  success: boolean;
  message?: string;
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { fetchApi } = useApi();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await fetchApi<ContactResponse>('/api/contact', {
        method: 'POST',
        body: form
      });

      if (data)
        setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-gray-700 text-lg text-center mb-6">
          Have questions or feedback? Fill out the form below and we&apos;ll get back to you soon!
        </p>
        {submitted ? (
          <div className="text-green-600 text-center font-medium">Thank you {form.name} for reaching out! We&apos;ll get back to you soon.</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={form.message}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 