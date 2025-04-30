import { motion } from "framer-motion";
import { Link } from "wouter";
import { staggerContainer, fadeInUp } from "@/lib/motion";

export default function MarketplaceOptions() {
  const options = [
    {
      title: "Buy",
      description: "Purchase new or second-life batteries directly from manufacturers or resellers.",
      icon: "ri-shopping-cart-2-line",
      link: "/marketplace?type=buy",
      linkText: "Browse Inventory"
    },
    {
      title: "Sell",
      description: "List your new or used battery systems for sale on our marketplace.",
      icon: "ri-coin-line",
      link: "/list-battery?type=sell",
      linkText: "Start Selling"
    },
    {
      title: "Rent",
      description: "Get temporary energy storage solutions for projects or peak demand periods.",
      icon: "ri-time-line",
      link: "/marketplace?type=rent",
      linkText: "Rental Options"
    },
    {
      title: "Lend",
      description: "Offer your idle battery systems for rent and generate passive income.",
      icon: "ri-exchange-line",
      link: "/list-battery?type=lend",
      linkText: "Lend Your Batteries"
    }
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <motion.h2
            className="font-heading text-2xl md:text-3xl font-bold text-black mb-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Your Battery Marketplace
          </motion.h2>
          <motion.p
            className="text-neutral-700 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Choose how you want to participate in Europe's leading battery exchange platform
          </motion.p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {options.map((option, index) => (
            <motion.div
              key={option.title}
              className="bg-neutral-100 rounded-md p-5 border border-neutral-200 hover:border-black transition-all duration-200"
              variants={fadeInUp}
              custom={index}
            >
              <motion.div
                className="w-10 h-10 bg-neutral-200 rounded-md flex items-center justify-center mb-3"
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <i className={`${option.icon} text-xl text-black`}></i>
              </motion.div>
              <h3 className="font-heading text-base font-semibold mb-2 text-black">{option.title}</h3>
              <p className="text-neutral-700 text-sm mb-3">{option.description}</p>
              <Link href={option.link} className="text-black hover:text-neutral-600 font-medium inline-flex items-center text-sm">
                {option.linkText} <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
