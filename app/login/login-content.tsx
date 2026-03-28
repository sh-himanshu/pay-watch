"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Shield } from "lucide-react";
import { LoginButton } from "./login-button";
import { scaleIn, fadeIn } from "@/lib/animations";

export function LoginContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen items-center justify-center px-6"
      style={{
        background: "radial-gradient(ellipse at center, var(--pw-color-accent-light) 0%, var(--pw-color-background) 70%)",
      }}
    >
      <div className="w-full max-w-sm text-center">
        {/* Animated Shield Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Shield icon container */}
          <motion.div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #6366f1, #2563eb)",
              boxShadow: "0 0 40px rgba(99, 102, 241, 0.3)",
            }}
            initial={{ scale: 0, rotate: -10 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <motion.svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
            >
              <motion.path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
              />
            </motion.svg>
          </motion.div>

          {/* App name */}
          <motion.h1
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Pay<span className="text-accent">Watch</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="mt-2 text-sm text-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Your bills, watched and protected
          </motion.p>
        </motion.div>

        {/* Login card */}
        <motion.div
          className="rounded-xl border border-border bg-surface/80 p-6 space-y-6 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 1.1 }}
        >
          <div>
            <motion.p
              className="text-lg font-semibold"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.3 }}
            >
              Welcome back
            </motion.p>
            <motion.p
              className="mt-1 text-sm text-muted"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.4 }}
            >
              Sign in to manage your bills
            </motion.p>
          </div>

          <LoginButton />

          <div className="flex items-start gap-3 text-left">
            <Shield size={16} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs text-muted">
              We use read-only Gmail access to find bills. We never send, modify,
              or delete your emails. Only billing details (amount, due date,
              biller name) are stored.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
