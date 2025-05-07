import SignalBuilder from "@/components/signals/signal-builder";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import AddSmartSignalPopup from "./AddSmartSignalPopup";
import SmartSignalList from "./SmartSignalList";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Plus, TrendingUp } from "lucide-react";
// import AddSmartSignalPopup from "./AddSmartSignalPopup";
// import NotificationList from "./NotificationList";
// import SmartSignalList from "./SmartSignalList";

// export default function SmartSignalsMvp() {
//   return (
//     <Card className="w-full h-full bg-card border-border">
//       <CardHeader>
//         <CardTitle className="text-xl text-foreground">
//           Smart Signals Dashboard
//         </CardTitle>
//         <CardDescription className="text-muted-foreground">
//           View your signals and notifications
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="flex-grow">
//         <div className="grid grid-cols-2 gap-6 h-full">
//           {/* Smart Signals Section */}
//           <div className="flex flex-col">
//             <div className="text-lg font-semibold flex items-center text-foreground h-16">
//               <TrendingUp size={18} className="mr-2 text-primary" />
//               <h2 className="grid place-items-center pl-2">Smart Signals</h2>
//               <div className="flex-grow"></div>
//               <AddSmartSignalPopup
//                 trigger={
//                   <Button
//                     variant="outline"
//                     className="border-dashed border-border bg-muted text-primary hover:text-primary/80 hover:bg-muted/80 max-w-max"
//                   >
//                     <Plus size={16} />
//                     Add Smart Signal
//                   </Button>
//                 }
//               />
//             </div>

//             <div className="flex justify-end"></div>

//             <div className="space-y-2 overflow-y-auto">
//               <SmartSignalList />
//             </div>
//           </div>

//           {/* Notifications Section */}
//           <div>
//             <NotificationList />
//           </div>
//         </div>

//         {/* TEMP */}
//         <div className="max-w-5xl mx-auto">

//         </div>
//       </CardContent>
//     </Card>
//   );
//}

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
              <div className="grid grid-cols-2 gap-6">
                <AddSmartSignalPopup
                  trigger={
                    <Button
                      variant="outline"
                      className="border-dashed border-border bg-muted text-primary hover:text-primary/80 hover:bg-muted/80 max-w-max"
                    >
                      <Plus size={16} />
                      Add Smart Signal
                    </Button>
                  }
                />
                <SmartSignalList />
              </div>
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
