"use client";
import Link from "next/link";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Contact Us</h1>
      <p className="text-zinc-600 dark:text-zinc-300 text-center max-w-2xl">
        Have questions or feedback? Reach out to us. We're here to help you succeed in your tech career.
      </p>
      <div className="space-y-4">
        <p>
          Email: <Link href="mailto:chetanpachauli@gmail.com" className="text-blue-600 hover:underline">chetanpachauli@gmail.com</Link>
        </p>
        <p>
          Phone: <Link href="tel:+918218102253" className="text-blue-600 hover:underline">+91 82181 02253</Link>
        </p>
      </div>
    </div>
  );
};

export default Contact;