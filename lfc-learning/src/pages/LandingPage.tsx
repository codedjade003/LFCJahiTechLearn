
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import LoginForm from "../components/LoginForm";

export default function Landing() {

  return (
    <div className="bg-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-pattern py-16 md:py-24">
        <div className="w-full max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Left Text */}
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-redCustom mb-4">
              Technical Unit Training Platform
            </h2>
            <p className="text-gray-700 mb-6">
              Access training materials, courses, and resources exclusively for
              LFC Jahi Abuja Technical Unit members.
            </p>
          </div>

          {/* Login Card */}
          <div className="md:w-1/2 flex justify-center">
              <LoginForm/>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
