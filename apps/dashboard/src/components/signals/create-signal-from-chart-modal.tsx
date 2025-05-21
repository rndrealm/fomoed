import {
  signalModalConfigAtom,
  signalModalDataAtom,
} from "@/lib/atoms/signalModalAtom";
import { conditionToJsonLogic } from "@/lib/utils/signal.utils";
import { useAtom } from "jotai";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Condition } from "./condition-group";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";
import SignalDetails from "./signal-details";

const CreateSignalFromChartModal = () => {
  const [signalModalConfig, setSignalModalConfig] = useAtom(
    signalModalConfigAtom
  );
  const [modelData] = useAtom(signalModalDataAtom);

  const logic = {
    and: [
      ...modelData.conditions.map((condition: Condition) => {
        return conditionToJsonLogic(condition);
      }),
    ],
  };

  return (
    <Dialog
      open={signalModalConfig.isOpen}
      onOpenChange={(state) =>
        setSignalModalConfig({ ...signalModalConfig, isOpen: state })
      }
    >
      <DialogContent className="min-w-5xl bg-[#0e0e0e] text-white dark max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mb-4">
            Create smart signal from data point
          </DialogTitle>

          <ManualSignalBuilder
            initialLogic={logic}
            setLogic={(l) => console.log(l)}
          />

          <NotificationSettings
            notifications={{
              notification: true,
              email: true,
            }}
            onUpdate={() => {}}
          />

          <SignalDetails
            description="This is a test description"
            name="Test Signal"
            onDescriptionChange={() => {}}
            onNameChange={() => {}}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSignalFromChartModal;
