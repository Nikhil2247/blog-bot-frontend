import React from 'react';
import { SearchIcon, TrashIcon, EditIcon, BookmarkIcon } from './Icons'; // Assuming BookmarkIcon is available

const SavedBlogsView = ({ filteredSavedBlogs, setSearchTerm, handleDeleteBlog, setView }) => {
    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookmarkIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Saved Blogs</h1>
                        <p className="text-lg text-gray-500">Browse, edit, and manage your saved content.</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Search saved blogs by title..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 text-lg bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    <div className="absolute top-0 left-0 h-full flex items-center pl-4 pointer-events-none">
                        <SearchIcon className="text-gray-400 w-6 h-6" />
                    </div>
                </div>

                {/* Blog List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSavedBlogs.length > 0 ? (
                        filteredSavedBlogs.map(blog => (
                            <div 
                                key={blog._id} 
                                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex-grow mb-4">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">{blog.topic}</h3>
                                    <p className="text-sm text-gray-500">
                                        Saved on: {new Date(blog.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setView({ name: 'editor', data: { ...blog, source: 'saved' } })}
                                        className="flex-1 flex items-center justify-center p-3 text-gray-600 bg-gray-100 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors font-semibold"
                                        title="Edit Blog"
                                    >
                                        <EditIcon className="w-4 h-4 mr-2" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete "${blog.topic}"?`)) {
                                                handleDeleteBlog(blog._id);
                                            }
                                        }}
                                        className="p-3 text-gray-500 bg-gray-100 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                        title="Delete Blog"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white border-2 border-dashed rounded-xl">
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookmarkIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700">No Saved Blogs Found</h3>
                            <p className="text-gray-500 mt-2">Your saved blogs will appear here once you save them from a chat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedBlogsView;
