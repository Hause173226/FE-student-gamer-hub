import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Dashboard } from "../pages/Dashboard";
import { Communities } from "../pages/Communities";
import { CommunityDetail } from "../pages/CommunityDetail";
import { ChatGroups } from "../pages/ChatGroups";
import { DiscordChat } from "../pages/DiscordChat";
import { TestLogin } from "../pages/TestLogin";
import { Profile } from "../pages/Profile";
import { Events } from "../pages/Events";
<<<<<<< HEAD
import { ViewType } from "../types";

export const AuthenticatedApp: React.FC = () => {
  const location = useLocation();
  
  // Determine current view from URL
  const getCurrentView = (): ViewType => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path as ViewType;
=======
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
>>>>>>> 408927fac4340bfa412e241d65f5e5b8c31cb82c
  };

  const [currentView, setCurrentView] = useState<ViewType>(getCurrentView());

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/:communityId" element={<CommunityDetail />} />
        <Route path="/chat-groups" element={<ChatGroups />} />
        <Route path="/chat/:groupId" element={<DiscordChat />} />
        <Route path="/test-login" element={<TestLogin />} />
        <Route path="/events" element={<Events />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};
