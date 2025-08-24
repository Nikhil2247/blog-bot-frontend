// src/App.js
import React, { useState, useEffect, useRef } from "react";

// Import Components
import Sidebar from "./components/sidebar";
import ChatView from "./components/Chatview";
import ScheduleView from "./components/ScheduleView";
import RefineView from "./components/Refine";
import BlogEditor from "./components/BlogEditor";
import ScheduleModal from "./components/ScheduleModel";
import SavedBlogsView from "./components/Savedblog";
import { XIcon } from "./components/Icons";

export default function App() {
  // --- STATE MANAGEMENT ---
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState(
    () => JSON.parse(localStorage.getItem("blogBotChatHistory")) || []
  );
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledBlogs, setScheduledBlogs] = useState([]);
  const [view, setView] = useState({ name: "chat", data: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const chatEndRef = useRef(null);
  const [rawInput, setRawInput] = useState("");
  const [refinedTopic, setRefinedTopic] = useState("");
  const [refinedContent, setRefinedContent] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [schedulingMode, setSchedulingMode] = useState("generate");

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem("blogBotChatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isLoading]);
  useEffect(() => {
    const fetchAllData = () => {
      fetchSavedBlogs();
      fetchScheduledBlogs();
    };
    fetchAllData();
    const interval = setInterval(fetchScheduledBlogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- DATA FETCHING & API CALLS ---
  const fetchSavedBlogs = async () => {
    try {
      const response = await fetch(
        "https://api.blog.omnicassion.com/saved-blogs"
      );
      if (!response.ok) throw new Error("Failed to fetch saved blogs");
      const data = await response.json();
      setSavedBlogs(data);
    } catch (err) {
      console.error("Error fetching saved blogs:", err);
    }
  };

  const fetchScheduledBlogs = async () => {
    try {
      const res = await fetch(
        "https://api.blog.omnicassion.com/scheduled-blogs"
      );
      if (!res.ok)
        throw new Error(`Server responded with status ${res.status}`);
      const data = await res.json();
      setScheduledBlogs(data);
    } catch (err) {
      console.error("Could not fetch scheduled blogs:", err.message);
    }
  };

  const handleSaveBlog = async (blog, content, titleImage) => {
    try {
      const response = await fetch(
        `https://api.blog.omnicassion.com/update-blog/${blog._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, titleImage }),
        }
      );
      if (!response.ok) throw new Error("Failed to save changes.");
      fetchSavedBlogs();
      fetchScheduledBlogs();
      setView({
        name: blog.source === "saved" ? "saved" : "schedule",
        data: null,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveToDB = async (blogId) => {
    try {
      const response = await fetch(
        `https://api.blog.omnicassion.com/save-blog/${blogId}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to save blog to database");
      fetchSavedBlogs();
      fetchScheduledBlogs();
      setView({ name: "schedule", data: null });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const response = await fetch(
        `https://api.blog.omnicassion.com/blogs/${blogId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete blog");
      fetchSavedBlogs();
      fetchScheduledBlogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSchedule = async (
    topic,
    scheduledTime,
    titleImage,
    category = "general",
    priority = "medium",
    content = null
  ) => {
    try {
      const response = await fetch(
        "https://api.blog.omnicassion.com/schedule-blog",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            scheduledTime,
            titleImage,
            category,
            priority,
            content,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to schedule blog");
      fetchScheduledBlogs();
      setView({ name: "schedule", data: null });
    } catch (err) {
      setError("Failed to schedule blog post.");
    }
  };

  const handleRefineSubmit = async () => {
    if (!rawInput.trim()) {
      setError("Please paste content to refine.");
      return;
    }
    setIsRefining(true);
    setRefinedContent("");
    setError(null);
    try {
      const prompt = `Please refine the following raw text into a well-structured and engaging blog post. Use markdown for formatting: use '# ' for the main title, '## ' for subheadings, '**text**' for bolding important keywords, and '__text__' for underlining key phrases. Make the content more readable and professional. Do not add any introductory or concluding text. Raw text is below:\n\n---\n\n${rawInput}`;
      const response = await fetch(
        "https://api.blog.omnicassion.com/generate-blog",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: [{ author: "user", text: prompt }] }),
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).error || "Failed to refine content."
        );
      const data = await response.json();
      setRefinedContent(data.blog);
    } catch (err) {
      setError(`Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveRefinedBlog = async () => {
    if (!refinedTopic.trim() || !refinedContent.trim()) {
      setError("Please provide a title and refine content before saving.");
      return;
    }
    try {
      const response = await fetch(
        "https://api.blog.omnicassion.com/saved-blogs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: refinedTopic,
            content: refinedContent,
            titleImage: null,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to save the refined blog.");
      await response.json();
      fetchSavedBlogs();
      alert("Blog saved successfully!");
      setView({ name: "chat", data: null });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveFromChat = async (blogContent) => {
    try {
      const response = await fetch(
        "https://api.blog.omnicassion.com/save-generated-blog",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: blogContent }),
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save the blog.");
      }
      await response.json();
      alert("Blog saved successfully!");
      fetchSavedBlogs();
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    const userMessage = { author: "user", text: question, id: Date.now() };
    const currentChatLog = [...chatLog, userMessage];
    setChatLog(currentChatLog);
    setIsLoading(true);
    setQuestion("");
    try {
      const response = await fetch(
        "https://api.blog.omnicassion.com/generate-blog",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: currentChatLog }),
        }
      );
      if (!response.ok) throw new Error((await response.json()).error);
      const data = await response.json();
      const aiMessage = { author: "ai", text: data.blog, id: Date.now() + 1 };
      const updatedChatLog = [...currentChatLog, aiMessage];
      setChatLog(updatedChatLog);
      if (activeChatId) {
        setChatHistory((p) =>
          p.map((h) =>
            h.id === activeChatId ? { ...h, log: updatedChatLog } : h
          )
        );
      } else {
        const newChatId = Date.now();
        setActiveChatId(newChatId);
        setChatHistory((p) => [
          { id: newChatId, title: question, log: updatedChatLog },
          ...p,
        ]);
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI LOGIC & HELPERS ---
  const filteredScheduledBlogs = scheduledBlogs.filter(
    (blog) =>
      blog &&
      blog.topic &&
      blog.topic.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "all" || blog.status === filterStatus)
  );
  const filteredSavedBlogs = savedBlogs.filter(
    (blog) =>
      blog &&
      blog.topic &&
      blog.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const startNewChat = () => {
    setView({ name: "chat", data: null });
    setActiveChatId(null);
    setChatLog([]);
  };
  const loadChatHistory = (chatId) => {
    const chat = chatHistory.find((h) => h.id === chatId);
    if (chat) {
      setView({ name: "chat", data: null });
      setActiveChatId(chat.id);
      setChatLog(chat.log);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };
  const deleteChatItem = (id) => {
    setChatHistory((p) => p.filter((h) => h.id !== id));
    if (activeChatId === id) startNewChat();
  };
  const clearChatHistory = () => {
    setChatHistory([]);
    startNewChat();
  };
  const handleClearScheduled = async () => {
    if (!window.confirm("Are you sure you want to delete all scheduled blogs?"))
      return;
    try {
      const deletePromises = scheduledBlogs.map((blog) =>
        fetch(`https://api.blog.omnicassion.com/blogs/${blog._id}`, {
          method: "DELETE",
        })
      );
      await Promise.all(deletePromises);
      fetchScheduledBlogs();
    } catch (err) {
      setError("Failed to clear scheduled blogs.");
    }
  };

  // --- RENDER LOGIC ---
  const renderView = () => {
    if (view.name === "editor") {
      const fullBlogData =
        view.data.source === "saved"
          ? savedBlogs.find((b) => b._id === view.data._id) || view.data
          : scheduledBlogs.find((b) => b._id === view.data._id) || view.data;
      return (
        <BlogEditor
          blog={fullBlogData}
          onBack={() =>
            setView(
              view.data.source === "saved"
                ? { name: "saved" }
                : { name: "schedule" }
            )
          }
          onSave={handleSaveBlog}
          onSaveToDB={handleSaveToDB}
          onDeleteBlog={handleDeleteBlog}
          isReadOnly={view.data.source === "saved"}
        />
      );
    }
    switch (view.name) {
      case "chat":
        return (
          <ChatView
            isLoading={isLoading}
            chatLog={chatLog}
            question={question}
            setQuestion={setQuestion}
            handleKeyDown={handleKeyDown}
            askQuestion={askQuestion}
            chatEndRef={chatEndRef}
            handleSaveBlog={handleSaveFromChat}
          />
        );
      case "schedule":
        return (
          <ScheduleView
            filteredScheduledBlogs={filteredScheduledBlogs}
            setSearchTerm={setSearchTerm}
            setFilterStatus={setFilterStatus}
            filterStatus={filterStatus}
            setIsModalOpen={setIsModalOpen}
            handleClearScheduled={handleClearScheduled}
            setView={setView}
            handleSaveToDB={handleSaveToDB}
            handleDeleteBlog={handleDeleteBlog}
            setSchedulingMode={setSchedulingMode}
          />
        );
      // --- NEW VIEW CASE ---
      case "saved":
        return (
          <SavedBlogsView
            filteredSavedBlogs={filteredSavedBlogs}
            setSearchTerm={setSearchTerm}
            handleDeleteBlog={handleDeleteBlog}
            setView={setView}
          />
        );
      case "refine":
        return (
          <RefineView
            rawInput={rawInput}
            setRawInput={setRawInput}
            refinedTopic={refinedTopic}
            setRefinedTopic={setRefinedTopic}
            refinedContent={refinedContent}
            isRefining={isRefining}
            handleRefineSubmit={handleRefineSubmit}
            handleSaveRefinedBlog={handleSaveRefinedBlog}
            setError={setError}
            setSchedulingMode={setSchedulingMode}
            setIsModalOpen={setIsModalOpen}
          />
        );
      default:
        return (
          <ChatView
            isLoading={isLoading}
            chatLog={chatLog}
            question={question}
            setQuestion={setQuestion}
            handleKeyDown={handleKeyDown}
            askQuestion={askQuestion}
            chatEndRef={chatEndRef}
            handleSaveBlog={handleSaveFromChat}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-gray-100 text-gray-800">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        startNewChat={startNewChat}
        setView={setView}
        chatHistory={chatHistory}
        loadChatHistory={loadChatHistory}
        activeChatId={activeChatId}
        deleteChatItem={deleteChatItem}
        clearChatHistory={clearChatHistory}
        handleDeleteBlog={handleDeleteBlog}
      />
      <main
        className="h-full pl-20"
        onClick={() => {
          if (isSidebarOpen) {
            setIsSidebarOpen(false);
          }
        }}
      >
        <div className="h-full flex flex-col">
          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-400 p-4 m-6 rounded-lg shadow-sm"
              role="alert"
            >
              <div className="flex items-center">
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-3 p-1 text-red-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-100"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="flex-grow">{renderView()}</div>
        </div>
      </main>
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSchedule={(topic, time, image, category, priority) => {
          if (schedulingMode === "pre-written") {
            handleSchedule(
              refinedTopic,
              time,
              image,
              category,
              priority,
              refinedContent
            );
          } else {
            handleSchedule(topic, time, image, category, priority, null);
          }
        }}
        initialTopic={schedulingMode === "pre-written" ? refinedTopic : ""}
      />
    </div>
  );
}
