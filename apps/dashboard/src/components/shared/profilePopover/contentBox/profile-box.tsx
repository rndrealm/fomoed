import React, { useEffect, useRef, useState } from "react";
import { ProfileIcon } from "../../profile-icon";
import PlusIcon from "@/components/icons/PlusIcon";
import { Question } from "@/components/icons/icons";
import useUserData from "@/lib/hooks/use-user-data";
import { useUpdateAvatar, useUpdateUsername } from "@/services/queries/tabs";
import { useRouter } from "next/navigation";
import { profilePopoverAtom } from "@/lib/atoms/profilePopover";
import { useAtomValue, useSetAtom } from "jotai";
import { ModalContainer } from "../..";
import Image from "next/image";
import CloseIcon from "@/components/icons/CloseIcon";

const ProfileBox = () => {
  const { data: authUser, isLoading, error } = useUserData();
  const [username, setUsername] = useState("");
  const { updateUsername, isPending, isError } = useUpdateUsername();

  const [avatarFileBox, setAvatarFileBox] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUsername({ username });
    setUsername("");
  };

  const profilePopover = useAtomValue(profilePopoverAtom);
  const setProfilePopoverAtom = useSetAtom(profilePopoverAtom);

  const router = useRouter();

  const { updateAvatar, isPending: isAvatarPending, isError: isAvatarError } = useUpdateAvatar();

  const upgradePricing = () => {
    router.push("/pricing");
  };

  const handleDefaultAvatar = () => {
    try {
      const defaultAvatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${authUser?.username}&backgroundColor=000000,FFFFFF`;

      const file = new File([defaultAvatarUrl], "profile.png", { type: "image/png" });

      // Prepare form data
      const formData = new FormData();
      formData.append("image", file);

      updateAvatar({ avatar_url: defaultAvatarUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setAvatarFileBox(false);
    }
  };

  return (
    <div className="scrollbar flex-1 w-full flex flex-col gap-8 bg-[#131313] px-6 md:px-10 pb-6 pt-13 overflow-y-auto">
      <div className="h-full flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="relative w-[108px] max-h-[108px] aspect-square rounded-[12px] overflow-hidden">
            <ProfileIcon user={authUser} className="rounded-[8px]" />
          </div>
          <div className="absolute z-10 overflow-hidden -bottom-2 -right-2 bg-[#131313] rounded-[11px] h-[35px] aspect-square flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setAvatarFileBox(true);
              }}
              className="bg-[#00af58] rounded-[8px] h-[30px] aspect-square flex items-center justify-center"
            >
              <span className="scale-125 origin-center transition-transform hover:scale-110">
                <PlusIcon fill="#fff" />
              </span>
            </button>
          </div>
        </div>
        <p className="text-[18px] text-white font-medium">{authUser?.username}</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-[360px] mx-auto space-y-4">
        <div className="flex flex-col items-start justify-between gap-2">
          <label className="block text-xs text-white font-normal">Account Name</label>
          <input
            type="text"
            placeholder="User1234"
            className="w-full mt-1 px-3 py-2 bg-[#1A1A1A] border-[1px] border-[#2A2A2A] rounded-[8px] focus:outline-none placeholder:text-[14px] text-[14px] text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={isPending || username.length < 1}
            className="w-[100%] mx-auto mt-1 px-3 py-2 bg-[#00AF58] disabled:opacity-50 rounded-[8px] text-[14px] text-black font-semibold"
          >
            {isPending ? "Updating..." : isError ? "Try Again" : "Update Name"}
          </button>
        </div>

        <div className="w-full h-[1px] bg-[#242424]"></div>

        {/* email stuff */}
        {/* <div className="relative flex flex-col items-start justify-between gap-2">
          <label className="block text-xs text-white font-normal">Attached Email</label>
          <input
            type="email"
            placeholder="Jason@ids.company"
            className="w-full mt-1 px-3 py-2 bg-[#1A1A1A] border-[1px] border-[#2A2A2A] rounded-[8px] focus:outline-none placeholder:text-[14px] text-[14px] text-white"
          />
          <div className="absolute right-[-36px] bottom-[10px]">
            <Question />
          </div>
        </div> */}

        {/* <div className="w-full h-[1px] bg-[#242424]"></div> */}

        <div className="flex flex-col items-start justify-between gap-2">
          <p className="block text-xs text-white font-normal">Avatar</p>
          <div className="w-full flex flex-col md:flex-row gap-1 items-center justify-between">
            <button
              onClick={() => {
                setAvatarFileBox(true);
              }}
              className="bg-white rounded-[8px] flex-1 px-8 md:px-0 py-2 text-[14px] text-black font-semibold"
            >
              Change Avatar
            </button>
            <button
              onClick={() => {
                handleDefaultAvatar();
              }}
              disabled={isAvatarPending}
              className="bg-[#1A1A1A] rounded-[8px] flex-1 px-5 md:px-0 py-2 text-[14px] text-[#a6aeb2] font-medium"
            >
              Use default avatar
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Upload Box */}
      <AvatarFileBox avatarFileBox={avatarFileBox} setAvatarFileBox={setAvatarFileBox} />

      {/* Upgrade Banner */}
      <div className="mt-0 lg:mt-3 max-w-[450px] px-4 lg:px-3 py-4 lg:py-3 w-fit lg:w-full mx-auto flex flex-col gap-5 lg:flex-row justify-between items-center border border-neutral-700 rounded-[12px]">
        <p className="text-[14px] ml-1 text-white font-normal">Get more for your money</p>
        <button
          type="button"
          onClick={() => {
            upgradePricing();
            setProfilePopoverAtom({ open: false, activeTab: profilePopover.activeTab });
          }}
          className="px-4 py-2 text-nowrap bg-[#db8844] rounded-[8px] text-[14px] text-black leading-[18px] font-medium"
        >
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};

export default ProfileBox;

interface AvatarFileBoxProps {
  avatarFileBox: boolean;
  setAvatarFileBox: (value: boolean) => void;
}

const AvatarFileBox: React.FC<AvatarFileBoxProps> = ({ avatarFileBox, setAvatarFileBox }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { updateAvatar, isPending, isError } = useUpdateAvatar();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFile(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const handleSend = async () => {
    if (preview) {
      try {
        // Convert preview (src) to a Blob
        const response = await fetch(preview);
        const blob = await response.blob();

        // Create a File from the Blob
        const file = new File([blob], "profile.png", { type: blob.type });

        // Prepare form data
        const formData = new FormData();
        formData.append("image", file);

        // Send to API
        const res = await fetch(
          "https://fomoed-data-ingestion-509111531565.us-central1.run.app/api/v1/profile/image-update",
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await res.json();

        if (data.success) {
          // Successfully uploaded

          // console.log(data.data);
          updateAvatar({ avatar_url: data.data.url });
        } else {
          console.error("Error uploading image:", data.message);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setAvatarFileBox(false);
        setPreview(null);
      }
    }
  };

  return (
    <ModalContainer
      open={avatarFileBox}
      handleClose={() => setAvatarFileBox(false)}
      className="h-full w-full !max-w-[90%] md:!max-w-[600px] !max-h-[500px] flex flex-col items-center justify-center rounded-[12px] bg-transparent overflow-hidden p-0 outline-none focus:outline-none"
      title="Avatar Upload"
      noHeader
      bgBlur={false}
    >
      <div className="p-6 rounded-[12px] bg-[#131313] border-[1px] border-[#242424] relative h-full w-full flex flex-col justify-start items-center gap-8 outlnine-none focus:outline-none">
        {/* preview of the images */}
        {preview ? (
          <div className="w-full h-fit min-h-[100px] max-w-[400px] flex items-center justify-start">
            <div className="relative w-full h-full max-h-[100px] max-w-[100px] flex items-center justify-center">
              <Image src={preview} alt="preview" fill className="object-cover" />
            </div>
          </div>
        ) : (
          <div className="w-full h-fit min-h-[100px] max-w-[400px] flex items-center justify-start">
            <p className="text-[#444444] text-center">Image preview will appear here</p>
          </div>
        )}

        {/* box for image upload */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-0 drop-zone max-w-[400px] w-full h-[200px] border-[2px] border-dashed rounded-[12px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragOver ? "border-[#272727] bg-grey-300" : "border-[#272727] bg-transparent"
          }`}
        >
          {!preview ? (
            <p className="text-[#666666] text-center">
              Drag & Drop an image here
              <br />
              or click to select
            </p>
          ) : (
            <p className="text-[#666666] text-center">Upload a diffrent image</p>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isPending || !preview}
          className="bg-[#2A2A2A] rounded-[8px] px-4 py-2 text-base text-white font-medium"
        >
          Change Avatar
        </button>

        {/* close button */}

        <button
          type="button"
          onClick={() => setAvatarFileBox(false)}
          className="absolute top-6 right-6 h-5 aspect-square flex items-center justify-center"
        >
          <CloseIcon color="#999999" />
        </button>
      </div>
    </ModalContainer>
  );
};
