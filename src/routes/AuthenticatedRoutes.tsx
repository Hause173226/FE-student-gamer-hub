import React, { useState } from "react";
import { MainLayout } from "../layouts/MainLayout";
import { Dashboard } from "../pages/Dashboard";
import { Communities } from "../pages/Communities";
import { Profile } from "../pages/Profile";
import { Events } from "../pages/Events";
import { Rooms } from "../pages/Rooms";
import Friends from "../pages/Friends"; // ✅ Import component Friends
import { ViewType } from "../types";

export const AuthenticatedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "communities":
        return <Communities />;
      case "friends":
        return <Friends />; // ✅ Thêm case này
      case "rooms":
        return <Rooms />;
      case "events":
        return <Events />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </MainLayout>
  );
};
