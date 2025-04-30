import { motion } from "framer-motion";
import { Link } from "wouter";

interface CategoryProps {
  id: string;
  title: string;
  description: string;
  imagePosition?: string;
  link: string;
}

export function CategoryCard({ category }: { category: CategoryProps }) {
  return (
    <div className="group relative overflow-hidden transition-all h-48">
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4">
        <motion.h3 
          className="font-heading text-2xl md:text-3xl font-bold text-black mb-1 text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {category.title}
        </motion.h3>
        <p className="text-black text-xs text-center">{category.description}</p>
        
        <motion.div
          className="mt-3 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
          initial={{ y: 6, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
        >
          <Link href={category.link}>
            <div className="inline-block">
              <motion.button 
                className="inline-flex items-center text-white bg-black hover:bg-black/90 px-4 py-2 rounded-full text-sm font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore {category.title.split(" ")[0]} <i className="ri-arrow-right-line ml-1"></i>
              </motion.button>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
