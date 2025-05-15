import SignalBuilder from "@/components/signals/signal-builder";

const Page = () => {
  return (
    <div className="w-full">
      <div className="my-6">
        <h1 className="font-medium text-xl mt-5">Signal Conditions</h1>
        <h2 className="font-medium text-muted-foreground">
          Build your Smart signals
        </h2>
      </div>

      <SignalBuilder />
    </div>
  );
};

export default Page;
