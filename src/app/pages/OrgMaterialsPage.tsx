import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { 
    FileText, Folder, UploadCloud, Search, MoreVertical, 
    Download, PlayCircle, Image as ImageIcon, Plus, Trash2, X, FolderPlus 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { toast } from 'sonner';

export function OrgMaterialsPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();
    
    // Check if user is student vs admin/teacher
    const isOrgStudent = mode === 'organization' && activeOrganization && activeOrganization.role !== 'teacher';
    const isAdmin = !isOrgStudent;

    // Load Folders & Materials from LocalStorage or seed defaults
    const [folders, setFolders] = useState<string[]>(() => {
        const saved = localStorage.getItem('mentozy_org_folders');
        return saved ? JSON.parse(saved) : ['Syllabus', 'Presentations', 'Handouts', 'Recordings', 'General'];
    });

    const [materials, setMaterials] = useState<any[]>(() => {
        const saved = localStorage.getItem('mentozy_org_materials');
        if (saved) return JSON.parse(saved);
        return [
            { id: '1', name: 'React Hooks Cheat Sheet.pdf', category: 'Handouts', type: 'pdf', size: '1.2 MB', uploadedBy: 'Admin', date: '2026-06-05', url: 'https://react.dev' },
            { id: '2', name: 'Intro to Algorithms.ppt', category: 'Presentations', type: 'ppt', size: '4.8 MB', uploadedBy: 'Dr. Aris Thorne', date: '2026-06-07', url: 'https://wikipedia.org' },
            { id: '3', name: 'Week 1 Live Session recording.mp4', category: 'Recordings', type: 'video', size: '45.2 MB', uploadedBy: 'Elena Rodriguez', date: '2026-06-06', url: 'https://youtube.com' }
        ];
    });

    // States for filter and search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

    // Form States
    const [uploadForm, setUploadForm] = useState({
        name: '',
        category: 'General',
        type: 'pdf',
        size: '1.5 MB',
        url: ''
    });
    const [newFolderName, setNewFolderName] = useState('');

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('mentozy_org_materials', JSON.stringify(materials));
    }, [materials]);

    useEffect(() => {
        localStorage.setItem('mentozy_org_folders', JSON.stringify(folders));
    }, [folders]);

    // Handlers
    const handleUploadFile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.name.trim()) {
            toast.error("Please enter a file name");
            return;
        }

        const newMat = {
            id: Date.now().toString(),
            name: uploadForm.name,
            category: uploadForm.category,
            type: uploadForm.type,
            size: uploadForm.size || '1.0 MB',
            uploadedBy: user?.user_metadata?.full_name || 'Admin',
            date: new Date().toISOString().split('T')[0],
            url: uploadForm.url || '#'
        };

        setMaterials([newMat, ...materials]);
        setIsUploadModalOpen(false);
        setUploadForm({
            name: '',
            category: folders[0] || 'General',
            type: 'pdf',
            size: '1.5 MB',
            url: ''
        });
        toast.success("Material uploaded successfully!");
    };

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) {
            toast.error("Please enter a folder name");
            return;
        }
        if (folders.includes(newFolderName.trim())) {
            toast.error("Folder already exists");
            return;
        }

        setFolders([...folders, newFolderName.trim()]);
        setNewFolderName('');
        setIsFolderModalOpen(false);
        toast.success("New folder created!");
    };

    const handleDeleteMaterial = (id: string) => {
        setMaterials(materials.filter(m => m.id !== id));
        toast.success("Material deleted successfully");
    };

    // Filter Logic
    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             m.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFolder = selectedFolder ? m.category === selectedFolder : true;
        return matchesSearch && matchesFolder;
    });

    const getIconForType = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="text-red-500 w-8 h-8" />;
            case 'ppt': return <FileText className="text-orange-500 w-8 h-8" />;
            case 'doc': return <FileText className="text-blue-500 w-8 h-8" />;
            case 'video': return <PlayCircle className="text-purple-500 w-8 h-8" />;
            case 'image': return <ImageIcon className="text-green-500 w-8 h-8" />;
            default: return <FileText className="text-gray-500 w-8 h-8" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-gray-900 pb-6 mb-8">
                    <div>
                        <h1 className="text-[2.5rem] font-black text-gray-900 uppercase tracking-tight leading-none">Study Materials</h1>
                        <p className="text-gray-500 mt-2 font-bold uppercase tracking-wider text-xs">
                            {isAdmin ? 'Manage and distribute unified materials to students.' : 'Access materials shared by your educators.'}
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={() => setIsFolderModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-900 rounded-xl text-sm font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                            >
                                <FolderPlus className="w-5 h-5" />
                                New Folder
                            </button>
                            <button 
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl text-sm font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                            >
                                <UploadCloud className="w-5 h-5" />
                                Share File
                            </button>
                        </div>
                    )}
                </div>

                {/* Folder Ribbon */}
                <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {folders.map(folder => {
                            const isActive = selectedFolder === folder;
                            return (
                                <div 
                                    key={folder} 
                                    onClick={() => setSelectedFolder(isActive ? null : folder)}
                                    className={`p-4 border-2 border-gray-900 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                                        isActive 
                                            ? 'bg-[#E0F2FE] text-blue-950 shadow-inner' 
                                            : 'bg-white hover:bg-gray-50/50 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none'
                                    }`}
                                >
                                    <Folder className={`w-10 h-10 ${isActive ? 'text-blue-650 text-blue-600' : 'text-indigo-400'}`} />
                                    <span className="font-extrabold text-sm text-center">{folder}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white border-2 border-gray-900 p-4 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search documents or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] outline-none font-bold text-gray-900 focus:bg-white"
                        />
                    </div>
                    {selectedFolder && (
                        <button 
                            onClick={() => setSelectedFolder(null)}
                            className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline bg-red-50 px-3 py-1.5 border border-red-200 rounded-lg"
                        >
                            Clear Filter [x]
                        </button>
                    )}
                </div>

                {/* Document Table */}
                <div>
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                        📄 Saved Documents
                    </h2>
                    <div className="bg-white border-2 border-gray-900 rounded-3xl overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF9F6] border-b-2 border-gray-900">
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">File Name</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Category</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Size</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Uploaded By</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Date</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-900">
                                    {filteredMaterials.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-400 font-bold italic">
                                                Nothing to buzz byee 🐝
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMaterials.map(mat => (
                                            <tr key={mat.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        {getIconForType(mat.type)}
                                                        <div>
                                                            <p className="font-extrabold text-gray-905">{mat.name}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{mat.type}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="bg-[#F3E8FF] border border-purple-200 text-purple-950 px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-[1px_1px_0px_rgba(0,0,0,1)]">{mat.category}</span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600 font-bold">{mat.size}</td>
                                                <td className="py-4 px-6 text-sm text-gray-900 font-bold">{mat.uploadedBy}</td>
                                                <td className="py-4 px-6 text-sm text-gray-500 font-bold">{mat.date}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a 
                                                            href={mat.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 text-gray-500 hover:text-indigo-650 transition-colors rounded-lg bg-white border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]" 
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        {isAdmin && (
                                                            <button 
                                                                onClick={() => handleDeleteMaterial(mat.id)}
                                                                className="p-2 text-gray-450 hover:text-red-500 transition-colors rounded-lg bg-white border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]" 
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Upload File Modal */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                        <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-md shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col">
                            <button 
                                onClick={() => setIsUploadModalOpen(false)} 
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                    <UploadCloud className="w-5 h-5 text-[#5763f6]" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase">Share File</h2>
                            </div>

                            <form onSubmit={handleUploadFile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 pl-1">File Name</label>
                                    <input 
                                        type="text"
                                        value={uploadForm.name}
                                        onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                                        placeholder="e.g. Calculus syllabus guide"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 font-bold text-gray-900 bg-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Category</label>
                                        <select 
                                            value={uploadForm.category}
                                            onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none font-bold text-gray-900 bg-white"
                                        >
                                            {folders.map(folder => (
                                                <option key={folder} value={folder}>{folder}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 pl-1">File Type</label>
                                        <select 
                                            value={uploadForm.type}
                                            onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none font-bold text-gray-900 bg-white"
                                        >
                                            <option value="pdf">PDF Document</option>
                                            <option value="ppt">PowerPoint Presentation</option>
                                            <option value="doc">Word Doc</option>
                                            <option value="video">MP4 Video</option>
                                            <option value="image">PNG/JPG Image</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 pl-1">File Size</label>
                                        <input 
                                            type="text"
                                            value={uploadForm.size}
                                            onChange={e => setUploadForm({...uploadForm, size: e.target.value})}
                                            placeholder="e.g. 2.5 MB"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 font-bold text-gray-900 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 pl-1">Download Link</label>
                                        <input 
                                            type="text"
                                            value={uploadForm.url}
                                            onChange={e => setUploadForm({...uploadForm, url: e.target.value})}
                                            placeholder="https://..."
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 font-bold text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full mt-6 py-3.5 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Upload Material
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Folder Modal */}
                {isFolderModalOpen && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                        <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col">
                            <button 
                                onClick={() => setIsFolderModalOpen(false)} 
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase">New Folder</h2>
                            
                            <form onSubmit={handleCreateFolder} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-505 uppercase tracking-wider mb-1.5 pl-1">Folder Name</label>
                                    <input 
                                        type="text"
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        placeholder="e.g. Reference Books"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 font-bold text-gray-900 bg-white mb-4"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-3.5 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Create Folder
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                
            </div>
        </DashboardLayout>
    );
}

export default OrgMaterialsPage;
