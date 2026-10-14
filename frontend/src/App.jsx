import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Menu } from "lucide-react";
import  API_BASE_URL from "./service/core/api.js"
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import ChatHeader from "./components/ChatHeader/ChatHeader.jsx";
import MessageList from "./components/MessageList/MessageList.jsx";
import ChatInput from "./components/ChatInput/ChatInput.jsx";
import Images from "./components/Images/Images.jsx";
import AppsPage from "./components/Apps/AppsPage.jsx"; 
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";

import "./App.css";


function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("activeUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("activeUser");
    return null;
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(getSavedUser);
  const [showRegister, setShowRegister] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePanel, setActivePanel] = useState("chat");
  const [searchText, setSearchText] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations`
      );

      if (response.data.success) {
        const data = response.data.data;

        setConversations(
          Array.isArray(data)
            ? data
            : data?.conversations || []
        );
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    } else {
      setConversations([]);
    }
  }, [currentUser, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversations, isLoading]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 769px)");

    const handleScreenChange = (event) => {
      if (event.matches) {
        setMobileSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  const handleLoginSuccess = (user) => {
    localStorage.setItem("activeUser", JSON.stringify(user));
    setCurrentUser(user);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (user) => {
    localStorage.setItem("activeUser", JSON.stringify(user));
    setCurrentUser(user);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("activeUser");
    localStorage.removeItem("authToken");

    setCurrentUser(null);
    setConversations([]);
    setSearchText("");
    setActivePanel("chat");
    setMobileSidebarOpen(false);
  };

  const handleNewChat = () => {
    setConversations([]);
    setSearchText("");
    setActivePanel("chat");
    setMobileSidebarOpen(false);
  };

  const handleSelectPanel = (panel) => {
    setActivePanel(panel);
    setMobileSidebarOpen(false);
  };

  const handleSendMessage = async (question) => {
    if (!question?.trim() || isLoading) return;

    const tempUserMessage = {
      id: Date.now(),
      role: "user",
      content: question.trim(),
    };

    setConversations((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/conversations`,
        { question: question.trim() }
      );

      if (response.data.success) {
        const {
          userConversation,
          assistantConversation,
        } = response.data.data;

        setConversations((prev) => [
          ...prev.filter(
            (message) => message.id !== tempUserMessage.id
          ),
          userConversation,
          assistantConversation,
        ]);
      } else {
        throw new Error(
          response.data.message || "Could not generate a response."
        );
      }
    } catch (error) {
      console.error("Error posting conversation:", error);

      setConversations((prev) => [
        ...prev.filter(
          (message) => message.id !== tempUserMessage.id
        ),
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "There was an error generating a response.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter((message) =>
    String(message.content || "")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const handleShowChat = () => {
    setActivePanel("chat");
    setSearchText("");
  };

  // Show authentication screens before the chat application.
  if (!currentUser) {
    if (showRegister) {
      return (
        <Register
          onShowLogin={() => setShowRegister(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }

    return (
      <Login
        onShowRegister={() => setShowRegister(true)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const panelDescriptions = {
    research: {
      title: "Deep research",
      description: "A research workflow can be added here.",
    },
    codex: {
      title: "Codex",
      description: "Your coding assistant tools can appear here.",
    },
    projects: {
      title: "Projects",
      description: "Your saved projects can appear here.",
    },
  };

  return (
    <div className="app">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMobileSidebarOpen((prev) => !prev)}
        aria-label="Open sidebar"
        aria-expanded={mobileSidebarOpen}
      >
        <Menu size={22} />
      </button>

      {mobileSidebarOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        onNewChat={handleNewChat}
        onSelectPanel={handleSelectPanel}
        activePanel={activePanel}
        conversations={filteredConversations}
        onSearchChange={setSearchText}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <main className="chat">
        <ChatHeader />

        {activePanel === "chat" || activePanel === "search" ? (
          <>
            {activePanel === "search" && (
              <p className="search-results-label">
                {searchText
                  ? `Search results for: ${searchText}`
                  : "Enter a word in Search chats to find messages."}
              </p>
            )}

            <MessageList
              conversations={
                activePanel === "search"
                  ? filteredConversations
                  : conversations
              }
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />

            {activePanel === "chat" && (
              <ChatInput
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            )}

            {activePanel === "search" && (
              <button type="button" onClick={handleShowChat}>
                Back to chat
              </button>
            )}
          </>
        ) : activePanel === "images" ? (
          <Images />
        ) : activePanel === "apps" ? (
          /* Render the custom Apps integration page when "apps" is selected */
          <AppsPage onBackToChat={() => setActivePanel("chat")} />
        ) : (
          <section className="feature-panel">
            <h2>
              {panelDescriptions[activePanel]?.title || "Feature"}
            </h2>

            <p>
              {panelDescriptions[activePanel]?.description ||
                "This feature is not configured yet."}
            </p>

            <button
              type="button"
              onClick={() => setActivePanel("chat")}
            >
              Back to chat
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;