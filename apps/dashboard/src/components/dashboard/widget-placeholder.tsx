import React, { Fragment } from "react";
import AddWidgetIcon from "../icons/AddWidgetIcon";

interface IProps {
  handleShowModal: () => void;
}

export function WidgetPlaceholder(props: IProps) {
  const { handleShowModal } = props;

  return (
    <Fragment>
      <div
        className={
          "p-4 flex flex-col justify-center items-center gap-5 w-full h-full"
        }
      >
        <div className="flex flex-col gap-2 items-center max-w-[256px]">
          <button onClick={handleShowModal}>
            <div className="flex flex-col gap-2 items-center">
              <AddWidgetIcon />
              <h5 className="text-white text-sm text-center">Add Widget</h5>
            </div>
          </button>

          <p className="text-[#b8bcbc] text-sm text-center">
            Add a new widget to your dashboard or select from your saved layouts
          </p>
        </div>

        <div className="flex gap-[10px] items-center">
          {/* <button type="button">
            <p className="w-[150px] h-[32px] text-white flex items-center justify-center rounded-sm text-xs font-medium border border-[#3F4143]">
              View Saved Layouts
            </p>
          </button> */}

          <button type="button" onClick={handleShowModal}>
            <p className="w-[150px] h-[32px] text-white bg-[#3F4143] flex items-center justify-center rounded-sm text-xs font-medium border border-[#3F4143]">
              Add Widget
            </p>
          </button>
        </div>
      </div>
    </Fragment>
  );
}
