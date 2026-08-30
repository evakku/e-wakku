"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";

interface IssueCoverProps {
  title: string;
  coverImage: string;
}

export default function IssueCover({ title, coverImage }: IssueCoverProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  // slideRight motion parameters
  const slideRightVariants = {
    hidden: { x: shouldReduceMotion ? 0 : -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Custom premium editorial bezier ease-out
      },
    },
  };

  return (
    <motion.div
      variants={slideRightVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex justify-center items-center py-4 sm:py-6 lg:py-8"
    >
      <div className="w-full max-w-[250px] sm:max-w-[290px] lg:max-w-[320px] mx-auto">
        <div 
          className="relative group block w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md transition-all duration-500 ease-out hover:shadow-xl"
          style={{ contentVisibility: "auto" }}
        >
          {/* Aspect ratio container: Portrait 3:4 aspect ratio */}
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`Cover art of the issue: ${title}`}
                fill
                priority
                unoptimized={isSupabaseStorageUrl(coverImage)}
                sizes="(max-width: 768px) 290px, 320px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-light">
                No Cover Image
              </div>
            )}

            {/* Premium overlay: Subtle ambient shading */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/5 opacity-80 pointer-events-none" />

            {/* Luxury light shine layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
