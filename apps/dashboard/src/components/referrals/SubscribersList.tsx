import React, { FC } from "react";

// --- Type Definitions ---
interface Subscriber {
  id: number;
  name: string;
  status: "Active Subscriber"; // Can be expanded later e.g. | "Cancelled"
  earnings: number;
}

// --- Dummy Data ---
const dummySubscribers: Subscriber[] = [
  { id: 1, name: "Leo K.", status: "Active Subscriber", earnings: 9.99 },
  { id: 2, name: "David A.", status: "Active Subscriber", earnings: 9.99 },
];

const SubscribersList: FC = () => {
  return (
    <div className="bg-[#121212] border-[#121212] rounded-xl">
      {/* --- Table Header --- */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-zinc-800 text-sm text-zinc-400">
        <div className="col-span-1">NAME</div>
        <div className="col-span-1">STATUS</div>
        <div className="col-span-1 text-right">EARNINGS</div>
      </div>

      {/* --- Table Body --- */}
      <div className="divide-y divide-zinc-800">
        {dummySubscribers.map((subscriber) => (
          <div key={subscriber.id} className="grid grid-cols-3 gap-4 p-4 items-center">
            <div className="col-span-1 font-medium">{subscriber.name}</div>
            <div className="col-span-1 underline">
                {subscriber.status}
            </div>
            <div className="col-span-1 text-right font-medium">
              ${subscriber.earnings.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribersList;
