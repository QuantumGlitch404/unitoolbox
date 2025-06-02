
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Copy, ShieldAlert, Lightbulb, Clock, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const commonPasswords = [
  "123456", "password", "123456789", "12345678", "12345", "111111", "1234567", "sunshine",
  "qwerty", "iloveyou", "admin", "user", "test", "guest", "123", "abc", "p@$$w0rd"
];

const PasswordStrengthCheckerClient = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('Enter a password');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [crackTimeEstimate, setCrackTimeEstimate] = useState<string>('');
  const [batchPasswords, setBatchPasswords] = useState('');
  const [batchResults, setBatchResults] = useState<Array<{ password: string; strengthText: string; score: number; suggestions: string[] }>>([]);

  const calculateStrengthDetails = useCallback((pwd: string): { score: number; text: string; suggestions: string[]; crackTime: string } => {
    if (!pwd) return { score: 0, text: 'Enter a password', suggestions: [], crackTime: '' };

    let score = 0;
    const newSuggestions: string[] = [];
    let charsetSize = 0;

    // Length
    if (pwd.length >= 8) score += 25; else newSuggestions.push("Use at least 8 characters.");
    if (pwd.length >= 12) score += 15;
    if (pwd.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(pwd)) { score += 10; charsetSize += 26; } else newSuggestions.push("Include lowercase letters (a-z).");
    if (/[A-Z]/.test(pwd)) { score += 10; charsetSize += 26; } else newSuggestions.push("Include uppercase letters (A-Z).");
    if (/[0-9]/.test(pwd)) { score += 10; charsetSize += 10; } else newSuggestions.push("Include numbers (0-9).");
    if (/[^A-Za-z0-9\s]/.test(pwd)) { score += 20; charsetSize += 32; } else newSuggestions.push("Include symbols (e.g., !@#$).");
    
    // Deductions for common patterns
    if (/(.)\1\1/.test(pwd)) { // Repeated characters like 'aaa'
        score = Math.max(0, score - 10);
        newSuggestions.push("Avoid 3+ repeated characters (e.g., 'aaa', '111').");
    }
    const commonKeyboardPatterns = [/qwerty/i, /asdfgh/i, /zxcvbn/i, /12345/i, /abcde/i];
    commonKeyboardPatterns.forEach(pattern => {
      if (pattern.test(pwd)) {
        score = Math.max(0, score - 10);
        newSuggestions.push(`Avoid common keyboard patterns like '${pattern.source}'.`);
      }
    });

    // Common password check
    if (commonPasswords.includes(pwd.toLowerCase())) {
      score = Math.max(0, score - 30);
      newSuggestions.push("This is a very common and weak password.");
    }

    score = Math.max(0, Math.min(100, score));
    
    let text = 'Very Weak';
    if (score >= 80) text = 'Very Strong';
    else if (score >= 60) text = 'Strong';
    else if (score >= 40) text = 'Medium';
    else if (score >= 20) text = 'Weak';

    // Crack time estimation (simplified)
    let crackTimeStr = '';
    if (charsetSize > 0 && pwd.length > 0) {
      const guessesPerSecond = 1e9; // Assume 1 billion guesses/sec for a strong offline attack
      const combinations = Math.pow(charsetSize, pwd.length);
      const secondsToCrack = combinations / guessesPerSecond;

      if (secondsToCrack < 1) crackTimeStr = "Instantly";
      else if (secondsToCrack < 60) crackTimeStr = `${Math.round(secondsToCrack)} seconds`;
      else if (secondsToCrack < 3600) crackTimeStr = `${Math.round(secondsToCrack / 60)} minutes`;
      else if (secondsToCrack < 86400) crackTimeStr = `${Math.round(secondsToCrack / 3600)} hours`;
      else if (secondsToCrack < 31536000) crackTimeStr = `${Math.round(secondsToCrack / 86400)} days`;
      else if (secondsToCrack < 31536000 * 100) crackTimeStr = `${Math.round(secondsToCrack / 31536000)} years`;
      else crackTimeStr = "Centuries+";
    } else {
      crackTimeStr = "N/A (too short or simple)";
    }
    
    return { score, text, suggestions: newSuggestions, crackTime: crackTimeStr };
  }, []);


  useEffect(() => {
    const { score, text, suggestions: newSuggestions, crackTime } = calculateStrengthDetails(password);
    setStrength(score);
    setStrengthText(text);
    setSuggestions(newSuggestions);
    setCrackTimeEstimate(crackTime);
  }, [password, calculateStrengthDetails]);
  
  const handleBatchCheck = () => {
    const passwordsToCheck = batchPasswords.split('\n').map(p => p.trim()).filter(p => p !== '');
    if (passwordsToCheck.length === 0) {
        toast({title: "No Passwords", description: "Enter passwords in the batch area, one per line.", variant: "destructive"});
        setBatchResults([]);
        return;
    }
    const results = passwordsToCheck.map(pwd => {
      const { score, text, suggestions: sugg } = calculateStrengthDetails(pwd);
      return { password: pwd, strengthText: text, score, suggestions: sugg };
    });
    setBatchResults(results);
    toast({title: "Batch Check Complete", description: `${results.length} passwords analyzed.`});
  };

  const handleCopySummary = () => {
    const summary = `Password: ${password}\nStrength: ${strengthText} (${strength}%)\nEstimated Crack Time: ${crackTimeEstimate}\nSuggestions: ${suggestions.join('; ') || 'None'}`;
    navigator.clipboard.writeText(summary)
      .then(() => toast({ title: "Copied!", description: "Strength summary copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy summary.", variant: "destructive" }));
  };
  
  const getStrengthColor = (score: number) => {
    if (score >= 80) return '[&>div]:bg-green-500'; // Very Strong
    if (score >= 60) return '[&>div]:bg-lime-500';  // Strong
    if (score >= 40) return '[&>div]:bg-yellow-500';// Medium
    if (score >= 20) return '[&>div]:bg-orange-500';// Weak
    return '[&>div]:bg-red-500';                   // Very Weak
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Input & Analysis</CardTitle>
          <CardDescription>Type your password to see its strength analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text" 
            placeholder="Type your password here"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password to check"
            className="text-lg font-mono"
          />
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-sm">Strength: <Badge variant={strength < 20 ? "destructive" : strength < 60 ? "secondary" : "default"} className="ml-1">{strengthText}</Badge></Label>
              <span className="text-xs text-muted-foreground">{strength}%</span>
            </div>
            <Progress 
              value={strength} 
              className={`h-2.5 ${getStrengthColor(strength)}`}
              aria-label={`Password strength: ${strengthText}, ${strength}%`}
            />
          </div>
          {crackTimeEstimate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              Estimated time to crack (rough estimate): <strong className="ml-1">{crackTimeEstimate}</strong>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="p-3 bg-muted/30 rounded-md space-y-1 border border-muted-foreground/20">
              <h4 className="font-medium text-sm flex items-center"><Lightbulb className="mr-2 h-4 w-4 text-yellow-400" />Suggestions:</h4>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
           <Button onClick={handleCopySummary} variant="outline" size="sm" disabled={!password}>
            <Copy className="mr-2 h-4 w-4" /> Copy Summary
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Batch Password Checker</CardTitle>
            <CardDescription>Paste multiple passwords, one per line, to check their strength.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea 
                placeholder="password123&#10;MySuP3rStr0ngP@$$wOrd!&#10;WeakPWD" 
                value={batchPasswords} 
                onChange={(e) => setBatchPasswords(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                aria-label="Batch passwords input area"
            />
            <Button onClick={handleBatchCheck}><ListFilter className="mr-2 h-4 w-4" /> Check Batch</Button>
            {batchResults.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-sm mb-1">Batch Results:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-3 bg-background/50">
                      {batchResults.map((res, i) => (
                          <div key={i} className="p-2 border-b last:border-b-0">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-xs truncate pr-2" title={res.password}>{res.password}</span>
                                <Badge variant={res.score < 20 ? "destructive" : res.score < 60 ? "secondary" : "default"} className="text-xs">{res.strengthText}</Badge>
                              </div>
                              {res.suggestions.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 pl-1">
                                  {res.suggestions.slice(0,2).map((sugg, si) => <li key={si}>{sugg}</li>)}
                                  {res.suggestions.length > 2 && <li className="italic">...and more.</li>}
                                </ul>
                              )}
                          </div>
                      ))}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export { PasswordStrengthCheckerClient };

    