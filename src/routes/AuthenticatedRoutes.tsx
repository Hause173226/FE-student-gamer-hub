import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { PageTransition } from "../components/PageTransition";
import Dashboard from "../pages/Dashboard";
import Games from "../pages/Games";
import MyGames from "../pages/MyGames";
import Quests from "../pages/Quests";
import { Communities } from "../pages/Communities";
import { CommunityDetail } from "../pages/CommunityDetail";
import { ChatGroups } from "../pages/ChatGroups";
import { DiscordChat } from "../pages/DiscordChat";
import { TestLogin } from "../pages/TestLogin";
import Profile from "../pages/Profile";
import Events from "../pages/Events";
import ProfileSettings from "../components/auth/ProfileSettings";
import { Rooms } from "../pages/Rooms";
import ClubDetail from "../pages/ClubDetail";
import Friends from "../pages/Friends";
import { ViewType } from "../types";
import ChatPage from "../pages/ChatPage";
import DebugToken from "../pages/DebugToken";
import Membership from "../pages/Membership";
import MembershipSuccess from "../pages/MembershipSuccess";
import ChatRoomLab from "../pages/ChatRoomLab";
import RoomChat from "../pages/RoomChat";

export const AuthenticatedApp: React.FC = () => {
  const location = useLocation();

  // Determine current view from URL
  const getCurrentView = (): ViewType => {
    const path = location.pathname.split("/")[1] || "dashboard";
    return path as ViewType;
  };

  const [currentView, setCurrentView] = useState<ViewType>(getCurrentView());

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      <PageTransition>
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/games" element={<Games />} />
          <Route path="/my-games" element={<MyGames />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/communities" element={<Communities />} />
          <Route
            path="/communities/:communityId"
            element={<CommunityDetail />}
          />
          <Route path="/clubs/:clubId" element={<ClubDetail />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomId" element={<RoomChat />} />
          <Route path="/chat-lab" element={<ChatRoomLab />} />
          <Route path="/chat/dm/:otherId" element={<ChatPage />} />
          <Route path="/chat-groups" element={<ChatGroups />} />
          <Route path="/chat/:groupId" element={<DiscordChat />} />
          <Route path="/test-login" element={<TestLogin />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/membership/success" element={<MembershipSuccess />} />
          <Route path="/debug-token" element={<DebugToken />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </PageTransition>
    </MainLayout>
  );
};
