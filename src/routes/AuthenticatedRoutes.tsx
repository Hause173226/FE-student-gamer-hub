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
import { Rooms } from "../pages/Rooms";
import ClubDetail from "../pages/ClubDetail";
import Friends from "../pages/Friends";
import { ViewType } from "../types";

export const AuthenticatedApp: React.FC = () => {
  const location = useLocation();
  
  // Determine current view from URL
  const getCurrentView = (): ViewType => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path as ViewType;
  };

  const [currentView, setCurrentView] = useState<ViewType>(getCurrentView());

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/:communityId" element={<CommunityDetail />} />
        <Route path="/clubs/:clubId" element={<ClubDetail />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/rooms" element={<Rooms />} />
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
