"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ContactModal from "./ContactModal";

interface ContactButtonProps {
  className?: string;
  buttonText?: string;
  showDescription?: boolean;
  description?: string;
  variant?: "default" | "compact";
}

export default function ContactButton({
  className = "",
  buttonText = "Let's Connect!",
  showDescription = true,
  description = "Want to Chat?",
  variant = "default"
}: ContactButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (variant === "compact") {
    return (
      <>
        <motion.button
          onClick={handleOpenModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl shadow-lg hover:bg-neutral-700/30 transition-all duration-300 text-accent font-semibold ${className}`}
        >
          {buttonText}
        </motion.button>

        {mounted && createPortal(
          <ContactModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />,
          document.body
        )}
      </>
    );
  }

  return (
    <>
      {/* Trigger Button with Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      >
        {showDescription && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-muted-text text-sm font-medium"
          >
            {description}
          </motion.p>
        )}

        <motion.button
          onClick={handleOpenModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-2xl shadow-lg hover:bg-neutral-700/30 transition-all duration-300 text-accent font-semibold"
        >
          {buttonText}
        </motion.button>
      </motion.div>

      {/* Modal */}
      {mounted && createPortal(
        <ContactModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />,
        document.body
      )}
    </>
  );
}
