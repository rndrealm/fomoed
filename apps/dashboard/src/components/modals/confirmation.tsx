import React from "react";
import { ModalContainer } from "../shared";

interface IProps {
  handleCloseModal: () => void;
  open: boolean;
  title?: string;
  details?: string;
  handleCancel?: () => void;
  handleConfirm?: () => void;
  cancelBtnText?: string;
  confirmBtnText?: string;
}

export function ConfirmationModal(props: IProps) {
  const {
    handleCloseModal,
    open,
    details,
    handleCancel,
    handleConfirm,
    title,
    cancelBtnText,
    confirmBtnText,
  } = props;
  return (
    <ModalContainer
      handleClose={handleCloseModal}
      open={open}
      noHeader
      className="!max-w-[460px] w-full p-0"
    >
      <div className="bg-[#090909] border border-[#333] rounded-[10px] p-6 min-h-[190px] flex flex-col">
        <div className="flex flex-col gap-5 justify-between h-full flex-1">
          <div className="flex flex-col gap-[10px]">
            <h4 className="text-white font-medium leading-[24px] text-base">
              {title}
            </h4>
            <p className="text-[#878787] font-medium leading-[1.25] text-sm">
              {details}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="text-[#C3C3C3] font-medium leading-[1.25] text-[13px] bg-[#0E0E0E] border border-[#121212] rounded-sm p-2"
              onClick={handleCloseModal}
            >
              {cancelBtnText}
            </button>

            <button
              className="text-[#090909] font-medium leading-[1.25] text-[13px] bg-white border border-[#121212] rounded-sm p-2"
              onClick={handleConfirm}
            >
              {confirmBtnText}
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
