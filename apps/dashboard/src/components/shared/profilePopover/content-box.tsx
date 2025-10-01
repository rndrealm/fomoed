import React from "react";
import { ActiveTabType } from "./sidebar-tabs";
import ProfileBox from "./contentBox/profileBox/profile-box";
import DataPrivacyBox from "./contentBox/dataprivacy-box";
import ConnectionsBox from "./contentBox/connections-box";
import SubscriptionsBox from "./contentBox/subscriptions-box";
import KeyboardShortcutsBox from "./contentBox/keyboard-shortcuts";
import WhatsNewBox from "./contentBox/whats-new-box";

const ContentBox = ({ activeTab }: { activeTab: ActiveTabType }) => {
  // console.log("activeTab", activeTab);

  return (
    <div className="relative flex-1 items-start justify-center outline-none">
      {activeTab === "Profile" && <ProfileBox />}
      {activeTab === "Data and Privacy" && <DataPrivacyBox />}
      {activeTab === "Connections" && <ConnectionsBox />}
      {activeTab === "Subscriptions" && <SubscriptionsBox />}
      {activeTab === "Keyboard Shortcuts" && <KeyboardShortcutsBox />}
      {activeTab === "Whats New" && <WhatsNewBox />}

      {/* plans content is just profileBox with popover shown */}
      {activeTab === "Plans" && <ProfileBox isPlans />}
    </div>
  );
};

export default ContentBox;
