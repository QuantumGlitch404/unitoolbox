
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Copy, ShieldAlert, Lightbulb } from 'lucide-react';

const PasswordStrengthCheckerClient = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('Enter a password');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [batchPasswords, setBatchPasswords] = useState('');
  const [batchResults, setBatchResults] = useState<string[]>([]);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthText('Enter a password');
      setSuggestions([]);
      return;
    }

    let score = 0;
    const newSuggestions: string[] = [];

    // Length
    if (password.length >= 8) score += 25; else newSuggestions.push("Make it at least 8 characters long.");
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 10; else newSuggestions.push("Include lowercase letters.");
    if (/[A-Z]/.test(password)) score += 10; else newSuggestions.push("Include uppercase letters.");
    if (/[0-9]/.test(password)) score += 10; else newSuggestions.push("Include numbers.");
    if (/[^A-Za-z0-9]/.test(password)) score += 20; else newSuggestions.push("Include symbols (e.g., !@#$).");
    
    // Deductions for common patterns (basic)
    if (/(.)\1\1/.test(password)) { // Repeated characters like 'aaa'
        score -= 10;
        newSuggestions.push("Avoid easily guessed repeated characters (e.g., 'aaa', '111').");
    }
    if (/123|abc|password|qwerty/i.test(password)) { // Very common sequences/words
        score -= 15;
        newSuggestions.push("Avoid common words or keyboard patterns like 'password' or '123'.");
    }

    score = Math.max(0, Math.min(100, score));
    setStrength(score);
    setSuggestions(newSuggestions);

    if (score < 35) setStrengthText('Weak');
    else if (score < 70) setStrengthText('Medium');
    else setStrengthText('Strong');

  }, [password]);
  
  const handleBatchCheck = () => {
    const passwordsToCheck = batchPasswords.split('\n').filter(p => p.trim() !== '');
    if (passwordsToCheck.length === 0) {
        toast({title: "No Passwords", description: "Enter passwords in the batch area.", variant: "destructive"});
        setBatchResults([]);
        return;
    }
    // This is a placeholder for actual batch checking logic
    setBatchResults(passwordsToCheck.map(p => `${p}: Strength calculation placeholder`));
    toast({title: "Batch Check (Conceptual)", description: "Showing conceptual results."});
  };

  const handleCopySummary = () => {
    const summary = `Password: ${password}\nStrength: ${strengthText}\nSuggestions: ${suggestions.join(', ')}`;
    navigator.clipboard.writeText(summary)
      .then(() => toast({ title: "Copied!", description: "Strength summary copied." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy.", variant: "destructive" }));
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text" // Use text to see password, or type="password"
            placeholder="Type your password here"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password to check"
          />
          <div>
            <Label>Password Strength: {strengthText}</Label>
            <Progress 
              value={strength} 
              className={strength < 35 ? '[&>div]:bg-red-500' : strength < 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'} 
            />
          </div>
          {suggestions.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-md space-y-1">
              <h4 className="font-medium text-sm flex items-center"><Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />Suggestions:</h4>
              <ul className="list-disc list-inside text-xs text-muted-foreground">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
           <p className="text-xs text-muted-foreground">Estimated time to crack: (Conceptual Feature)</p>
           <Button onClick={handleCopySummary} variant="outline" size="sm" disabled={!password}>
            <Copy className="mr-2 h-4 w-4" /> Copy Summary
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Batch Password Checker (Conceptual)</CardTitle>
            <CardDescription>Paste multiple passwords, one per line.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea 
                placeholder="password123&#10;AnotherOne!&#10;WeakPWD" 
                value={batchPasswords} 
                onChange={(e) => setBatchPasswords(e.target.value)}
                className="min-h-[100px]"
                aria-label="Batch passwords input"
            />
            <Button onClick={handleBatchCheck} disabled>Check Batch (Conceptual)</Button>
            {batchResults.length > 0 && (
                <div>
                    <h4 className="font-medium text-sm mb-2">Batch Results:</h4>
                    <pre className="text-xs p-2 bg-muted rounded-md max-h-40 overflow-auto">
                        {batchResults.join('\n')}
                    </pre>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export { PasswordStrengthCheckerClient };

