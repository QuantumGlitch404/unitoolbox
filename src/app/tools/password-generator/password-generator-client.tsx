
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Save, Shield, Eye, EyeOff, ListChecks } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const LOCAL_STORAGE_KEY_PASSWORDS = "passwordGenerator_lastBatch";

const PasswordGeneratorClient = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState<string[]>([]);
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [pronounceable, setPronounceable] = useState(false);
  const [numToGenerate, setNumToGenerate] = useState(3);
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');
  const [pattern, setPattern] = useState(''); 
  const [showSaved, setShowSaved] = useState(false);
  const [lastSavedBatch, setLastSavedBatch] = useState<string[]>([]);

  const calculatePasswordStrength = useCallback((pwd: string): { score: number; text: string } => {
    if (!pwd) return { score: 0, text: 'Very Weak' };

    let score = 0;
    // Length
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (pwd.length >= 16) score += 10;

    // Character variety
    let varietyCount = 0;
    if (/[a-z]/.test(pwd)) varietyCount++;
    if (/[A-Z]/.test(pwd)) varietyCount++;
    if (/[0-9]/.test(pwd)) varietyCount++;
    if (/[^A-Za-z0-9]/.test(pwd)) varietyCount++;
    
    if (varietyCount >= 2) score += 15;
    if (varietyCount >= 3) score += 15;
    if (varietyCount >= 4) score += 10;
    
    score = Math.min(100, Math.max(0, score));

    let text = 'Very Weak';
    if (score >= 80) text = 'Very Strong';
    else if (score >= 60) text = 'Strong';
    else if (score >= 40) text = 'Medium';
    else if (score >= 20) text = 'Weak';
    
    return { score, text };
  }, []);

  const generateSinglePassword = useCallback((): string => {
    let charset = "";
    const baseUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const baseLowercase = "abcdefghijklmnopqrstuvwxyz";
    const baseNumbers = "0123456789";
    const baseSymbols = "!@#$%^&*()_+-=[]{};':\",./<>?";

    const similarUppercase = "ILOU";
    const similarLowercase = "ilo";
    const similarNumbers = "01";

    const currentUppercase = excludeSimilar ? baseUppercase.split('').filter(c => !similarUppercase.includes(c)).join('') : baseUppercase;
    const currentLowercase = excludeSimilar ? baseLowercase.split('').filter(c => !similarLowercase.includes(c)).join('') : baseLowercase;
    const currentNumbers = excludeSimilar ? baseNumbers.split('').filter(c => !similarNumbers.includes(c)).join('') : baseNumbers;
    // Symbols are generally distinct enough not to need an excludeSimilar version for this basic implementation

    if (pronounceable) {
      const vowels = "aeiou";
      // Use currentLowercase for consonants if available and selected, otherwise fallback
      const consonants = (includeLowercase && currentLowercase.length > 0 ? currentLowercase : baseLowercase)
                           .split('')
                           .filter(c => !vowels.includes(c))
                           .join('');
      
      if (!consonants || !vowels) { // Fallback if sets are empty
          return "Error:CharSet";
      }

      let newPassword = "";
      for (let i = 0; i < length; i++) {
        if (i % 2 === 0) { // consonant
          newPassword += consonants.charAt(Math.floor(Math.random() * consonants.length));
        } else { // vowel
          newPassword += vowels.charAt(Math.floor(Math.random() * vowels.length));
        }
      }
      // Ensure pronounceable passwords match length if includeUppercase is also selected (as it might default to lowercase)
      if (includeUppercase && newPassword.length === length) {
        // Randomly capitalize some letters
        newPassword = newPassword.split('').map(char => Math.random() < 0.3 ? char.toUpperCase() : char).join('');
      }
      return newPassword;
    }

    // Standard generation
    if (includeUppercase && currentUppercase) charset += currentUppercase;
    if (includeLowercase && currentLowercase) charset += currentLowercase;
    if (includeNumbers && currentNumbers) charset += currentNumbers;
    if (includeSymbols && baseSymbols) charset += baseSymbols;

    if (!charset) {
      return "Error:NoSet";
    }
    
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return newPassword;

  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, pronounceable]);

  const handleGeneratePasswords = useCallback(() => {
    const generated: string[] = [];
    let errorOccurred = false;
    for (let i = 0; i < numToGenerate; i++) {
      const pwd = generateSinglePassword();
      if (pwd === "Error:NoSet") {
        toast({ title: "Error", description: "Please select at least one character set.", variant: "destructive" });
        errorOccurred = true;
        break;
      }
      if (pwd === "Error:CharSet") {
        toast({ title: "Error", description: "Cannot generate pronounceable password with current character set options (ensure lowercase is available).", variant: "destructive" });
        errorOccurred = true;
        break;
      }
      generated.push(pwd);
    }

    if (errorOccurred) {
      setPasswords([]);
      setStrength(0);
      setStrengthText('');
    } else {
      setPasswords(generated);
      if (generated.length > 0) {
        const { score, text } = calculatePasswordStrength(generated[0]);
        setStrength(score);
        setStrengthText(text);
        savePasswordsToLocalStorage(generated);
      } else {
        setStrength(0);
        setStrengthText('');
      }
    }
  }, [numToGenerate, generateSinglePassword, toast, calculatePasswordStrength]);
  
  const savePasswordsToLocalStorage = (passwordsToSave: string[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PASSWORDS, JSON.stringify(passwordsToSave));
    } catch (e) {
      console.error("Failed to save passwords to localStorage", e);
      toast({ title: "Save Failed", description: "Could not save passwords to local storage.", variant: "warning" });
    }
  };

  const loadPasswordsFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PASSWORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if(Array.isArray(parsed) && parsed.length > 0) {
            setLastSavedBatch(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load passwords from localStorage", e);
    }
  }, []);

  useEffect(() => {
    handleGeneratePasswords(); // Generate on initial load & when options change
    loadPasswordsFromLocalStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, pronounceable, numToGenerate, loadPasswordsFromLocalStorage]); // handleGeneratePasswords has its own deps

  const handleCopy = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Copied!", description: "Password copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy password.", variant: "destructive" }));
  };
  
  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-lime-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Options</CardTitle>
          <CardDescription>Customize your password generation settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="length">Password Length: {length}</Label>
            <Slider id="length" value={[length]} onValueChange={(val) => setLength(val[0])} min={8} max={64} step={1} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="uppercase" checked={includeUppercase} onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)} />
              <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="lowercase" checked={includeLowercase} onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)} />
              <Label htmlFor="lowercase">Lowercase (a-z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="numbers" checked={includeNumbers} onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)} />
              <Label htmlFor="numbers">Numbers (0-9)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="symbols" checked={includeSymbols} onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)} />
              <Label htmlFor="symbols">Symbols (!@#...)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="excludeSimilar" checked={excludeSimilar} onCheckedChange={(checked) => setExcludeSimilar(checked as boolean)} />
              <Label htmlFor="excludeSimilar">Exclude Similar (I,l,1,O,0)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="pronounceable" checked={pronounceable} onCheckedChange={(checked) => setPronounceable(checked as boolean)} />
              <Label htmlFor="pronounceable">Pronounceable</Label>
            </div>
          </div>
           <div>
            <Label htmlFor="numToGenerate">Number to Generate (1-10):</Label>
            <Input id="numToGenerate" type="number" value={numToGenerate} onChange={(e) => setNumToGenerate(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))} min="1" max="10" className="w-24 mt-1"/>
          </div>
          <div>
            <Label htmlFor="pattern">Password Pattern</Label>
            <Input id="pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="e.g. LLLNNs" />
             <p className="text-xs text-muted-foreground mt-1">Note: Custom pattern parsing (e.g., LLLNNS) is an advanced feature. Current generation relies on character set checkboxes and length.</p>
          </div>
          <Button onClick={handleGeneratePasswords} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Password(s)
          </Button>
        </CardContent>
      </Card>

      {passwords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Password(s)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {passwords.map((pwd, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                <Input type="text" value={pwd} readOnly className="flex-grow font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(pwd)} aria-label="Copy password">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {passwords[0] && (
              <div className="space-y-1 pt-2">
                <Label className="text-sm">Strength (for first password): {strengthText}</Label>
                <Progress value={strength} className={`h-2 ${getStrengthColor(strength)}`} />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => { setShowSaved(!showSaved); if(!showSaved) loadPasswordsFromLocalStorage(); }} className="mt-2">
              {showSaved ? <EyeOff className="mr-2 h-4 w-4"/> : <Eye className="mr-2 h-4 w-4"/>} 
              {showSaved ? "Hide" : "Show"} Last Saved Batch
            </Button>
            {showSaved && lastSavedBatch.length > 0 && (
                <div className="mt-2 p-3 border rounded-md bg-secondary/50">
                    <h4 className="text-sm font-medium mb-2">Last Generated & Saved Batch:</h4>
                    <ul className="space-y-1 list-disc list-inside">
                        {lastSavedBatch.map((savedPwd, idx) => (
                           <li key={`saved-${idx}`} className="text-xs font-mono flex justify-between items-center">
                             <span>{savedPwd}</span>
                             <Button variant="ghost" size="icon" onClick={() => handleCopy(savedPwd)} className="h-6 w-6">
                               <Copy className="h-3 w-3" />
                             </Button>
                           </li>
                        ))}
                    </ul>
                </div>
            )}
             {showSaved && lastSavedBatch.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">No passwords found in local storage for this session.</p>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { PasswordGeneratorClient };

    