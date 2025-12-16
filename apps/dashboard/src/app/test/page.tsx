"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2, Bell } from "lucide-react";

const YourApp = () => {
  return (
    <div className="min-h-screen bg-[#0C0C0C] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Sonner Toast Demo</h1>
          <p className="text-gray-400">Customized toast notifications with various styles and options</p>
        </div>

        <ConnectButton />

        {/* Basic Toasts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-800 pb-2">Basic Toasts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() =>
                toast("Default Toast", {
                  description: "This is a default notification",
                })
              }
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Default
            </button>
            <button
              onClick={() =>
                toast.success("Success!", {
                  // description: "Operation completed successfully",
                })
              }
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Success
            </button>
            <button
              onClick={() =>
                toast.error("Error!", {
                  description: "Something went wrong",
                })
              }
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Error
            </button>
            <button
              onClick={() =>
                toast.info("Info", {
                  description: "Here's some information",
                })
              }
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Info
            </button>
          </div>
        </section>

        {/* Advanced Toasts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-800 pb-2">Advanced Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                toast.warning("Warning!", {
                  description: "Please be careful with this action",
                  duration: 6000,
                })
              }
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Warning (6s)
            </button>
            <button
              onClick={() =>
                toast("Custom Duration", {
                  description: "This toast lasts 10 seconds",
                  duration: 10000,
                })
              }
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Long Duration
            </button>
            <button
              onClick={() =>
                toast("Infinite Toast", {
                  description: "This will stay until dismissed",
                  duration: Infinity,
                })
              }
              className="px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              Infinite
            </button>
          </div>
        </section>

        {/* Custom Icons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-800 pb-2">Custom Icons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                toast("Custom Icon", {
                  description: "With a bell icon",
                  icon: <Bell className="w-5 h-5" />,
                })
              }
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Bell Icon
            </button>
            <button
              onClick={() =>
                toast.success("Completed", {
                  description: "Task finished successfully",
                  icon: <CheckCircle2 className="w-5 h-5" />,
                })
              }
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Check Icon
            </button>
            <button
              onClick={() =>
                toast.loading("Processing...", {
                  description: "Please wait while we process your request",
                })
              }
              className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Loading
            </button>
          </div>
        </section>

        {/* Action Toasts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-800 pb-2">Interactive Toasts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                toast("Action Required", {
                  description: "Do you want to proceed?",
                  action: {
                    label: "Undo",
                    onClick: () => toast.success("Action undone!"),
                  },
                })
              }
              className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              With Action
            </button>
            <button
              onClick={() =>
                toast("Cancelable", {
                  description: "Click the X to dismiss",
                  cancel: {
                    label: "Cancel",
                    onClick: () => toast.info("Canceled!"),
                  },
                })
              }
              className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              With Cancel
            </button>
            <button
              onClick={() => {
                const promise = new Promise((resolve) => setTimeout(resolve, 3000));
                toast.promise(promise, {
                  loading: "Loading...",
                  success: "Data loaded successfully!",
                  error: "Failed to load data",
                });
              }}
              className="px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Promise Toast
            </button>
          </div>
        </section>

        {/* Positioning (requires individual calls) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-800 pb-2">Positions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                toast("Top Left", {
                  position: "top-left",
                })
              }
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Top Left
            </button>
            <button
              onClick={() =>
                toast("Top Right", {
                  position: "top-right",
                })
              }
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Top Right
            </button>
            <button
              onClick={() =>
                toast("Bottom Left", {
                  position: "bottom-left",
                })
              }
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Bottom Left
            </button>
            <button
              onClick={() =>
                toast("Bottom Right", {
                  position: "bottom-right",
                })
              }
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Bottom Right
            </button>
            <button
              onClick={() =>
                toast("Bottom Center", {
                  position: "bottom-center",
                })
              }
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Bottom Center
            </button>
            <button
              onClick={() =>
                toast("Top Center (Default)", {
                  position: "top-center",
                })
              }
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Top Center
            </button>
          </div>
        </section>

        {/* Rich Content */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-800 pb-2">Rich Content</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                toast.success("Trade Executed", {
                  description: "0.5 ETH swapped to 1,234 USDC",
                  duration: 5000,
                })
              }
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Trade Notification
            </button>
            <button
              onClick={() =>
                toast.error("Transaction Failed", {
                  description: "Insufficient gas fee. Please try again.",
                  action: {
                    label: "Retry",
                    onClick: () => toast.info("Retrying..."),
                  },
                })
              }
              className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
            >
              Failed Transaction
            </button>
            <button
              onClick={() =>
                toast.warning("Price Alert", {
                  description: "BTC reached $45,000",
                  icon: <AlertTriangle className="w-5 h-5" />,
                })
              }
              className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Price Alert
            </button>
          </div>
        </section>

        {/* Control Methods */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white border-b border-gray-800 pb-2">Control Methods</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                toast("Multiple Toasts", { description: "Toast 1" });
                toast("Multiple Toasts", { description: "Toast 2" });
                toast("Multiple Toasts", { description: "Toast 3" });
              }}
              className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Show Multiple
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Dismiss All
            </button>
            <button
              onClick={() => {
                const toastId = toast("Specific Toast", {
                  description: "This one has an ID",
                  duration: 10000,
                });
                setTimeout(() => toast.dismiss(toastId), 2000);
              }}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Auto Dismiss
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default YourApp;
