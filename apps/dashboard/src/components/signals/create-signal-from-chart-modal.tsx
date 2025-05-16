import { conditionToJsonLogic } from "@/lib/utils/signal.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Condition } from "./condition-group";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";
import SignalDetails from "./signal-details";

// type Props = {
//   //   initialCondition: Condition[];
// };

const CreateSignalFromDataPointModal = () => {
  const intialCondition: Condition[] = [
    {
      id: "1",
      type: "condition",
      dataSource: "price",
      topic: "price_BTCUSD",
      operator: "==",
      value: 12333,
    },
  ];

  const logic = conditionToJsonLogic(intialCondition[0]);

  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
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

export default CreateSignalFromDataPointModal;
