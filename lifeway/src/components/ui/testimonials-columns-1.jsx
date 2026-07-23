import React from "react";
import { motion } from "framer-motion";
import { User, Star } from "lucide-react";

export const TestimonialsColumn = (props) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, name, stars }, i) => (
              <div
                key={i}
                className="p-10 rounded-3xl border border-gray-100 bg-white shadow-lg shadow-lw-pink/10 max-w-xs w-full"
              >
                {stars && (
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, s) => (
                      <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                )}
                <div className="text-gray-600 text-sm leading-relaxed">"{text}"</div>
                <div className="flex items-center gap-3 mt-5">
                  <div className="h-10 w-10 rounded-full bg-lw-pink-light flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-lw-pink" />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-semibold text-lw-navy text-sm tracking-tight leading-5">{name}</div>
                    <div className="text-xs leading-5 text-gray-400 tracking-tight">Google Review</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
};
