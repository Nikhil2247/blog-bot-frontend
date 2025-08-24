// src/components/Sidebar.jsx
import React, { useState } from 'react';
import {
    XIcon, MenuIcon, PlusIcon, ClockIcon, SparklesIcon, TrashIcon, BookmarkIcon
} from './Icons';

const Sidebar = ({
    isSidebarOpen, setIsSidebarOpen, startNewChat, setView, chatHistory,
    loadChatHistory, activeChatId, deleteChatItem, clearChatHistory
}) => {
    // Local state to track hover, independent of the pinned state
    const [isHovered, setIsHovered] = useState(false);

    // The sidebar is visually expanded if it's pinned open OR being hovered
    const isExpanded = isSidebarOpen || isHovered;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed top-0 left-0 h-full z-30 bg-white border-r border-gray-200 shadow-xl flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-80 p-6' : 'w-20 p-4'}`}
        >
            <div className={`flex items-center mb-8 flex-shrink-0 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                {isExpanded && (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">BlogBot</h2>
                            <p className="text-xs text-gray-500">AI Content Creator</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                </button>
            </div>

            <div className="space-y-3 mb-8">
                <button
                    onClick={startNewChat}
                    title="New Chat"
                    className={`w-full flex items-center justify-center p-4 rounded-xl transition-all font-semibold ${isExpanded ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                    <PlusIcon className={isExpanded ? "mr-2" : ""} />
                    {isExpanded && <span>New Chat</span>}
                </button>
                <button
                    onClick={() => setView({ name: 'schedule', data: null })}
                    title="View Schedule"
                    className="w-full flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                    <ClockIcon className={isExpanded ? "mr-2" : ""} />
                    {isExpanded && <span>View Schedule</span>}
                </button>
                {/* --- NEW BUTTON --- */}
                <button
                    onClick={() => setView({ name: 'saved', data: null })}
                    title="View Saved Blogs"
                    className="w-full flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                    <BookmarkIcon className={isExpanded ? "mr-2" : ""} />
                    {isExpanded && <span>Saved Blogs</span>}
                </button>
                <button
                    onClick={() => { setView({ name: 'refine', data: null }); }}
                    title="Refine Content"
                    className="w-full flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                    <SparklesIcon className={isExpanded ? "mr-2" : ""} />
                    {isExpanded && <span>Refine Content</span>}
                </button>
            </div>

            <div className="flex-grow overflow-y-auto overflow-x-hidden w-full">
                {isExpanded && <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wide">Recent Chats</h3>}
                {chatHistory.length > 0 ? (
                    <ul className="space-y-2 mb-8">
                        {chatHistory.slice(0, 10).map(chat => (
                            <li key={chat.id} className={`group ${isExpanded ? '' : 'mb-3'}`}>
                                <div
                                    onClick={() => loadChatHistory(chat.id)}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${activeChatId === chat.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'} ${isExpanded ? 'justify-between' : 'justify-center h-12 w-12'}`}
                                    title={chat.title}
                                >
                                    {isExpanded ? (
                                        <>
                                            <span className="truncate flex-1 text-sm font-medium text-gray-700">{chat.title}</span>
                                            <button
                                                onClick={e => { e.stopPropagation(); deleteChatItem(chat.id); }}
                                                className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1 rounded"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="font-bold text-indigo-600 text-lg">{chat.title.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : ( isExpanded && <p className="text-gray-500 text-sm text-center mb-8">No chats yet.</p> )}
                {isExpanded && chatHistory.length > 0 && (
                    <button onClick={clearChatHistory} className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors mb-8 py-2">
                        Clear all chats
                    </button>
                )}
                {/* The list of saved blogs has been removed from here */}
            </div>
        </div>
    );
};

export default Sidebar;
