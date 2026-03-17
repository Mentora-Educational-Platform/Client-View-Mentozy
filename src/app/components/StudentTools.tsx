import { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Notebook, ListChecks, ChevronRight, Plus, Trash2, 
  ExternalLink, X, BookHeart, Image as ImageIcon, Sparkles, 
  MoreHorizontal, Save, Calendar as CalendarIcon, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { getSupabase } from '../../lib/supabase';
import { uploadDocument } from '../../lib/api';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  mood?: string;
  created_at: string;
}

export const StudentTools = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [calcValue, setCalcValue] = useState('');
  const [notes, setNotes] = useState<{ id: string; text: string }[]>(() => {
    const saved = localStorage.getItem('mentozy-student-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');

  // Journal States
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isJournalLoading, setIsJournalLoading] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryImage, setNewEntryImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDiaryInStuff, setShowDiaryInStuff] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('mentozy-student-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (user && isOpen) {
      fetchJournalEntries();
    }
  }, [user, isOpen]);

  const fetchJournalEntries = async () => {
    const supabase = getSupabase();
    if (!supabase || !user) return;

    setIsJournalLoading(true);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journal entries:', error);
    } else {
      setJournalEntries(data || []);
    }
    setIsJournalLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { url, error } = await uploadDocument(file);
    
    if (error) {
      toast.error('Failed to upload image');
    } else if (url) {
      setNewEntryImage(url);
      toast.success('Image added to journal');
    }
    setIsUploading(false);
  };

  const saveJournalEntry = async () => {
    if (!newEntryContent.trim()) return;

    const supabase = getSupabase();
    if (!supabase || !user) {
      toast.error('Please login to save journal entries');
      return;
    }

    setIsJournalLoading(true);
    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: newEntryTitle || 'Untitled Entry',
        content: newEntryContent,
        image_url: newEntryImage,
        mood: 'Neutral'
      });

    if (error) {
      toast.error('Error saving entry: ' + error.message);
    } else {
      toast.success('Journal entry saved!');
      setNewEntryTitle('');
      setNewEntryContent('');
      setNewEntryImage(null);
      setIsAddingEntry(false);
      fetchJournalEntries();
    }
    setIsJournalLoading(false);
  };

  const deleteJournalEntry = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete entry');
    } else {
      setJournalEntries(journalEntries.filter(e => e.id !== id));
      toast.success('Entry removed');
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([{ id: Date.now().toString(), text: newNote }, ...notes]);
      setNewNote('');
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const calculate = () => {
    try {
      const result = eval(calcValue.replace(/[^-+*/0-9.]/g, ''));
      setCalcValue(result.toString());
    } catch (e) {
      setCalcValue('Error');
    }
  };

  const importantLinks = [
    { name: 'My Activity Diary', action: () => setShowDiaryInStuff(true), icon: <BookHeart className="w-4 h-4" /> },
    { name: 'Library Resources', url: '/library', icon: <ExternalLink className="w-4 h-4" /> },
    { name: 'Join Community', url: '#', icon: <ExternalLink className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-0 z-[100] flex flex-row-reverse items-center pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%', scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: '-100%', scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="ml-10 w-80 md:w-96 bg-white/95 backdrop-blur-xl shadow-[10px_0_40px_rgba(0,0,0,0.1)] border-y border-r border-gray-100 rounded-r-[3rem] pointer-events-auto overflow-hidden flex flex-col max-h-[85vh] origin-left"
          >
            <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                  Companion
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 font-bold tracking-widest uppercase">Student Workspace</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <Tabs defaultValue="calculator" className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="w-full justify-start rounded-none border-b bg-gray-50/50 px-4 py-3 gap-1 grid grid-cols-3">
                <TabsTrigger value="calculator" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-2 h-9 border-0">
                  <Calculator className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-[10px] font-bold">Calc</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-2 h-9 border-0">
                  <Notebook className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-[10px] font-bold">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="stuff" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-2 h-9 border-0">
                  <ListChecks className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-[10px] font-bold">Stuff</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-grow overflow-hidden relative p-6">
                <TabsContent value="calculator" className="m-0 h-full flex flex-col">
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-right border border-gray-100 shadow-inner">
                    <input 
                      type="text" 
                      value={calcValue} 
                      readOnly 
                      className="bg-transparent w-full text-3xl font-mono focus:outline-none text-right text-gray-800"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C'].map((btn) => (
                      <Button
                        key={btn}
                        variant={isNaN(Number(btn)) && btn !== '.' ? "secondary" : "outline"}
                        className={`h-14 text-xl font-semibold rounded-2xl transition-all hover:scale-105 active:scale-95 ${btn === '=' ? 'col-span-2 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg shadow-amber-500/20' : ''} ${btn === 'C' ? 'col-span-2 text-red-500' : ''}`}
                        onClick={() => {
                          if (btn === '=') calculate();
                          else if (btn === 'C') setCalcValue('');
                          else setCalcValue(prev => prev + btn);
                        }}
                      >
                        {btn}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="m-0 h-full flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type a note..." 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addNote()}
                      className="rounded-2xl border-gray-200 h-12 bg-gray-50 focus:bg-white transition-colors"
                    />
                    <Button onClick={addNote} size="icon" className="bg-gray-900 hover:bg-gray-800 rounded-2xl h-12 w-12 shrink-0 shadow-lg shadow-gray-900/10">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-grow h-[300px]">
                    <div className="space-y-3 pr-4">
                      {notes.length === 0 ? (
                        <div className="text-center py-20 text-gray-300">
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                            <Notebook className="w-8 h-8 opacity-40" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-widest">Workspace Empty</p>
                        </div>
                      ) : (
                        notes.map((note) => (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={note.id} 
                            className="group p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-start gap-4 hover:bg-amber-50/50 hover:border-amber-200 hover:shadow-sm transition-all"
                          >
                            <p className="text-sm text-gray-600 leading-relaxed pt-0.5">{note.text}</p>
                            <button 
                              onClick={() => deleteNote(note.id)}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all scale-110"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="stuff" className="m-0 h-full">
                  <AnimatePresence mode="wait">
                    {!showDiaryInStuff ? (
                      <motion.div 
                        key="stuff-list"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="p-6 bg-amber-500 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-1">Weekly Goal</h4>
                          <p className="text-lg font-bold leading-tight mb-4">Complete 3 Course Modules</p>
                          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '65%' }}
                              className="bg-white h-full rounded-full" 
                            />
                          </div>
                          <p className="text-[10px] font-bold mt-2 opacity-80">65% OF TARGET ACHIEVED</p>
                        </div>
                        
                        <div className="space-y-3">
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 mb-4">Quick Shortcuts</h4>
                           {importantLinks.map((link: any, i) => (
                             link.url ? (
                               <a 
                                key={i} 
                                href={link.url}
                                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-amber-200 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
                               >
                                 <div className="flex items-center gap-4">
                                   <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-amber-50 transition-colors">
                                     {link.icon}
                                   </div>
                                   <span className="text-sm font-bold text-gray-700">{link.name}</span>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                               </a>
                             ) : (
                               <button 
                                key={i} 
                                onClick={link.action}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-amber-200 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
                               >
                                 <div className="flex items-center gap-4">
                                   <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-amber-50 transition-colors">
                                     {link.icon}
                                   </div>
                                   <span className="text-sm font-bold text-gray-700">{link.name}</span>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                               </button>
                             )
                           ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="diary-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => {
                              setShowDiaryInStuff(false);
                              setIsAddingEntry(false);
                            }} 
                            className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase"
                          >
                            <ChevronRight className="w-3 h-3 rotate-180" />
                            Back to Stuff
                          </button>
                          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{isAddingEntry ? 'New Entry' : 'Activity Diary'}</h4>
                        </div>

                        {!isAddingEntry ? (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Memories</h4>
                              <Button 
                                onClick={() => setIsAddingEntry(true)} 
                                size="sm" 
                                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold uppercase"
                              >
                                New Entry
                              </Button>
                            </div>
                            <ScrollArea className="flex-grow h-[350px]">
                              <div className="space-y-4 pr-4">
                                {isJournalLoading ? (
                                  <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                                  </div>
                                ) : journalEntries.length === 0 ? (
                                  <div className="text-center py-20 text-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                      <Sparkles className="w-8 h-8 opacity-40 shrink-0" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest">No entries yet</p>
                                  </div>
                                ) : (
                                  journalEntries.map((entry) => (
                                    <div key={entry.id} className="group bg-gray-50 rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all relative">
                                      {entry.image_url && (
                                        <div className="w-full h-24 overflow-hidden">
                                          <img src={entry.image_url} alt="" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
                                        </div>
                                      )}
                                      <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                          <h5 className="font-bold text-gray-800 truncate text-sm">{entry.title}</h5>
                                          <button 
                                            onClick={() => deleteJournalEntry(entry.id)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{entry.content}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                          <CalendarIcon className="w-3 h-3" />
                                          {new Date(entry.created_at).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </>
                        ) : (
                          <div className="flex flex-col h-full gap-4">
                            <div className="space-y-3 bg-gray-50 p-4 rounded-[2rem] border border-gray-100">
                              <input 
                                type="text" 
                                placeholder="Entry Title..."
                                value={newEntryTitle}
                                onChange={(e) => setNewEntryTitle(e.target.value)}
                                className="bg-transparent w-full text-lg font-bold focus:outline-none text-gray-800 border-b border-gray-200 pb-2"
                              />
                              
                              <div className="flex items-center gap-2 mb-2">
                                 <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                 />
                                 <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                                  title="Insert Image"
                                 >
                                   {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                 </button>
                                 <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors font-serif font-bold italic">B</button>
                                 <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors font-serif italic">I</button>
                                 <div className="w-px h-4 bg-gray-200 mx-1" />
                                 <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                                   <Sparkles className="w-4 h-4" />
                                 </button>
                              </div>

                              {newEntryImage && (
                                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 group">
                                  <img src={newEntryImage} alt="Uploaded" className="w-full h-full object-cover" />
                                  <button 
                                    onClick={() => setNewEntryImage(null)}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              <textarea 
                                placeholder="What's on your mind today?"
                                value={newEntryContent}
                                onChange={(e) => setNewEntryContent(e.target.value)}
                                className="bg-transparent w-full h-[200px] text-sm focus:outline-none text-gray-600 resize-none leading-relaxed"
                              />
                            </div>

                            <Button 
                              onClick={saveJournalEntry} 
                              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-[1.5rem] h-14 font-bold shadow-xl shadow-gray-200 flex items-center gap-2"
                            >
                              {isJournalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save Memory
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-auto absolute left-0"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group h-28 w-10 flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-500 rounded-r-3xl border-y border-r border-white/20 ${isOpen ? 'bg-amber-500 shadow-amber-500/30' : 'bg-gray-900 shadow-black/20'}`}
        >
          <div className="flex flex-col gap-1.5 items-center">
             <div className="w-1 h-1 bg-white/20 rounded-full" />
             <div className="w-1 h-1 bg-white/40 rounded-full" />
             <div className={`w-1 h-1 rounded-full ${isOpen ? 'bg-white animate-ping' : 'bg-amber-500'}`} />
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.div>

          <div className="flex flex-col gap-1.5 items-center">
             <div className={`w-1 h-1 rounded-full ${isOpen ? 'bg-white' : 'bg-amber-500'}`} />
             <div className="w-1 h-1 bg-white/40 rounded-full" />
             <div className="w-1 h-1 bg-white/20 rounded-full" />
          </div>
          
          {!isOpen && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
               <span className="-rotate-90 text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">TOOLS</span>
            </div>
          )}
        </button>
      </motion.div>
    </div>
  );
};
