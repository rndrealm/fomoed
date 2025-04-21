import React, { Fragment, useState } from "react";
import { NavActionButton } from "./nav-action-button";
import AddIcon from "../icons/AddIcon";
import { ModalContainer } from "../shared";
import { AddWidgetModal } from "./add-widget-modal";

export function NewWidgetBtn() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Fragment>
      <button
        type="button"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <NavActionButton
          label="New Widget"
          leftIcon={<AddIcon stroke="#717A7A" />}
        />
      </button>

      <ModalContainer
        open={isModalOpen}
        handleClose={() => {
          setIsModalOpen(false);
        }}
        className="h-full"
        title="Add New Widget"
      >
        <AddWidgetModal />
      </ModalContainer>
    </Fragment>
  );
}
