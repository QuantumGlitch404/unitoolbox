
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, PlusCircle, Trash2, Search, Save, Upload, Download, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: number;
  isEncrypted?: boolean; // Conceptual
}

const SecureNoteKeeperClient = () => {
  const { toast } = useToast();
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showDecrypted, setShowDecrypted] = useState(true); // Conceptual

  // Load notes and master password status from local storage (conceptual)
  useEffect(() => {
    const storedNotes = localStorage.getItem('secureNotes');
    const storedMasterPasswordSet = localStorage.getItem('masterPasswordSet');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
    if (storedMasterPasswordSet) {
      setIsLocked(true); // Always start locked if password was set
    } else {
      setIsLocked(false); // No master password set yet
    }
  }, []);

  // Save notes to local storage (conceptual)
  useEffect(() => {
    localStorage.setItem('secureNotes', JSON.stringify(notes));
  }, [notes]);

  const handleSetMasterPassword = () => {
    if (tempPassword.length < 8) {
      toast({ title: "Weak Password", description: "Master password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setMasterPassword(tempPassword);
    localStorage.setItem('masterPasswordSet', 'true'); // Indicate password is set
    setIsLocked(false);
    setTempPassword('');
    toast({ title: "Master Password Set", description: "Notes will be conceptually encrypted." });
  };

  const handleUnlock = () => {
    // In a real app, you'd compare tempPassword with a hash of the masterPassword
    if (localStorage.getItem('masterPasswordSet')) { // Simulate unlock if password was ever set
        setMasterPassword(tempPassword); // For this demo, "unlocking" means setting it for the session
        setIsLocked(false);
        setTempPassword('');
        toast({ title: "Unlocked", description: "Notes accessible." });
    } else {
        toast({ title: "Error", description: "No master password set to unlock with.", variant: "destructive" });
    }
  };
  
  const handleLock = () => {
    setIsLocked(true);
    setMasterPassword(null); // Clear session master password
    toast({ title: "Locked", description: "Notes secured."});
  };

  const handleSaveNote = () => {
    if (!currentNote || !currentNote.title || !currentNote.content) {
      toast({ title: "Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    const noteToSave: Note = {
      id: currentNote.id || Date.now().toString(),
      title: currentNote.title,
      content: currentNote.content, // Conceptually, encrypt here
      category: currentNote.category || 'General',
      createdAt: currentNote.createdAt || Date.now(),
      isEncrypted: true, // Mark as conceptually encrypted
    };
    setNotes(prev => {
      const existing = prev.find(n => n.id === noteToSave.id);
      if (existing) {
        return prev.map(n => n.id === noteToSave.id ? noteToSave : n);
      }
      return [noteToSave, ...prev];
    });
    setCurrentNote(null);
    toast({ title: "Note Saved", description: "Conceptually encrypted and stored locally." });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (currentNote?.id === id) setCurrentNote(null);
    toast({ title: "Note Deleted" });
  };
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLocked && localStorage.getItem('masterPasswordSet')) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader><CardTitle>Unlock Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" placeholder="Enter Master Password" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
          <Button onClick={handleUnlock} className="w-full"><Unlock className="mr-2 h-4 w-4" />Unlock</Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!localStorage.getItem('masterPasswordSet')) {
     return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
            <CardTitle>Set Master Password</CardTitle>
            <CardDescription>Create a master password to (conceptually) encrypt your notes. Min 8 characters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" placeholder="Choose Master Password" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
          <Button onClick={handleSetMasterPassword} className="w-full"><Lock className="mr-2 h-4 w-4" />Set & Continue</Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">My Notes</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleLock} title="Lock Notes"><Lock className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setCurrentNote({title: '', content: ''})} className="w-full mb-2"><PlusCircle className="mr-2 h-4 w-4" />New Note</Button>
                <Input type="search" placeholder="Search notes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-2"/>
                 <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {filteredNotes.map(note => (
                    <Button key={note.id} variant="outline" className="w-full justify-start" onClick={() => setCurrentNote({...note})}>
                        {note.title}
                    </Button>
                    ))}
                    {filteredNotes.length === 0 && <p className="text-xs text-muted-foreground text-center">No notes found.</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="text-lg">Actions (Conceptual)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" disabled><Upload className="mr-2 h-4 w-4"/>Import Encrypted Notes</Button>
                <Button variant="outline" className="w-full" disabled><Download className="mr-2 h-4 w-4"/>Export Encrypted Notes</Button>
                <Dialog>
                    <DialogTrigger asChild><Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4"/>Clear All Notes</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
                        <p>Are you sure you want to delete ALL notes? This action is irreversible.</p>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button variant="destructive" onClick={() => {setNotes([]); setCurrentNote(null); toast({title: "All Notes Cleared"}); }}>Delete All</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{currentNote?.id ? 'Edit Note' : 'New Note'}</CardTitle>
            <CardDescription>Notes are conceptually encrypted with AES-256.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
                placeholder="Note Title" 
                value={currentNote?.title || ''} 
                onChange={e => setCurrentNote(prev => ({...prev, title: e.target.value}))} 
            />
            <Textarea 
                placeholder="Your secure note content..." 
                value={currentNote?.content || ''} 
                onChange={e => setCurrentNote(prev => ({...prev, content: e.target.value}))}
                className="min-h-[300px]"
            />
            {currentNote?.id && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Created: {new Date(currentNote.createdAt!).toLocaleDateString()}
                        {currentNote.isEncrypted && " (Conceptually Encrypted)"}
                    </p>
                     <Button variant="ghost" size="sm" onClick={() => setShowDecrypted(!showDecrypted)} disabled>
                        {showDecrypted ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {showDecrypted ? 'Hide' : 'Show'} Content (Conceptual)
                    </Button>
                </div>
            )}
            <div className="flex gap-2">
                <Button onClick={handleSaveNote} disabled={!currentNote?.title || !currentNote?.content}><Save className="mr-2 h-4 w-4" />Save Note</Button>
                {currentNote?.id && <Button variant="destructive" onClick={() => handleDeleteNote(currentNote.id!)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { SecureNoteKeeperClient };
