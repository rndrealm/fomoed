import MySignals from "@/components/signals/my-smart-signals";
import SignalBuilder from "@/components/signals/signal-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SmartSignalsMvp() {
  return (
    <div className="w-full h-full pt-14">
      <div className="w-full max-w-7xl mx-auto">
        <Tabs defaultValue="my-signals">
          <TabsList className="grid w-full max-w-60 grid-cols-2">
            <TabsTrigger value="my-signals">My Signals</TabsTrigger>
            <TabsTrigger value="signal-builder">Signal Builder</TabsTrigger>
          </TabsList>

          <TabsContent className="w-full" value="my-signals">
            <div className="space-y-2 overflow-y-auto">
              {/* <SmartSignalList /> */}
              <MySignals />
            </div>
          </TabsContent>
          <TabsContent value="signal-builder">
            <SignalBuilder
              initialSignal={undefined}
              onSave={(data) => console.log(data)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
