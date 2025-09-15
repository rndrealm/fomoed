import React from "react";
import { ActiveTabType } from "./sidebar-tabs";
import ProfileBox from "./contentBox/profile-box";
import DataPrivacyBox from "./contentBox/dataprivacy-box";
import ConnectionsBox from "./contentBox/connections-box";
import SubscriptionsBox from "./contentBox/subscriptions-box";
import KeyboardShortcutsBox from "./contentBox/keyboard-shortcuts";

const ContentBox = ({ activeTab }: { activeTab: ActiveTabType }) => {
  // console.log("activeTab", activeTab);

  return (
    <div className="flex-1 items-start justify-center outline-none">
      {activeTab === "Profile" && <ProfileBox />}
      {activeTab === "Data and Privacy" && <DataPrivacyBox />}
      {activeTab === "Connections" && <ConnectionsBox />}
      {activeTab === "Subscriptions" && <SubscriptionsBox />}
      {activeTab === "Keyboard Shortcuts" && <KeyboardShortcutsBox />}
    </div>
  );
};

export default ContentBox;
