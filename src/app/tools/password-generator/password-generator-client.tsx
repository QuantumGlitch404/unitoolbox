
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Save, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const PasswordGeneratorClient = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState<string[]>([]);
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [pronounceable, setPronounceable] = useState(false);
  const [numToGenerate, setNumToGenerate] = useState(1);
  const [strength, setStrength] = useState(0);
  const [pattern, setPattern] = useState(''); // e.g., LLLNNs (L=letter, N=number, s=symbol)

  const generatePassword = () => {
    let charset = "";
    let uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excluded I, O
    let lowercaseChars = "abcdefghijkmnopqrstuvwxyz"; // Excluded l
    let numberChars = "23456789"; // Excluded 1, 0
    let symbolChars = "!@#$%^&*()_+-=[]{};':\",./<>?";

    if (includeUppercase) charset += excludeSimilar ? uppercaseChars : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += excludeSimilar ? lowercaseChars : "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += excludeSimilar ? numberChars : "0123456789";
    if (includeSymbols) charset += symbolChars;

    if (!charset) {
      toast({ title: "Error", description: "Please select at least one character set.", variant: "destructive" });
      setPassword('');
      setPasswords([]);
      setStrength(0);
      return;
    }
    
    const newPasswords = [];
    for (let j = 0; j < numToGenerate; j++) {
        let newPassword = "";
        if (pronounceable) { // Very basic pronounceable logic
            const vowels = "aeiou";
            const consonants = "bcdfghjklmnpqrstvwxyz";
            for (let i = 0; i < length; i++) {
                if (i % 2 === 0) { // consonant
                    newPassword += consonants.charAt(Math.floor(Math.random() * consonants.length));
                } else { // vowel
                    newPassword += vowels.charAt(Math.floor(Math.random() * vowels.length));
                }
            }
        } else {
            for (let i = 0; i < length; i++) {
              newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
            }
        }
        newPasswords.push(newPassword);
    }
    
    setPasswords(newPasswords);
    setPassword(newPasswords[0] || '');
    calculateStrength(newPasswords[0] || '');
  };

  const calculateStrength = (pwd: string) => {
    let s = 0;
    if (!pwd) { setStrength(0); return; }
    if (pwd.length >= 8) s += 25;
    if (pwd.length >= 12) s += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 10;
    setStrength(Math.min(100, s));
  };

  const handleCopy = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Copied!", description: "Password copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy password.", variant: "destructive" }));
  };
  
  useEffect(generatePassword, []); // Generate on initial load

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Options</CardTitle>
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
            <Label htmlFor="numToGenerate">Number to Generate:</Label>
            <Input id="numToGenerate" type="number" value={numToGenerate} onChange={(e) => setNumToGenerate(Math.max(1, parseInt(e.target.value)))} min="1" max="10" className="w-24"/>
          </div>
          <div>
            <Label htmlFor="pattern">Password Pattern (Conceptual)</Label>
            <Input id="pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="e.g. LLLNNs (L=Letter, N=Number, s=Symbol)" disabled/>
             <p className="text-xs text-muted-foreground">User-defined patterns are a conceptual feature.</p>
          </div>
          <Button onClick={generatePassword} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Generate Password(s)
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
                <Input type="text" value={pwd} readOnly className="flex-grow font-mono" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(pwd)} aria-label="Copy password">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {password && (
              <div className="space-y-1">
                <Label>Strength:</Label>
                <Progress value={strength} className={strength < 30 ? 'bg-red-500' : strength < 70 ? 'bg-yellow-500' : 'bg-green-500'} />
                <p className="text-xs text-muted-foreground">
                  {strength < 30 ? 'Weak' : strength < 70 ? 'Medium' : 'Strong'}
                  {excludeSimilar ? ' (Clarity Enhanced)' : ''}
                  {pronounceable ? ' (Pronounceable)' : ''}
                </p>
              </div>
            )}
             <Button variant="ghost" size="sm" disabled>
                <Save className="mr-2 h-4 w-4" /> Save Passwords Locally (Conceptual)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { PasswordGeneratorClient };
