import { motion } from "framer-motion";
import { Link } from "wouter";
import { CategoryCard } from "@/components/ui/category-card";

export default function BatteryCategories() {
  const mainCategories = [
    {
      id: "residential",
      title: "Residential BESS",
      description: "Home energy storage solutions for self-consumption and backup power",
      imagePosition: "center",
      link: "/category/residential"
    },
    {
      id: "commercial",
      title: "Commercial BESS",
      description: "Medium to large scale solutions for businesses and industrial applications",
      imagePosition: "center",
      link: "/category/commercial"
    },
    {
      id: "second-life",
      title: "Second-Life Batteries",
      description: "Repurposed EV and industrial batteries for sustainable energy storage",
      imagePosition: "center",
      link: "/category/second-life"
    },
    {
      id: "industrial",
      title: "Industrial Systems",
      description: "Heavy-duty energy storage solutions for manufacturing and utility applications",
      imagePosition: "center",
      link: "/category/industrial"
    }
  ];
  
  const miniCategories = [
    {
      title: "Lithium-Ion",
      description: "High energy density solutions",
      icon: "ri-battery-2-charge-line",
      link: "/technology/lithium-ion"
    },
    {
      title: "Flow Batteries",
      description: "Long duration storage systems",
      icon: "ri-leaf-line",
      link: "/technology/flow"
    },
    {
      title: "Solar Integration",
      description: "PV-optimized batteries",
      icon: "ri-sun-line",
      link: "/category/solar-integration"
    },
    {
      title: "Grid Services",
      description: "Frequency regulation systems",
      icon: "ri-cloud-line",
      link: "/application/grid-services"
    }
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-black mb-2">Battery Categories</h2>
          <p className="text-black max-w-2xl mx-auto">Explore our comprehensive selection of energy storage solutions</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {miniCategories.map((category, index) => (
            <Link href={category.link} key={category.title}>
              <motion.div
                className="p-3 transition-all flex items-center cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <motion.div
                  className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mr-3"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <i className={`${category.icon} text-lg text-white`}></i>
                </motion.div>
                <div>
                  <motion.h4 
                    className="font-heading font-semibold text-base text-black mb-0"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {category.title}
                  </motion.h4>
                  <p className="text-xs text-black">{category.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
