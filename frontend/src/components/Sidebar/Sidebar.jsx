
import { useState } from "react";
import {
  MessageSquare,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Microscope,
  Code2,
  FolderKanban,
  PanelLeftClose,
  X,
  LogOut,
} from "lucide-react";

import styles from "./Sidebar.module.css";

const menuItems = [
  { id: "images", label: "Images", Icon: ImageIcon },
  { id: "apps", label: "Apps", Icon: LayoutGrid },
  { id: "research", label: "Deep research", Icon: Microscope },
  { id: "codex", label: "Codex", Icon: Code2 },
  { id: "projects", label: "Projects", Icon: FolderKanban },
];

export default function Sidebar({
  currentUser,
  onLogout,
  onNewChat,
  onSelectPanel,
  activePanel,
  conversations = [],
  onSearchChange,
  mobileOpen,
  onCloseMobile,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearch = (value) => {
    setSearchText(value);
    onSearchChange?.(value);
  };

  const handleNewChatClick = () => {
    onNewChat?.();
    onCloseMobile?.();
  };

  const handlePanelClick = (panel) => {
    onSelectPanel?.(panel);
    onCloseMobile?.();
  };

  const firstName = currentUser?.firstName || "";
  const lastName = currentUser?.lastName || "";
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    currentUser?.name ||
    "User";

  const initials = fullName
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={[
        styles.sidebar,
        collapsed ? styles.collapsed : "",
        mobileOpen ? styles.mobileOpen : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.header}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Open sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeftClose size={20} />
        </button>

        {!collapsed && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleNewChatClick}
            title="New chat"
            aria-label="New chat"
          >
            <MessageSquare size={20} />
          </button>
        )}

        <button
          type="button"
          className={`${styles.iconBtn} ${styles.mobileCloseBtn}`}
          onClick={onCloseMobile}
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <X size={21} />
        </button>
      </div>

      {!collapsed && (
        <nav className={styles.nav}>
          <button
            type="button"
            className={`${styles.item} ${
              activePanel === "chat" ? styles.active : ""
            }`}
            onClick={handleNewChatClick}
          >
            <MessageSquare size={18} />
            <span>New chat</span>
          </button>

          <button
            type="button"
            className={`${styles.item} ${
              activePanel === "search" ? styles.active : ""
            }`}
            onClick={() => {
              setSearchOpen((prev) => !prev);
              handlePanelClick("search");
            }}
          >
            <Search size={18} />
            <span>Search chats</span>
          </button>

          {searchOpen && (
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchText}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                aria-label="Search messages"
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}

              <small>
                {conversations.length} messages loaded
              </small>
            </div>
          )}

          {menuItems.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              className={`${styles.item} ${
                activePanel === id ? styles.active : ""
              }`}
              onClick={() => handlePanelClick(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>

          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {fullName}
              </span>

              <span className={styles.userPlan}>
                {currentUser?.plan || "Free"} plan
              </span>

              {currentUser?.email && (
                <span className={styles.userEmail}>
                  {currentUser.email}
                </span>
              )}
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            className={styles.item}
            onClick={onLogout}
            title="Log out"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
