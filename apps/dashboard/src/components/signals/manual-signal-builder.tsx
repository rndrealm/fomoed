import React, { useCallback, useState } from "react";
import SignalConditionGroup, {
  Condition,
  defaultGroup,
  Group,
} from "./condition-group";

const ManualSignalBuilder = () => {
  // The root group state (always present)
  const [rootGroup, setRootGroup] = useState<Group>(defaultGroup(0));
  const [logic, setLogic] = useState<object | null>(null);

  // Recursively update a group or condition in the tree
  const updateGroup = useCallback((updated: Group) => {
    setRootGroup(updated);
  }, []);

  // Convert the group tree to JSON-logic
  const toJsonLogic = useCallback((group: Group): any => {
    const validChildren = group.children.filter(Boolean);
    if (validChildren.length === 1 && validChildren[0].type === "condition") {
      return conditionToJsonLogic(validChildren[0] as Condition);
    }
    const arr = validChildren
      .map((c) =>
        c.type === "condition"
          ? conditionToJsonLogic(c as Condition)
          : toJsonLogic(c as Group)
      )
      .filter(Boolean);
    return { [group.operand]: arr };
  }, []);

  // Update JSON-logic output whenever the group tree changes
  React.useEffect(() => {
    setLogic(toJsonLogic(rootGroup));
  }, [rootGroup, toJsonLogic]);

  const handleTestApi = async () => {
    const testData = {
      user_id: 4291,
      topics: ["ticker_BTCUSDT"],
      condition: '{">":[100000,{"topic":["ticker_BTCUSDT","price"]}]}',
      actions: [
        {
          type: "email",
          subject: "Price Alert",
          content: "ADS",
        },
        {
          type: "notification",
          description: "BTC price target reached",
        },
      ],
    };

    try {
      const response = await fetch(
        "http://api.fomoed.io:8080/api/v1/smart-signal/new",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("API response:", data);
    } catch (error) {
      console.error("Error testing API:", error);
    }
  };

  return (
    <div className="p-6">
      <SignalConditionGroup
        group={rootGroup}
        depth={0}
        onUpdate={updateGroup}
      />
      <div className="pt-6">
        <div className="text-lg font-semibold pb-2">JSON Logic Output</div>
        <pre className="bg-muted rounded p-4 text-xs overflow-x-auto">
          {logic ? JSON.stringify(logic, null, 2) : "No logic yet"}
        </pre>
      </div>

      <button onClick={handleTestApi}>Test API</button>
    </div>
  );
};

// Helper for JSON-logic conversion
function conditionToJsonLogic(cond: Condition) {
  console.log("conditionToJsonLogic", cond);
  if (!cond.operator || !cond.topic || !cond.value) return null;
  return {
    [cond.operator]: [
      isNaN(Number(cond.value)) ? cond.value : Number(cond.value),
      {
        topic: [cond.topic, cond.dataSource],
      },
    ],
  };
}

export default ManualSignalBuilder;
