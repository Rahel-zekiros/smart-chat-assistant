import React, { useState } from 'react';
import styles from "./Apps.module.css";
export default function AppsPage({ onBackToChat }) {
  const [apps, setApps] = useState([
    { id: 1, name: 'Web Search Tool', description: 'Allows the AI to search real-time information from the web.', category: 'Productivity', enabled: true },
    { id: 2, name: 'PDF & RAG Knowledge Base', description: 'Query and analyze documents using vector embeddings.', category: 'AI & Data', enabled: true },
    { id: 3, name: 'Code Execution Engine', description: 'Run and test code snippets directly within the platform.', category: 'Development', enabled: false },
    { id: 4, name: 'Image Generation Studio', description: 'Create stunning visuals and graphics via text prompts.', category: 'Creative', enabled: true }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');

  const toggleApp = (id) => {
    setApps(apps.map(app => app.id === id ? { ...app, enabled: !app.enabled } : app));
  };

  const handleAddApp = (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp = {
      id: apps.length + 1,
      name: newAppName,
      description: newAppDesc || 'Custom integrated application.',
      category: 'Custom',
      enabled: true
    };

    setApps([...apps, newApp]);
    setNewAppName('');
    setNewAppDesc('');
    setShowAddModal(false);
  };

  return (
    <div className={styles.appsPageContainer}>
      <div className={styles.appsMainCard}>
        <div className={styles.appsHeader}>
          <div>
            <h2>Apps & Integrations</h2>
            <p>Your application integrations and enabled tools.</p>
          </div>
          <div className={styles.appsActions}>
            <button className={styles.addAppBtn} onClick={() => setShowAddModal(true)}>+ Add App</button>
            <button className={styles.backBtn} onClick={onBackToChat}>Back to chat</button>
          </div>
        </div>

        <div className={styles.appsGrid}>
          {apps.map((app) => (
            <div key={app.id} className={`${styles.appCard} ${app.enabled ? styles.active : ''}`}>
              <div className={styles.appInfo}>
                <span className={styles.appCategory}>{app.category}</span>
                <h3>{app.name}</h3>
                <p>{app.description}</p>
              </div>
              <div className={styles.appFooter}>
                <span className={`${styles.statusBadge} ${app.enabled ? styles.enabled : styles.disabled}`}>
                  {app.enabled ? 'Active' : 'Disabled'}
                </span>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={app.enabled} 
                    onChange={() => toggleApp(app.id)} 
                  />
                  <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Add Custom Integration</h3>
            <form onSubmit={handleAddApp}>
              <label>App Name</label>
              <input 
                type="text" 
                placeholder="e.g., GitHub Tracker" 
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                required
              />
              <label>Description</label>
              <textarea 
                placeholder="Briefly describe what this app does..." 
                value={newAppDesc}
                onChange={(e) => setNewAppDesc(e.target.value)}
              />
              <div className={styles.modalButtons}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save App</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}