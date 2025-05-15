"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const routes = [
  {
    name: "My Signals",
    value: "my-signals",
    path: "/signals",
  },
  {
    name: "Signal Builder",
    value: "signal-builder",
    path: "/signals/new",
  },
];

const SignalsTabs = () => {
  const router = useRouter();
  const pathname = usePathname();

  const currentRoute = routes.find((route) => pathname === route.path);

  return (
    <Tabs defaultValue={currentRoute?.value}>
      <TabsList className="grid w-full max-w-60 grid-cols-2 bg-[#0B0B0B]">
        {routes.map((route) => (
          <TabsTrigger
            key={route.value}
            value={route.value}
            onClick={() => {
              router.push(route.path);
            }}
          >
            {route.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default SignalsTabs;
