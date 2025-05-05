import React, { Fragment } from "react";
import AddIcon from "../../icons/AddIcon";

interface IProps {
  handleAddTab: () => void;
}

export function AddTab(props: IProps) {
  const { handleAddTab } = props;

  return (
    <Fragment>
      <button type="button" onClick={handleAddTab}>
        <div className="">
          <AddIcon />
        </div>
      </button>
    </Fragment>
  );
}
