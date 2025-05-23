"use client";

import MySignals from "@/components/signals/my-smart-signals";
import SignalBuilder from "@/components/signals/signal-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activeSignalTabAtom } from "@/lib/atoms/signalTabsAtom";
import { useAtom } from "jotai";

export default function Home() {
  const [astiveSignalTab, setActiveSignalTab] = useAtom(activeSignalTabAtom);

  return (
    <div className="bg-black min-h-screen p-2 h-full w-full">
      <Tabs
        defaultValue="my-signals"
        value={astiveSignalTab}
        onValueChange={setActiveSignalTab}
      >
        <TabsList className="grid w-full max-w-60 grid-cols-2 bg-[#0B0B0B]">
          <TabsTrigger value={"my-signals"}>My Signals</TabsTrigger>
          <TabsTrigger value={"signal-builder"}>Signal Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="my-signals">
          <MySignals />
        </TabsContent>

        <TabsContent value="signal-builder">
          <SignalBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
