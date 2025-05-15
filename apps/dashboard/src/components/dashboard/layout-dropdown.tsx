import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Delete, Edit, TabLayout, ToolbarLayout } from "../icons/icons";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { useAtomValue, useSetAtom } from "jotai";
import {
  deleteLayoutAtom,
  editLayoutNameAtom,
  layoutAtom,
  LayoutType,
  syncLayoutOnSelectAtom,
} from "@/lib/atoms/layoutAtom";
import { RenderIf } from "../shared";
import { Fragment, RefObject, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useState } from "react";
import { ConfirmationModal, NameLayout } from "../modals";

export function LayoutDropdown() {
  const deleteLayout = useSetAtom(deleteLayoutAtom);
  const layouts = useAtomValue(layoutAtom);
  const editLayoutName = useSetAtom(editLayoutNameAtom);
  const syncLayouts = useSetAtom(syncLayoutOnSelectAtom);

  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [layoutName, setLayoutName] = useState("");

  const layoutRef = useRef("");

  const savedLayouts = layouts.filter((item) => !item.draft);
  const unSavedLayouts = layouts.filter((item) => item.draft);

  return (
    <Fragment>
      <TooltipProvider>
        <DropdownMenu
          onOpenChange={(e) => {
            setIsOpen(e);
          }}
        >
          <Tooltip>
            <TooltipTrigger>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-center rounded-sm group">
                  <ToolbarLayout active={isOpen} />
                </div>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#101010]">
              <p className="text-[#afafaf] text-xs font-semibold leading-[1.25]">
                Layouts
              </p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            className="w-[16rem] mt-2 bg-[#090909] border border-[#333] p-0"
            align="end"
          >
            <DropdownMenuLabel className="text-[#646464] font-medium text-[10px] p-2 border-b border-[#333]">
              LAYOUTS
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <RenderIf condition={!!layouts && layouts?.length === 0}>
                <div className="max-w-[149px] mx-auto py-[50px]">
                  <p className="text-[#848484] text-center text-xs font-medium">
                    You currently have no saved layout
                  </p>
                </div>
              </RenderIf>

              <RenderIf condition={!!layouts && layouts?.length > 0}>
                {savedLayouts?.map((layout, i) => (
                  <DropdownMenuItem
                    key={i}
                    className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
                    onClick={() => {
                      syncLayouts(layout);
                    }}
                  >
                    <TabLayout />
                    <p className="flex-1 truncate">
                      {layout.draft ? "Untitled Layout" : layout?.name}
                    </p>

                    <div className="flex items-center gap-1">
                      <RenderIf condition={!layout.draft}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            layoutRef.current = layout.id;
                            setLayoutName(layout.name);
                            setShowNameModal(true);
                          }}
                        >
                          <Edit />
                        </button>
                      </RenderIf>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          layoutRef.current = layout.id;
                          setShowDeleteModal(true);
                        }}
                      >
                        <Delete fill="#5B5B5B" />
                      </button>
                    </div>
                  </DropdownMenuItem>
                ))}

                <RenderIf condition={unSavedLayouts?.length > 0}>
                  <div className="bg-[#0F0F0F] px-2 py-2">
                    <p className="font-medium text-[#474747] leading-[1.25] text-[10px]">
                      UNSAVED LAYOUTS
                    </p>
                  </div>
                </RenderIf>

                {unSavedLayouts?.map((layout, i) => (
                  <DropdownMenuItem
                    key={i}
                    className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
                    onClick={() => {
                      syncLayouts(layout);
                    }}
                  >
                    <TabLayout />
                    <p className="flex-1 truncate">
                      {layout.draft ? "Untitled Layout" : layout?.name}
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          layoutRef.current = layout.id;
                          setShowDeleteModal(true);
                        }}
                      >
                        <Delete fill="#5B5B5B" />
                      </button>
                    </div>
                  </DropdownMenuItem>
                ))}
              </RenderIf>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      <ConfirmationModal
        open={showDeleteModal}
        handleCloseModal={() => {
          setShowDeleteModal(false);
        }}
        cancelBtnText="Cancel"
        confirmBtnText="Delete"
        title="Are you sure you want to delete this layout?"
        details="You are about to delete this layout and this action cannot be undone"
        handleConfirm={() => {
          deleteLayout({ layoutId: layoutRef.current });
          setShowDeleteModal(false);
        }}
      />

      <NameLayout
        open={showNameModal}
        handleCloseModal={() => {
          setShowNameModal(false);
        }}
        value={layoutName}
        onChange={(name) => {
          setLayoutName(name);
        }}
        handleSave={() => {
          // console.log({ layoutId: layoutRef.current, newName: layoutName });
          editLayoutName({ layoutId: layoutRef.current, newName: layoutName });
          setShowNameModal(false);
        }}
        title="Rename Layout"
        details="Rename your layout"
      />
    </Fragment>
  );
}

interface ILayoutItem {
  layout: LayoutType;
  layoutRef: RefObject<string>;
  setLayoutName: (name: string) => void;
  setShowNameModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
}

// const LayoutItem = (props: ILayoutItem) => {
//   const {
//     layout,
//     layoutRef,
//     setLayoutName,
//     setShowNameModal,
//     setShowDeleteModal,
//   } = props;
//   const syncLayouts = useSetAtom(syncLayoutOnSelectAtom);

//   return (
//     <DropdownMenuItem
//       className="text-[#C3C3C3] my-2 text-[13px] font-inter font-medium flex items-center focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full justify-between"
//       onClick={() => {
//         syncLayouts(layout);
//       }}
//     >
//       <TabLayout />
//       <p className="flex-1 truncate">
//         {layout.draft ? "Untitled Layout" : layout?.name}
//       </p>

//       <div className="flex items-center gap-1">
//         <RenderIf condition={!layout.draft}>
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               layoutRef.current = layout.id;
//               setLayoutName(layout.name);
//               setShowNameModal(true);
//             }}
//           >
//             <Edit />
//           </button>
//         </RenderIf>
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             layoutRef.current = layout.id;
//             setShowDeleteModal(true);
//           }}
//         >
//           <Delete fill="#5B5B5B" />
//         </button>
//       </div>
//     </DropdownMenuItem>
//   );
// };
