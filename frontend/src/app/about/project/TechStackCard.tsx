import { motion } from "framer-motion"

interface TechStackCardProps {
  title: string
  description: string
}

export default function TechStackCard({ title, description }: TechStackCardProps) {
  return (
    <motion.div 
      className="bg-purple-800/30 rounded-lg p-4"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </motion.div>
  )
}

