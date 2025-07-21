import { Link, Linkedin, Meta, Share, Twitter } from "@/components/icons/icons";
import { toast } from "@/components/shared/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateSocialLinks } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface IProps {
  newsId?: string;
}

export function ShareButton(props: IProps) {
  const { newsId } = props;
  const [url, setUrl] = useState("");
  const { facebook, linkedin, x } = generateSocialLinks(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        description: "Link Copied",
        title: "Test",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  useEffect(() => {
    const baseUrl = window.location.origin;
    setUrl(`${baseUrl}/news/${newsId}`);
  }, [newsId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-1 px-[10px] py-[6px] text-xs leading-[16px] text-white">
          <Share />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-[10px] border border-[#353535] bg-[#1A1A1A] p-0" align="center">
        <DropdownMenuLabel className="flex items-center gap-2 p-4 text-[13px] leading-[18px] font-semibold tracking-[-0.4%] text-white">
          Share Article
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="group flex cursor-pointer items-center gap-2 border-t border-b border-[#212121] p-4 text-[13px] leading-[18px] font-semibold tracking-[-0.4%] text-[#A4A4A4] focus:bg-[#171717] focus:text-white"
          onSelect={handleCopy}
        >
          <div className="flex h-[20px] w-[20px] items-center justify-center">
            <Link fill="#a4a4a4" className="group-hover:fill-white" />
          </div>
          Copy Link
        </DropdownMenuItem>
        <a href={x} target="_blank">
          <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 border-t border-b border-[#212121] p-4 text-[13px] leading-[18px] font-semibold tracking-[-0.4%] text-[#A4A4A4] focus:bg-[#171717] focus:text-white">
            <div className="flex h-[20px] w-[20px] items-center justify-center">
              <Twitter fill="#a4a4a4" className="group-hover:fill-white" />
            </div>
            Share Article on X
          </DropdownMenuItem>
        </a>

        <a href={facebook} target="_blank">
          <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 border-t border-b border-[#212121] p-4 text-[13px] leading-[18px] font-semibold tracking-[-0.4%] text-[#A4A4A4] focus:bg-[#171717] focus:text-white">
            <div className="flex h-[20px] w-[20px] items-center justify-center">
              <Meta className="group-hover:fill-white" />
            </div>
            Share Article on Facebook
          </DropdownMenuItem>
        </a>

        <a href={linkedin} target="_blank">
          <DropdownMenuItem className="group flex cursor-pointer items-center gap-2 border-t border-[#212121] p-4 text-[13px] leading-[18px] font-semibold tracking-[-0.4%] text-[#A4A4A4] focus:bg-[#171717] focus:text-white">
            <div className="flex h-[20px] w-[20px] items-center justify-center">
              <Linkedin className="group-hover:fill-white" />
            </div>
            Share Article on Linkedin
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
