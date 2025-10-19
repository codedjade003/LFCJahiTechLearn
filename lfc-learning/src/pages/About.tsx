import { Link } from "react-router-dom";
import { FaGraduationCap, FaUsers, FaChalkboardTeacher, FaAward } from "react-icons/fa";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-lfc-red via-lfc-red/95 to-lfc-red/90 dark:from-[var(--bg-elevated)] dark:via-[var(--bg-elevated)]/95 dark:to-[var(--bg-elevated)]/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About LFC Jahi Abuja</h1>
          <p className="text-xl text-white/90 dark:text-gray-300 max-w-3xl">
            Empowering the next generation of tech professionals through innovative learning solutions and hands-on training.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              At LFC Jahi Abuja Technical Training, we are committed to providing world-class technical education 
              that bridges the gap between academic knowledge and industry requirements.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Our platform combines cutting-edge technology with expert instruction to deliver an unparalleled 
              learning experience that prepares students for successful careers in technology.
            </p>
          </div>
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-8 rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-primary)]">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
            <p className="text-gray-700 dark:text-gray-300">
              To become the leading technical training institution in Nigeria, recognized for excellence in 
              education, innovation, and student success. We envision a future where every student has access 
              to quality technical education that transforms their career prospects.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lfc-red/10 dark:bg-red-900/30 rounded-full mb-4">
              <FaGraduationCap className="text-3xl text-lfc-red dark:text-red-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-400">Students Trained</div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lfc-gold/10 dark:bg-yellow-900/30 rounded-full mb-4">
              <FaChalkboardTeacher className="text-3xl text-lfc-gold dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">20+</div>
            <div className="text-gray-600 dark:text-gray-400">Expert Instructors</div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lfc-red/10 dark:bg-red-900/30 rounded-full mb-4">
              <FaUsers className="text-3xl text-lfc-red dark:text-red-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
            <div className="text-gray-600 dark:text-gray-400">Courses Available</div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lfc-gold/10 dark:bg-yellow-900/30 rounded-full mb-4">
              <FaAward className="text-3xl text-lfc-gold dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[var(--bg-elevated)] p-6 rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-primary)]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Excellence</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We strive for excellence in everything we do, from course content to student support, 
                ensuring the highest quality education.
              </p>
            </div>
            <div className="bg-white dark:bg-[var(--bg-elevated)] p-6 rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-primary)]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Innovation</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We embrace cutting-edge technologies and teaching methods to provide students with 
                relevant, industry-aligned skills.
              </p>
            </div>
            <div className="bg-white dark:bg-[var(--bg-elevated)] p-6 rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-primary)]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Community</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We foster a supportive learning community where students, instructors, and industry 
                professionals collaborate and grow together.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-lfc-red to-lfc-red/90 dark:from-[var(--bg-elevated)] dark:to-[var(--bg-elevated)]/90 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-white/90 dark:text-gray-300">
            Join thousands of students who have transformed their careers with us.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-lfc-gold hover:bg-lfc-gold-hover text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
}
