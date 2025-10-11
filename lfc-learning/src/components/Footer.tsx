export default function Footer() {
  return (
    <footer className="bg-redCustom text-white py-8">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <i className="fas fa-church text-2xl text-goldCustom"></i>
              <h2 className="text-xl px-5 md:px-0 font-bold">LFC Jahi Abuja</h2>
            </div>
            <p className="text-sm mt-2">Technical Unit Training Platform</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-goldCustom transition">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="hover:text-goldCustom transition">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-goldCustom transition">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="border-t border-goldCustom border-opacity-30 mt-6 pt-6 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} LFC Jahi Abuja. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
