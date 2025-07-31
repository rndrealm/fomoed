"use client";

import React, { ReactNode, useState } from "react";
import { motion } from "motion/react";
import AddIcon from "../icons/AddIcon";

const QuestionsContent = [
  {
    question: "What is included in the Basic plan?",
    description:
      "The Basic plan includes core features like X, Y, and Z with limited access.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    description:
      "Yes, you can cancel your subscription from your dashboard at any point.",
  },
  {
    question: "Is there a free trial available?",
    description: "Yes, we offer a 14-day free trial. No credit card required.",
  },
  {
    question: "Do you offer support for teams?",
    description:
      "Absolutely. Our Pro and Enterprise plans include team collaboration features.",
  },
  {
    question: "What payment methods do you accept?",
    description:
      "We accept all major credit cards, PayPal, and Stripe-supported methods.",
  },
  {
    question: "Can I upgrade or downgrade later?",
    description:
      "Yes, you can switch between plans at any time from your billing settings.",
  },
  {
    question: "How secure is my data?",
    description:
      "Your data is encrypted and we follow industry best practices for security.",
  },
  {
    question: "Do you offer refunds?",
    description:
      "We offer a 7-day money-back guarantee for all new subscriptions.",
  },
];

const Questions = () => {
  return (
    <>
      <section className="relative w-full mt-[4rem] sm:mt-[6rem] flex flex-col justify-between items-center gap-24 pb-24">
        <h2 className="text-[1.5rem] sm:text-[2rem] font-medium">
          Frequently Asked Questions
        </h2>
        <div className="w-[75%] flex flex-col gap-6">
          {QuestionsContent.map((question, index) => {
            return (
              <motion.div
                key={index}
                whileHover="hover"
                style={{ willChange: "transform" }}
                initial="rest"
                animate="rest"
                variants={{
                  rest: {},
                  hover: {},
                }}
                className="relative overflow-hidden flex flex-col gap-2 w-full px-4 py-4 border-b border-[#A5A5A5]"
              >
                <div className="flex flex-row justify-between">
                  <h3 className="text-base text-white font-medium">
                    {question.question}
                  </h3>
                  <AddIcon />
                </div>

                <motion.p
                  style={{ willChange: "transform" }}
                  variants={{
                    rest: { opacity: 0, y: -10, height: 0 },
                    hover: { opacity: 1, y: 0, height: "auto" },
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-xs font-normal text-[#A5A5A5] overflow-hidden"
                >
                  {question.description}
                </motion.p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Questions;
