import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    StickyNote, Plus, Trash2, Edit2, Search,
    Pin, Tag, Check, Calendar, Folder, ArrowRight,
    AlertCircle, Sparkles, Filter, CheckSquare, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { useAuth } from '../../context/AuthContext';

interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    color: string;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}

const CATEGORIES = ['All', 'General', 'Study Materials', 'Lectures', 'Tasks', 'Ideas'];
const COLOR_PALETTES = [
    { name: 'yellow', bg: 'bg-[#FEF9C3] text-yellow-900 border-yellow-400', hex: '#FEF9C3' },
    { name: 'purple', bg: 'bg-[#F3E8FF] text-purple-900 border-purple-400', hex: '#F3E8FF' },
    { name: 'green', bg: 'bg-[#DCFCE7] text-green-900 border-green-400', hex: '#DCFCE7' },
    { name: 'blue', bg: 'bg-[#E0F2FE] text-blue-900 border-blue-400', hex: '#E0F2FE' },
    { name: 'orange', bg: 'bg-[#FFEDD5] text-orange-900 border-orange-400', hex: '#FFEDD5' }
];

export function NotesPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { mode, activeOrganization } = useOrganizationMode();
    const isOrgMode = mode === 'organization' && activeOrganization;
    const isMentorView = location.pathname.includes('mentor');

    // Notes State loaded from LocalStorage (scoped per user if possible)
    const storageKey = user ? `mentozy_notes_${user.id}` : 'mentozy_notes_default';
    const [notes, setNotes] = useState<Note[]>([]);
    
    // UI state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    
    // New Note Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [newColor, setNewColor] = useState('yellow');
    const [newIsPinned, setNewIsPinned] = useState(false);

    // Load Notes
    useEffect(() => {
        const savedNotes = localStorage.getItem(storageKey);
        if (savedNotes) {
            try {
                setNotes(JSON.parse(savedNotes));
            } catch (e) {
                console.error("Failed to parse notes:", e);
            }
        } else {
            // Default welcome notes
            const initialNotes: Note[] = [
                {
                    id: '1',
                    title: 'Welcome to Mentozy Notes 📝',
                    content: 'Jot down your lecture ideas, revision summaries, questions for your mentors, or task lists right here! Click edit to modify this note.',
                    category: 'General',
                    color: 'yellow',
                    isPinned: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Revision Tips 🐝',
                    content: '1. Check active task spaces on your dashboard daily.\n2. Leave review comments for your revisions.\n3. Make notes for asynchronous Event Loop classes.',
                    category: 'Study Materials',
                    color: 'purple',
                    isPinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            setNotes(initialNotes);
            localStorage.setItem(storageKey, JSON.stringify(initialNotes));
        }
    }, [storageKey]);

    // Save Notes
    const saveNotesToStorage = (updatedNotes: Note[]) => {
        setNotes(updatedNotes);
        localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    };

    // Add Note
    const handleCreateNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() && !newContent.trim()) {
            toast.error("Note cannot be empty!");
            return;
        }

        const newNote: Note = {
            id: Date.now().toString(),
            title: newTitle.trim() || 'Untitled Note',
            content: newContent.trim() || '',
            category: newCategory,
            color: newColor,
            isPinned: newIsPinned,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updated = [newNote, ...notes];
        saveNotesToStorage(updated);
        
        // Reset Form
        setNewTitle('');
        setNewContent('');
        setNewCategory('General');
        setNewColor('yellow');
        setNewIsPinned(false);
        setIsCreating(false);
        toast.success("Note created successfully!");
    };

    // Update Note
    const handleUpdateNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingNote) return;

        const updated = notes.map(n => {
            if (n.id === editingNote.id) {
                return {
                    ...editingNote,
                    updatedAt: new Date().toISOString()
                };
            }
            return n;
        });

        saveNotesToStorage(updated);
        setEditingNote(null);
        toast.success("Note updated!");
    };

    // Delete Note
    const handleDeleteNote = (id: string) => {
        const updated = notes.filter(n => n.id !== id);
        saveNotesToStorage(updated);
        toast.success("Note deleted");
    };

    // Toggle Pin
    const handleTogglePin = (id: string) => {
        const updated = notes.map(n => {
            if (n.id === id) {
                return { ...n, isPinned: !n.isPinned };
            }
            return n;
        });
        saveNotesToStorage(updated);
    };

    // Filtering & Searching Logic
    const filteredNotes = notes.filter(note => {
        const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
        const matchesQuery = 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    // Pinned vs Unpinned notes
    const pinnedNotes = filteredNotes.filter(n => n.isPinned);
    const otherNotes = filteredNotes.filter(n => !n.isPinned);

    return (
        <DashboardLayout>
            <div className={`max-w-7xl mx-auto space-y-8 pb-16 ${isOrgMode ? 'font-mono text-gray-900 select-none bg-[#FAF9F6] p-4 sm:p-8 min-h-screen rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''}`}>
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <StickyNote className="w-8 h-8 text-amber-500" />
                            Personal Notes
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Keep track of your learning notes, outlines, and study agendas.</p>
                    </div>

                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setEditingNote(null);
                        }}
                        className={`px-5 py-3 font-black text-sm flex items-center gap-2 transition-all ${
                            isOrgMode
                                ? 'bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                                : 'bg-gray-900 text-white hover:bg-black rounded-2xl shadow-lg shadow-gray-200'
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        Create Note
                    </button>
                </div>

                {/* Filters, Categories & Search */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes by title, content or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 bg-white text-sm outline-none border transition-all ${
                                isOrgMode
                                    ? 'border-2 border-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500/55'
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/70 rounded-2xl'
                            }`}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                            <Filter className="w-3.5 h-3.5" /> Filter:
                        </span>
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 text-xs font-bold transition-all border ${
                                    selectedCategory === category
                                        ? isOrgMode
                                            ? 'bg-gray-900 text-white border-gray-900 rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)]'
                                            : 'bg-indigo-600 text-white border-indigo-600 rounded-xl'
                                        : isOrgMode
                                            ? 'bg-white text-gray-700 border-gray-900 rounded-lg hover:bg-gray-50'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border-transparent rounded-xl'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Creation modal / block */}
                {isCreating && (
                    <div className={`p-6 bg-white border ${
                        isOrgMode ? 'border-2 border-gray-900 rounded-3xl shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'border-gray-100 rounded-[2.5rem] shadow-xl'
                    }`}>
                        <div className="flex items-center justify-between border-b pb-3 mb-5">
                            <h3 className="text-lg font-black text-gray-900">New Note</h3>
                            <button onClick={() => setIsCreating(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleCreateNote} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter note title..."
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className={`w-full px-4 py-2.5 border outline-none text-sm ${
                                        isOrgMode ? 'border-2 border-gray-900 rounded-xl' : 'border-gray-200 rounded-xl'
                                    }`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className={`w-full px-3 py-2.5 border outline-none text-sm bg-white ${
                                            isOrgMode ? 'border-2 border-gray-900 rounded-xl' : 'border-gray-200 rounded-xl'
                                        }`}
                                    >
                                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color Palette</label>
                                    <div className="flex items-center gap-1.5 h-10">
                                        {COLOR_PALETTES.map(palette => (
                                            <button
                                                key={palette.name}
                                                type="button"
                                                onClick={() => setNewColor(palette.name)}
                                                className={`w-7 h-7 rounded-full border-2 ${palette.bg} transition-transform flex items-center justify-center ${
                                                    newColor === palette.name ? 'scale-110 border-gray-900' : 'border-transparent'
                                                }`}
                                            >
                                                {newColor === palette.name && <Check className="w-3.5 h-3.5 text-gray-900" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1 flex items-center h-full pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newIsPinned}
                                            onChange={(e) => setNewIsPinned(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-black uppercase text-gray-700 tracking-wider">Pin this note</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Note Content</label>
                                <textarea
                                    placeholder="Write something amazing..."
                                    rows={4}
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    className={`w-full px-4 py-3 border outline-none text-sm resize-none ${
                                        isOrgMode ? 'border-2 border-gray-900 rounded-xl' : 'border-gray-200 rounded-xl'
                                    }`}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-xs font-black text-white ${
                                        isOrgMode ? 'bg-[#818CF8] border-2 border-gray-900 rounded-xl shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-gray-900 rounded-xl'
                                    }`}
                                >
                                    Add Note
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit modal / block */}
                {editingNote && (
                    <div className={`p-6 bg-white border ${
                        isOrgMode ? 'border-2 border-gray-900 rounded-3xl shadow-[3px_3px_0px_rgba(0,0,0,1)]' : 'border-gray-100 rounded-[2.5rem] shadow-xl'
                    }`}>
                        <div className="flex items-center justify-between border-b pb-3 mb-5">
                            <h3 className="text-lg font-black text-gray-900">Edit Note</h3>
                            <button onClick={() => setEditingNote(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleUpdateNote} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Title</label>
                                <input
                                    type="text"
                                    value={editingNote.title}
                                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                                    className={`w-full px-4 py-2.5 border outline-none text-sm ${
                                        isOrgMode ? 'border-2 border-gray-900 rounded-xl' : 'border-gray-200 rounded-xl'
                                    }`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                                    <select
                                        value={editingNote.category}
                                        onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                                        className={`w-full px-3 py-2.5 border outline-none text-sm bg-white ${
                                            isOrgMode ? 'border-2 border-gray-900 rounded-xl' : 'border-gray-200 rounded-xl'
                                        }`}
                                    >
                                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color Palette</label>
                                    <div className="flex items-center gap-1.5 h-10">
                                        {COLOR_PALETTES.map(palette => (
                                            <button
                                                key={palette.name}
                                                type="button"
                                                onClick={() => setEditingNote({ ...editingNote, color: palette.name })}
                                                className={`w-7 h-7 rounded-full border-2 ${palette.bg} transition-transform flex items-center justify-center ${
                                                    editingNote.color === palette.name ? 'scale-110 border-gray-900' : 'border-transparent'
                                                }`}
                                            >
                                                {editingNote.color === palette.name && <Check className="w-3.5 h-3.5 text-gray-900" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1 flex items-center h-full pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingNote.isPinned}
                                            onChange={(e) => setEditingNote({ ...editingNote, isPinned: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-black uppercase text-gray-700 tracking-wider">Pin this note</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Note Content</label>
                                <textarea
                                    rows={4}
                                    value={editingNote.content}
                                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                    className={`w-full px-4 py-3 border outline-none text-sm resize-none ${
                                        isOrgMode ? 'border-2 border-gray-900 rounded-xl' : 'border-gray-200 rounded-xl'
                                    }`}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEditingNote(null)}
                                    className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-xs font-black text-white ${
                                        isOrgMode ? 'bg-[#818CF8] border-2 border-gray-900 rounded-xl shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-gray-900 rounded-xl'
                                    }`}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Pinned Notes Section */}
                {pinnedNotes.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Pin className="w-4 h-4 text-amber-500 fill-amber-500 rotate-45" /> Pinned Notes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pinnedNotes.map(note => {
                                const palette = COLOR_PALETTES.find(p => p.name === note.color) || COLOR_PALETTES[0];
                                return (
                                    <div
                                        key={note.id}
                                        className={`p-6 transition-all relative flex flex-col justify-between min-h-[200px] border-2 ${
                                            isOrgMode 
                                                ? 'border-gray-900 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white'
                                                : `${palette.bg} rounded-[2rem] shadow-sm hover:shadow-md`
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${
                                                    isOrgMode ? 'bg-[#F3E8FF] border-gray-900 text-purple-950 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-white/60 text-gray-700 border-transparent'
                                                }`}>
                                                    {note.category}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleTogglePin(note.id)} className="p-1 hover:bg-black/5 rounded" title="Unpin">
                                                        <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600 rotate-45" />
                                                    </button>
                                                    <button onClick={() => setEditingNote(note)} className="p-1 hover:bg-black/5 rounded" title="Edit">
                                                        <Edit2 className="w-3.5 h-3.5 text-gray-700" />
                                                    </button>
                                                    <button onClick={() => handleDeleteNote(note.id)} className="p-1 hover:bg-black/5 rounded hover:text-red-600" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5 text-gray-700 hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-base font-black text-gray-950 mb-2 leading-snug">{note.title}</h3>
                                            <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap mb-4">{note.content}</p>
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-bold border-t pt-2 border-gray-900/10 flex items-center justify-between">
                                            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                                            <StickyNote className="w-3 h-3 text-gray-300" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Regular Notes Section */}
                <div className="space-y-4">
                    {pinnedNotes.length > 0 && (
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 pt-4">
                            <Folder className="w-4 h-4" /> Other Notes
                        </h2>
                    )}
                    
                    {otherNotes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherNotes.map(note => {
                                const palette = COLOR_PALETTES.find(p => p.name === note.color) || COLOR_PALETTES[0];
                                return (
                                    <div
                                        key={note.id}
                                        className={`p-6 transition-all relative flex flex-col justify-between min-h-[200px] border-2 ${
                                            isOrgMode 
                                                ? 'border-gray-900 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white'
                                                : `${palette.bg} rounded-[2rem] shadow-sm hover:shadow-md`
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${
                                                    isOrgMode ? 'bg-[#E0F2FE] border-gray-900 text-blue-950 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-white/60 text-gray-700 border-transparent'
                                                }`}>
                                                    {note.category}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleTogglePin(note.id)} className="p-1 hover:bg-black/5 rounded" title="Pin note">
                                                        <Pin className="w-3.5 h-3.5 text-gray-400 hover:text-amber-500" />
                                                    </button>
                                                    <button onClick={() => setEditingNote(note)} className="p-1 hover:bg-black/5 rounded" title="Edit">
                                                        <Edit2 className="w-3.5 h-3.5 text-gray-700" />
                                                    </button>
                                                    <button onClick={() => handleDeleteNote(note.id)} className="p-1 hover:bg-black/5 rounded hover:text-red-600" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5 text-gray-700 hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-base font-black text-gray-950 mb-2 leading-snug">{note.title}</h3>
                                            <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap mb-4">{note.content}</p>
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-bold border-t pt-2 border-gray-900/10 flex items-center justify-between">
                                            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                                            <StickyNote className="w-3 h-3 text-gray-300" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : pinnedNotes.length === 0 ? (
                        <div className={`p-12 text-center border-2 border-dashed ${
                            isOrgMode ? 'border-gray-900 rounded-3xl bg-white' : 'border-gray-200 rounded-[2.5rem] bg-gray-50'
                        }`}>
                            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-black text-gray-900">No notes found</h3>
                            <p className="text-xs text-gray-400 mt-1">Add your very first note to clear the workspace.</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className={`mt-4 px-4 py-2.5 text-xs font-black text-white ${
                                    isOrgMode ? 'bg-[#818CF8] border-2 border-gray-900 rounded-xl shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]' : 'bg-gray-900 rounded-xl'
                                }`}
                            >
                                Get Started
                            </button>
                        </div>
                    ) : null}
                </div>

            </div>
        </DashboardLayout>
    );
}

export default NotesPage;
