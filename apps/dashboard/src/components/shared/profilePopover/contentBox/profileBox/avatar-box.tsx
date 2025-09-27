import CloseIcon from "@/components/icons/CloseIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import { ModalContainer } from "@/components/shared/modal-container";
import { ProfileIcon } from "@/components/shared/profile-icon";
import RemoteImage from "@/components/widgets/shared/remote-image";
import useUserData from "@/lib/hooks/use-user-data";
import { useUpdateAvatar } from "@/services/queries/tabs";
import Image from "next/image";
import { useRef, useState } from "react";

const avatarData = [
  {
    id: 1,
    name: "Avatar 1",
    image: "/media/images/auth/avatar1.png",
  },
  {
    id: 2,
    name: "Avatar 2",
    image: "/media/images/auth/avatar2.png",
  },
  {
    id: 3,
    name: "Avatar 3",
    image: "/media/images/auth/avatar3.png",
  },
];

interface AvatarFileBoxProps {
  avatarFileBox: boolean;
  setAvatarFileBox: (value: boolean) => void;
}

const AvatarFileBox: React.FC<AvatarFileBoxProps> = ({ avatarFileBox, setAvatarFileBox }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: authUser, isLoading, error } = useUserData();
  const { updateAvatar, isPending, isError } = useUpdateAvatar();

  const [displayAvatar, setDisplayAvatar] = useState<string | null | undefined>(authUser?.avatar_url);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png"; // default fallback
    const bstr = atob(arr[1]); // decode base64
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // console.log(reader.result);

      const res = reader.result as string;
      setDisplayAvatar(res);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFile(event.target.files[0]);
    }
  };

  const handleSend = async (file: File) => {
    if (displayAvatar) {
      try {
        console.log(displayAvatar);

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

          // console.log(data.data.url);
          const imageUrl = data.data.url;

          // Update avatar in ui
          updateAvatar({ avatar_url: imageUrl });
        } else {
          console.error("Error uploading image:", data.message);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        // setAvatarFileBox(false);
      }
    }
  };

  const handleDefaultAvatar = () => {
    try {
      const defaultAvatarUrl = authUser?.avatar_url;

      if (!defaultAvatarUrl) {
        return;
      }
      const file = new File([defaultAvatarUrl], "profile.png", { type: "image/png" });

      // Prepare form data
      const formData = new FormData();
      formData.append("image", file);

      setDisplayAvatar(defaultAvatarUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <ModalContainer
      open={avatarFileBox}
      handleClose={() => setAvatarFileBox(false)}
      className="h-full w-full !max-w-[90%] md:!max-w-[600px] !max-h-[640px] flex flex-col items-center justify-center rounded-[12px] bg-transparent overflow-hidden p-0 outline-none focus:outline-none"
      title="Avatar Upload"
      noHeader
      bgBlur={false}
    >
      <div className="p-0 rounded-[12px] bg-[#0C0C0C] border-[1px] border-[#242424] relative h-full w-full flex flex-col justify-start items-center gap-8 outlnine-none focus:outline-none">
        {/* top bar */}
        <div className="relative px-4 py-5 w-full flex justify-between items-center border-b-[1px] border-[#2A2A2A]">
          {/* close button */}
          <p className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-[18px] font-medium text-white">
            Update Avatar
          </p>
          <div className="flex h-0 w-0"></div>
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="bg-[#1A1A1A] px-2 py-0.5 border-[1px] border-[#242424] flex items-center justify-center rounded-[4px]">
              <p className="text-[14px] leading-[18px] font-normal text-white">esc</p>
            </div>
            <button
              type="button"
              onClick={() => setAvatarFileBox(false)}
              className="h-5 aspect-square flex items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="max-w-[400px] w-full mx-auto flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-[108px] max-h-[108px] aspect-square rounded-[12px] overflow-hidden">
              {/* <RemoteImage src={authUser?.avatar_url} alt="User avatar" className="w-full h-full object-cover" fill /> */}
              <RemoteImage
                src={displayAvatar}
                alt="User avatar"
                className="w-full h-full object-cover"
                fill
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={handleDefaultAvatar}
              className="bg-[#1A1A1A] text-[#a6aeb2] text-[14px] font-medium px-3.5 py-1.5 rounded-[8px] flex items-center justify-center"
            >
              Delete
            </button>
          </div>

          <div className="w-full flex flex-col gap-4">
            <p className="text-[14px] font-medium text-white">Avatars</p>

            {/* box for image upload */}

            <div className="flex flex-row items-center gap-3">
              {avatarData.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => {
                    setDisplayAvatar(avatar.image);
                  }}
                  className={`relative h-16 w-16 bg-[#1A1A1A] rounded-[8px] flex flex-col items-center justify-center cursor-pointer transition-colors
              `}
                >
                  <Image src={avatar.image} alt={avatar.name} fill className="rounded-[8px]" />
                </div>
              ))}
              {/* others */}
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className={`relative h-16 w-16 bg-[#1A1A1A] rounded-[8px] flex flex-col items-center justify-center transition-colors
              `}
                ></div>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <p className="text-[14px] font-medium text-white">Upload Image</p>

            {/* box for image upload */}

            <div className="flex flex-row items-center gap-3">
              {/* <div
                onClick={() => setDisplayAvatar(authUser?.avatar_url)}
                className={`relative h-16 w-16 bg-[#1A1A1A] rounded-[8px] flex flex-col items-center justify-center cursor-pointer transition-colors
              `}
              >
                <ProfileIcon user={authUser} className="rounded-[8px]" />
              </div> */}

              {/* upload box */}
              <div
                onClick={handleClick}
                className={`relative h-16 w-16 bg-[#1A1A1A] rounded-[8px] flex flex-col items-center justify-center cursor-pointer transition-colors
              `}
              >
                <PlusIcon fill="#fff" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex flex-row gap-2 items-center">
            <button
              onClick={async () => {
                if (!authUser?.avatar_url) return;

                setDisplayAvatar(authUser.avatar_url);
              }}
              disabled={isPending}
              className="bg-[#1A1A1A] rounded-[8px] px-4 py-2 text-[14px] text-[#a6aeb2] font-medium"
            >
              Discard
            </button>
            <button
              onClick={async () => {
                if (!displayAvatar) return;

                let file = null;

                if (typeof displayAvatar === "string" && displayAvatar.startsWith("http")) {
                  file = dataURLtoFile(displayAvatar, "avatar.png");
                } else {
                  const response = await fetch(displayAvatar);
                  const blob = await response.blob();

                  file = new File([blob], "profile.png", { type: blob.type });
                }

                handleSend(file);
              }}
              disabled={isPending || displayAvatar === null || displayAvatar === undefined}
              className="bg-[#fff] rounded-[8px] px-4 py-2 text-[14px] text-[#141414] font-medium"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default AvatarFileBox;
