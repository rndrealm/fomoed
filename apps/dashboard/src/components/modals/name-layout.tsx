import React from "react";
import { ModalContainer } from "../shared";
import { Input } from "../ui/input";

interface IProps {
  handleCloseModal: () => void;
  open: boolean;
  value: string;
  onChange: (name: string) => void;
  handleSave: () => void;
  title?: string;
  details?: string;
  placeholder?: string;
}

export function NameLayout(props: IProps) {
  const {
    handleCloseModal,
    open,
    onChange,
    value,
    handleSave,
    details,
    title,
    placeholder,
  } = props;
  return (
    <ModalContainer
      handleClose={handleCloseModal}
      open={open}
      noHeader
      className="!max-w-[460px] w-full p-0"
    >
      <div
        className="bg-[#090909] border border-[#333] rounded-[10px] p-6 min-h-[210px] flex flex-col"
        id="fourth-step"
      >
        <div className="flex flex-col justify-between flex-1 h-full gap-5">
          <div className="flex flex-col gap-[10px]">
            <h4 className="text-white font-medium leading-[24px] text-base">
              {title}
            </h4>
            <div className="flex flex-col gap-2">
              <p className="text-[#878787] font-medium leading-[1.25] text-sm">
                {details}
              </p>

              <div className="relative flex-1">
                <Input
                  placeholder={placeholder}
                  className="h-[38px] py-[1px] rounded-[4px] border border-white/10 text-sm placeholder:text-white/40 bg-[#131313] text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full border-none focus-visible:ring-0"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="flex flex-row-reverse justify-end gap-2">
              <button
                className="text-[#090909] font-medium leading-[1.25] text-[13px] bg-white border border-[#121212] rounded-sm p-2"
                onClick={handleSave}
              >
                Save
              </button>

              <button
                className="text-[#C3C3C3] font-medium leading-[1.25] text-[13px] bg-[#0E0E0E] border border-[#121212] rounded-sm p-2"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
