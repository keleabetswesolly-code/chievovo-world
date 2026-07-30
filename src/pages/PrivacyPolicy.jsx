import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Shield className="w-5 h-5 text-[#00D4FF]" />
        <h1 className="text-lg font-bold">Privacy Policy</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8 text-sm leading-relaxed text-gray-300">
        <div>
          <p className="text-gray-400 text-xs">Last updated: July 30, 2026</p>
          <p className="mt-3">
            CHIEVOVO WORLD ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile and web application.
          </p>
        </div>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">1. Information We Collect</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-400">
            <li><span className="text-gray-300">Account Information:</span> Name and email address when you register.</li>
            <li><span className="text-gray-300">Usage Data:</span> Pages visited, tracks played, and features used within the app.</li>
            <li><span className="text-gray-300">Device Information:</span> Device type, operating system, and app version for compatibility and performance.</li>
            <li><span className="text-gray-300">Purchase Data:</span> Order details and payment information when you shop (payment is processed securely via Stripe — we do not store card details).</li>
            <li><span className="text-gray-300">Cached Data:</span> Track metadata stored locally on your device to enable offline playback.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">2. How We Use Your Information</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-400">
            <li>To provide and personalise the CHIEVOVO WORLD experience.</li>
            <li>To process orders and send transactional emails.</li>
            <li>To improve app performance and fix issues.</li>
            <li>To surface music recommendations and curated content.</li>
            <li>To communicate updates about new features or products (you can opt out at any time).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">3. Third-Party Services</h2>
          <p className="text-gray-400">
            We integrate with the following third-party services. Each has its own privacy policy:
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400">
            <li><span className="text-gray-300">YouTube (Google LLC)</span> — for music streaming and discovery.</li>
            <li><span className="text-gray-300">Stripe</span> — for secure payment processing.</li>
          </ul>
          <p className="mt-2 text-gray-400">
            We do not sell or share your personal data with third parties for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">4. Data Storage & Security</h2>
          <p className="text-gray-400">
            Your data is stored securely on our servers. We use industry-standard encryption (HTTPS/TLS) for all data in transit. Locally cached data (for offline playback) is stored only on your device and can be cleared at any time from your device settings.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">5. Device Permissions</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-400">
            <li><span className="text-gray-300">Internet Access:</span> Required for streaming music and loading content.</li>
            <li><span className="text-gray-300">Storage:</span> Used only to cache track metadata locally for offline use.</li>
            <li><span className="text-gray-300">Network State:</span> Used to detect offline/online status and adjust playback accordingly.</li>
          </ul>
          <p className="mt-2 text-gray-400">We do not access your microphone, camera, contacts, or location.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">6. Children's Privacy</h2>
          <p className="text-gray-400">
            CHIEVOVO WORLD is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us to have it removed.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">7. Your Rights</h2>
          <p className="text-gray-400">You have the right to:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-400">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Withdraw consent for marketing communications at any time.</li>
            <li>Request a copy of your data in a portable format.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">8. Changes to This Policy</h2>
          <p className="text-gray-400">
            We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email or in-app notification. Continued use of the app after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">9. Contact Us</h2>
          <p className="text-gray-400">
            If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us through the app's support section or reach out via our official social media channels.
          </p>
        </section>

        <div className="pt-4 border-t border-white/10 text-center text-gray-600 text-xs">
          © 2026 CHIEVOVO WORLD. All rights reserved.
        </div>
      </div>
    </div>
  );
}