'use client'

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { LayoutType } from "@/lib/atoms/layoutAtom"
import { WidgetWrapper } from "../shared"
import { Close, FomoedGreyIcon, Question } from "@/components/icons/icons"
import { modalSlide } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import dashboard from "@/lib/assets/dashboard"
import { Loader2 } from "lucide-react"

interface IProps {
  widget: LayoutType["widgets"][0]
}

export default function TelegramWidget(props: IProps) {
  const { widget } = props
  const [showLanding, setShowLanding] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = () => {
    setShowLanding(false)
    setIsLoading(true)
  }

  const handleIframeLoad = () => {
    // Hide the loading spinner since iframe has loaded
    setIsLoading(false)
  }


  return (
    <WidgetWrapper
      title="Telegram"
      widget={widget}
      className="relative justify-between gap-3 px-0 sm:px-0 sm:pb-0"
      headerClassName="px-4"
      handleLearnMore={() => setShowInfo(true)}
    >
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden">
        {showLanding ? (
          // Landing Page
          <div className="w-full h-full flex flex-col items-center justify-between px-6 pt-6 pb-4">
            <h3 className="text-white text-sm font-semibold">
              Login To Telegram
            </h3>
            {/* Login Section */}
            <div className="flex flex-col items-center gap-4 w-full">
              {/* User Icon */}
              <Image src={dashboard.telegramUserIcon} alt="telegram user icon" height={32} width={32} />
              {/* Connect Button */}
              <Button
                type="button"
                variant={"secondary"}
                onClick={handleConnect}
                className="bg-white text-black font-medium text-sm px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                Connect Your Account
              </Button>
            </div>

            {/* How it Works Link */}
            <Button
              type="button"
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-1 bg-[#101010] text-xs rounded-3xl"
            >
              <Question color="#FFFFFF" />
              <span className="text-[#A6AEB2]">How it Works</span>
            </Button>
          </div>
        ) : (
          // Telegram iframe with loading states
          <div className="relative w-full h-full">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#878787] mb-2" />
                {/* <p className="text-[#878787] text-sm">Loading Telegram...</p> */}
              </div>
            )}


            {/* Telegram iframe */}
            <iframe
              src="https://telegram.fomoed.app/"
              className="w-full h-full border-0"
              allow="microphone; camera; geolocation; autoplay"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
              title="Telegram Messenger"
              onLoad={handleIframeLoad}
            />
          </div>
        )}
      </div>

      {/* How it Works Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="absolute bottom-[10px] left-[10px] right-[10px] top-[10px] z-[19] flex items-end">
            <motion.div
              className="bg-[#111] rounded-[22px] py-4 px-5 overflow-auto max-h-full scrollbar flex-1"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 justify-between h-full">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      Telegram Widget
                    </h3>
                    <p className="text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the Telegram Widget
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    The Telegram widget lets you access your chats, channels, and groups directly from your trading dashboard. Stay connected with friends, discuss market moves, and follow community updates in real time all without switching tabs.
                  </p>
                  <div className="flex flex-col gap-2">
                    <FomoedGreyIcon />
                    <p className="list-disc list-inside text-xs text-[#696969] space-y-1">
                      We integrate Telegram’s official web interface for secure and seamless access.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    className="rounded-[40px] bg-[#272727] flex items-center justify-center gap-1 h-[26px] app_widget_button"
                    onClick={() => setShowInfo(false)}
                  >
                    <p className="font-medium text-[13px] text-white whitespace-nowrap app_widget_button__text">
                      Close
                    </p>
                    <div className="app_widget_button__icon">
                      <Close fill="#878787" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  )
}
