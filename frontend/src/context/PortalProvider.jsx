import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { PortalContext } from "./PortalContext";

const userStorageKey = "mapmycivic-session";

export function PortalProvider({ children }) {
  const [departments, setDepartments] = useState([]);
  const [issues, setIssues] = useState([]);
  const [notices, setNotices] = useState([]);
  const [cctvChecklist, setCctvChecklist] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = window.localStorage.getItem(userStorageKey);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getBootstrap();
      setDepartments(data.departments);
      setIssues(data.issues);
      setNotices(data.notices);
      setCctvChecklist(data.cctvChecklist);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const signIn = async (payload) => {
    const session = await api.login(payload);
    setCurrentUser(session.user);
    window.localStorage.setItem(userStorageKey, JSON.stringify(session.user));
    window.localStorage.setItem(api.TOKEN_STORAGE_KEY, session.token);
    return session;
  };

  const signOut = () => {
    setCurrentUser(null);
    window.localStorage.removeItem(userStorageKey);
    window.localStorage.removeItem(api.TOKEN_STORAGE_KEY);
  };

  const createNotice = async (payload) => {
    const notice = await api.createNotice(payload);
    setNotices((current) => [notice, ...current]);
    return notice;
  };

  const saveIssueNotes = async (issueId, notes) => {
    const issue = await api.updateIssueNotes(issueId, notes);
    setIssues((current) =>
      current.map((item) => (item.id === issue.id ? issue : item))
    );
    return issue;
  };

  const uploadCctvClip = async (issueId, clip) => {
    const result = await api.uploadIssueClip(issueId, clip);
    setIssues((current) =>
      current.map((item) => (item.id === result.issue.id ? result.issue : item))
    );
    return result.issue;
  };

  const saveIssueStatus = async (issueId, payload) => {
    const issue = await api.updateIssueStatus(issueId, payload);
    setIssues((current) =>
      current.map((item) => (item.id === issue.id ? issue : item))
    );
    return issue;
  };

  const value = useMemo(
    () => ({
      departments,
      issues,
      notices,
      cctvChecklist,
      currentUser,
      loading,
      error,
      refreshData,
      signIn,
      signOut,
      createNotice,
      saveIssueNotes,
      saveIssueStatus,
      uploadCctvClip,
    }),
    [departments, issues, notices, cctvChecklist, currentUser, loading, error]
  );

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}
