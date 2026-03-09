import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { FileText, Folder, UploadCloud, Search, MoreVertical, Download, PlayCircle, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export function OrgMaterialsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [materials] = useState<any[]>([]);

    const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
                        <p className="text-gray-500">Manage and distribute unified materials to your teachers.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                            <Folder className="w-5 h-5" />
                            New Folder
                        </button>
                        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                            <UploadCloud className="w-5 h-5" />
                            Upload File
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search documents or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Quick Folders */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {['Syllabus', 'Presentations', 'Handouts', 'Recordings', 'General'].map(folder => (
                        <div key={folder} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                            <Folder className="w-10 h-10 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            <span className="font-bold text-gray-900 text-sm text-center">{folder}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Documents</h2>
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded By</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredMaterials.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-500">
                                                No documents uploaded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMaterials.map(mat => (
                                            <tr key={mat.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="py-3 px-6">
                                                    <div className="flex items-center gap-4">
                                                        {getIconForType(mat.type)}
                                                        <div>
                                                            <p className="font-bold text-gray-900">{mat.name}</p>
                                                            <p className="text-xs text-gray-500 uppercase">{mat.type}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">{mat.category}</span>
                                                </td>
                                                <td className="py-3 px-6 text-sm text-gray-600 font-medium">{mat.size}</td>
                                                <td className="py-3 px-6 text-sm text-gray-900 font-medium">{mat.uploadedBy}</td>
                                                <td className="py-3 px-6 text-sm text-gray-500 font-medium">{mat.date}</td>
                                                <td className="py-3 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg bg-white shadow-sm border border-gray-200 hover:border-indigo-200" title="Download">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg bg-white shadow-sm border border-gray-200 hover:border-indigo-200" title="Options">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
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

            </div>
        </DashboardLayout>
    );
}

export default OrgMaterialsPage;
