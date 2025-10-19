export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-lfc-red via-lfc-red/95 to-lfc-red/90 dark:from-[var(--bg-elevated)] dark:via-[var(--bg-elevated)]/95 dark:to-[var(--bg-elevated)]/90 text-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-white/90 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-primary)] p-8 md:p-12 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using the LFC Jahi Abuja Technical Training platform ("Platform"), you accept and agree to be 
              bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. User Accounts</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                To access certain features of the Platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="leading-relaxed">
                You may not use another person's account without permission. We reserve the right to suspend or terminate 
                accounts that violate these Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Course Enrollment and Access</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                When you enroll in a course:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You gain access to course materials for the duration specified</li>
                <li>Access may be revoked if you violate these Terms</li>
                <li>Course content and structure may be updated without notice</li>
                <li>Completion certificates are awarded based on meeting course requirements</li>
                <li>You may not share your account access with others</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Intellectual Property Rights</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                All content on the Platform, including but not limited to text, graphics, logos, videos, and software, is the 
                property of LFC Jahi Abuja or its content suppliers and is protected by intellectual property laws.
              </p>
              <p className="leading-relaxed">
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Copy, modify, or distribute course materials without permission</li>
                <li>Record, screenshot, or share course videos</li>
                <li>Use automated tools to access or download content</li>
                <li>Remove copyright or proprietary notices</li>
                <li>Use content for commercial purposes without authorization</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. User Conduct</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Post or transmit harmful, offensive, or inappropriate content</li>
                <li>Harass, threaten, or intimidate other users or instructors</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with the Platform's operation or security</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Use the Platform for any fraudulent or illegal purpose</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Payment and Refunds</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                For paid courses:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All fees are stated in Nigerian Naira (NGN) unless otherwise specified</li>
                <li>Payment must be completed before accessing course materials</li>
                <li>Refund requests must be made within 7 days of enrollment</li>
                <li>Refunds are subject to our refund policy and may be denied if significant course progress has been made</li>
                <li>We reserve the right to change course prices at any time</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Disclaimers and Limitations of Liability</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                The Platform and all content are provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uninterrupted or error-free operation of the Platform</li>
                <li>Specific learning outcomes or career advancement</li>
                <li>Accuracy or completeness of course content</li>
                <li>That the Platform will meet your specific requirements</li>
              </ul>
              <p className="leading-relaxed mt-4">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Platform.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Termination</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate your account and access to the Platform at any time, with or without 
              notice, for any reason, including violation of these Terms. Upon termination, your right to use the Platform will 
              immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Modifications to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or 
              through the Platform. Your continued use of the Platform after changes are posted constitutes acceptance of the 
              modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. 
              Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction 
              of the courts of Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong> <a href="mailto:legal@lfcjahi.edu.ng" className="text-lfc-red dark:text-red-400 hover:underline">legal@lfcjahi.edu.ng</a></p>
              <p><strong>Address:</strong> LFC Jahi Abuja, Jahi District, Abuja, FCT, Nigeria</p>
            </div>
          </section>

          <div className="mt-8 p-6 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)]">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By using the LFC Jahi Abuja Technical Training platform, you acknowledge that you have read, understood, and 
              agree to be bound by these Terms of Service.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
