import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Footer() {
  const batteryCategories = [
    { name: "Residential BESS", path: "/category/residential" },
    { name: "Commercial Energy Storage", path: "/category/commercial" },
    { name: "Second-Life Batteries", path: "/category/second-life" },
    { name: "Industrial Solutions", path: "/category/industrial" },
    { name: "Grid-Scale Systems", path: "/category/grid-scale" },
    { name: "Solar Battery Integration", path: "/category/solar-integration" },
  ];

  const marketplaceLinks = [
    { name: "Buy Batteries", path: "/marketplace?type=buy" },
    { name: "Sell Your System", path: "/list-battery" },
    { name: "Rent Energy Storage", path: "/marketplace?type=rent" },
    { name: "Pricing & Fees", path: "/pricing" },
    { name: "Marketplace Guidelines", path: "/guidelines" },
  ];

  const aboutLinks = [
    { name: "Our Story", path: "/about" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Trust & Safety", path: "/trust-safety" },
    { name: "Technical Certification", path: "/certification" },
    { name: "Contact Us", path: "/contact" },
    { name: "Battery Knowledge Hub", path: "/knowledge-hub" },
  ];

  const socialLinks = [
    { name: "LinkedIn", icon: "ri-linkedin-fill" },
    { name: "Twitter", icon: "ri-twitter-fill" },
    { name: "Facebook", icon: "ri-facebook-fill" },
    { name: "Instagram", icon: "ri-instagram-fill" },
  ];

  const footerLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookies", path: "/cookies" },
    { name: "Accessibility", path: "/accessibility" },
  ];

  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                className="bg-white text-black p-1.5 relative"
                style={{ 
                  clipPath: "polygon(18% 0%, 82% 0%, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0% 82%, 0% 18%)",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                whileHover={{ rotate: 45 }}
                transition={{ duration: 0.4 }}
              >
                <i className="ri-cube-line text-xl"></i>
              </motion.div>
              <span className="font-heading font-bold text-xl text-black bg-white px-2 rounded-md">rebatrix</span>
            </div>
            <p className="text-white">
              The leading B2B marketplace for battery energy storage systems in Europe.
            </p>
          </div>
          
          <div className="flex space-x-4 mb-6 md:mb-0">
            {socialLinks.map((link) => (
              <motion.a 
                key={link.name}
                href="#" 
                className="text-white hover:text-white"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className={`${link.icon} text-xl`}></i>
                <span className="sr-only">{link.name}</span>
              </motion.a>
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-white flex flex-col md:flex-row justify-between items-center mt-4">
          <div className="text-white mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} rebatrix GmbH. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.path} className="text-white hover:text-white text-sm">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
