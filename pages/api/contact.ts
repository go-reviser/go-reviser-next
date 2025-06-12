import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/sendEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Send the contact message via email to the site owner
  try {
    await sendEmail({
      to: process.env.EMAIL_USER!,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });
  } catch (err) {
    console.error('Error sending contact email:', err);
    return res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }

  return res.status(200).json({ message: 'Thank you for contacting us!' });
} 