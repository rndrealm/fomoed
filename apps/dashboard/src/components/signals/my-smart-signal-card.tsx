"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";
import { Bell, Mail, MoreVertical, Pencil, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { RenderIf } from "../shared";

import {
  useDeleteSmartSignal,
  useDuplicateSmartSignal,
} from "@/services/queries/signals";
import relativeTime from "dayjs/plugin/relativeTime";
import { redirect } from "next/navigation";
import DeleteConfirmModal from "./delete-confirm-modal";
import { RotateCcw } from "lucide-react";
dayjs.extend(relativeTime);

interface MySignalCardProps {
  id: number;
  title: string;
  description: string;

  conditions: object;
  hasInAppNotifications?: boolean;
  hasEmailNotifications?: boolean;
  lastUpdated: string;
  firedAt?: string | null;
}

const calculateConditionCount = (conditions: object) => {
  let count = 0;
  const traverseConditions = (obj: any): number => {
    if (typeof obj !== "object" || obj === null) {
      return 0;
    }

    let count = 0;

    for (const key in obj) {
      if (["==", "===", "!=", "!==", ">", ">=", "<", "<="].includes(key)) {
        count += 1;
      }

      count += traverseConditions(obj[key]);
    }

    return count;
  };

  count = traverseConditions(conditions);

  return count;
};

export default function MySmartSignalCard({
  id,
  title,
  description,
  conditions,
  hasInAppNotifications = true,
  hasEmailNotifications = true,
  lastUpdated,
  firedAt,
}: MySignalCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { mutateAsync: deleteSmartSignal } = useDeleteSmartSignal();
  const { mutateAsync: duplicateSmartSignal, isPending: isDuplicating } =
    useDuplicateSmartSignal();

  const conditionCount = useMemo(() => {
    return calculateConditionCount(conditions);
  }, [conditions]);

  const onDelete = () => {
    setDeleteConfirmOpen(true);
    setIsMenuOpen(false);
  };

  const onDeleteConfirm = async () => {
    await deleteSmartSignal(id);
    setDeleteConfirmOpen(false);
  };

  const onEdit = () => {
    redirect(`/signals/edit?id=${id}`);
    setIsMenuOpen(false);
  };

  const onDuplicate = async () => {
    await duplicateSmartSignal(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onDelete={onDeleteConfirm}
      />
      <Card className="w-full max-w-3xl p-8 bg-[#080808]">
        <CardHeader className="flex flex-row items-center justify-between p-0">
          <h2 className="text-2xl font-semibold">
            {title ?? "Unnamed Signal"}
          </h2>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-md"
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#080808] text-white"
            >
              {/* Temporarily disabled */}
              {/* <DropdownMenuItem
                className="flex items-center gap-2 py-3 cursor-pointer focus:bg-zinc-800 focus:text-white"
                onClick={onEdit}
              >
                <Pencil className="h-5 w-5 text-gray-400" />
                <span>Edit Signal</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem
                className="flex items-center gap-2 py-3 cursor-pointer focus:bg-zinc-800 focus:text-white"
                onClick={onDuplicate}
                disabled={isDuplicating}
              >
                <RotateCcw
                  className={`h-5 w-5 text-gray-400 ${isDuplicating ? "animate-spin" : ""}`}
                />
                <span>Create again</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 py-3 cursor-pointer focus:bg-zinc-800 focus:text-white"
                onClick={onDelete}
              >
                <Trash className="h-5 w-5 text-gray-400" />
                <span>Delete Signal</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="flex items-center gap-2 py-3 cursor-pointer focus:bg-zinc-800 focus:text-white"
                onClick={onDuplicate}
              >
                <Copy className="h-5 w-5 text-gray-400" />
                <span>Duplicate Signal</span>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mb-6">
            <p className="text-gray-500 uppercase text-sm font-medium mb-2">
              DESCRIPTION
            </p>
            <p className="">{description ?? "No description"}</p>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-500 uppercase text-sm font-medium mb-4">
              SIGNAL DETAILS
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge
                variant={"default"}
                className="bg-white text-black rounded-full py-1.5 px-3"
              >
                {conditionCount} {`Condition${conditionCount > 1 ? "s" : ""}`}
              </Badge>

              <RenderIf condition={hasInAppNotifications}>
                <Badge
                  variant={"default"}
                  className="bg-muted text-foreground rounded-full py-1.5 px-3"
                >
                  <Bell size={12} />
                  In-App Notifications
                </Badge>
              </RenderIf>

              <RenderIf condition={hasEmailNotifications}>
                <Badge
                  variant={"default"}
                  className="bg-muted text-foreground rounded-full py-1.5 px-3"
                >
                  <Mail size={12} />
                  Email Notifications
                </Badge>
              </RenderIf>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-800 p-0 text-sm">
          <div className="flex justify-between w-full">
            <div>
              <span className="text-muted-foreground">
                Last Updated • &nbsp;
              </span>
              <span>{dayjs(lastUpdated).fromNow(true)}</span>
            </div>
            {firedAt && (
              <div>
                <span className="text-muted-foreground">
                  Triggered • &nbsp;
                </span>
                <span>{dayjs(firedAt).fromNow(true)} ago</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
