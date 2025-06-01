
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Percent, Divide, X, Minus, Plus, Sigma, Equal, Clock, Thermometer, Ruler, Weight, Banknote, Scale, Trash2 } from 'lucide-react';
import { evaluate, format } from 'mathjs'; // Using mathjs for safer eval and complex functions
import { jsPDF } from 'jspdf';

// --- Unit Converter Logic (adapted from UnitConverterClient) ---
const unitCategories = {
  Length: { Meter: 1, Kilometer: 1000, Foot: 0.3048, Inch: 0.0254 },
  Weight: { Kilogram: 1, Gram: 0.001, Pound: 0.453592 },
  Temperature: { Celsius: 'celsius', Fahrenheit: 'fahrenheit', Kelvin: 'kelvin' },
  Currency: { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.3 }, // Placeholder rates
};
type UnitCategory = keyof typeof unitCategories;


// --- Calculator Logic ---
const CalculatorButton = ({ children, onClick, className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    variant="outline"
    className={`text-xl h-14 sm:h-16 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </Button>
);

export function AdvancedCalculatorClient() {
  const { toast } = useToast();
  
  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [currentExpression, setCurrentExpression] = useState("");
  const [isCalcError, setIsCalcError] = useState(false);

  // Unit Converter State
  const [ucCategory, setUcCategory] = useState<UnitCategory>('Length');
  const [ucInputValue, setUcInputValue] = useState<string>("1");
  const [ucFromUnit, setUcFromUnit] = useState<string>("Meter");
  const [ucToUnit, setUcToUnit] = useState<string>("Kilometer");
  const [ucResult, setUcResult] = useState<string | null>(null);
  
  const ucUnitsForCategory = useMemo(() => {
    return ucCategory ? Object.keys(unitCategories[ucCategory]) : [];
  }, [ucCategory]);

  useEffect(() => {
    if (ucCategory) {
      const defaultUnits = Object.keys(unitCategories[ucCategory]);
      setUcFromUnit(defaultUnits[0] || "");
      setUcToUnit(defaultUnits[1] || defaultUnits[0] || "");
    }
  }, [ucCategory]);

  useEffect(() => {
    handleUnitConversion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ucInputValue, ucFromUnit, ucToUnit, ucCategory]);

  // --- Calculator Handlers ---
  const handleCalcInput = (value: string) => {
    if (isCalcError) {
        setCalcDisplay(value);
        setCurrentExpression(value);
        setIsCalcError(false);
        return;
    }
    if (calcDisplay === "0" && value !== ".") {
      setCalcDisplay(value);
      setCurrentExpression(value);
    } else {
      setCalcDisplay(prev => prev + value);
      setCurrentExpression(prev => prev + value);
    }
  };

  const handleCalcOperator = (operator: string) => {
    if(isCalcError) return;
    // Prevent multiple operators, except for leading minus
    const lastChar = currentExpression.slice(-1);
    const operators = ['+', '-', '*', '/'];
    if (operators.includes(lastChar) && operators.includes(operator)) {
      // Replace last operator if it's not a leading minus
      if (currentExpression.length > 1 || operator === '-') {
         setCurrentExpression(prev => prev.slice(0, -1) + operator);
         setCalcDisplay(prev => prev.slice(0, -1) + operator);
         return;
      }
    }
    setCurrentExpression(prev => prev + operator);
    setCalcDisplay(prev => prev + operator);
  };
  
  const handleCalcFunction = (fn: string) => {
    if(isCalcError) return;
    let newExpression = currentExpression;
    let newDisplay = calcDisplay;
    
    try {
        if (fn === 'sqrt') { newExpression = `sqrt(${currentExpression})`; newDisplay = `sqrt(${calcDisplay})`; }
        else if (fn === 'sq') { newExpression = `(${currentExpression})^2`; newDisplay = `(${calcDisplay})^2`; }
        // Add other functions like sin, cos, log using mathjs if needed, for now simple ones
        // Example: else if (fn === 'sin') { newExpression = `sin(${currentExpression})`; }
        
        const result = evaluate(newExpression);
        setCalcDisplay(format(result, { precision: 10 }));
        setCurrentExpression(format(result, { precision: 10 }));
        addToCalcHistory(`${newDisplay} = ${format(result, { precision: 10 })}`);
    } catch (error) {
        setCalcDisplay("Error");
        setCurrentExpression("");
        setIsCalcError(true);
    }
  };


  const handleCalculate = () => {
    if (isCalcError || currentExpression.trim() === "") return;
    try {
      const result = evaluate(currentExpression);
      const resultString = format(result, { precision: 10 }); // Use mathjs format for precision
      setCalcDisplay(resultString);
      addToCalcHistory(`${currentExpression} = ${resultString}`);
      setCurrentExpression(resultString); // Store result for further calculation
    } catch (error) {
      setCalcDisplay("Error");
      setCurrentExpression("");
      setIsCalcError(true);
      addToCalcHistory(`${currentExpression} = Error`);
    }
  };

  const handleCalcClear = (all: boolean = false) => {
    setCalcDisplay("0");
    setCurrentExpression("");
    setIsCalcError(false);
    if (all) {
      setCalcHistory([]);
    }
  };
  
  const handleCalcBackspace = () => {
    if(isCalcError) { handleCalcClear(); return; }
    if (calcDisplay.length === 1 && calcDisplay !== "0") {
        setCalcDisplay("0");
        setCurrentExpression("");
    } else if (calcDisplay !== "0") {
        setCalcDisplay(prev => prev.slice(0, -1));
        setCurrentExpression(prev => prev.slice(0, -1));
    }
  };

  const addToCalcHistory = (entry: string) => {
    setCalcHistory(prev => [entry, ...prev.slice(0, 9)]); // Keep last 10 entries
  };

  // --- Unit Converter Handlers ---
  const handleUnitConversion = () => {
    const val = parseFloat(ucInputValue);
    if (isNaN(val) || !ucFromUnit || !ucToUnit || !ucCategory) {
      setUcResult(null);
      return;
    }

    let outputValue: number;
    const categoryUnits = unitCategories[ucCategory];

    if (ucCategory === 'Temperature') {
      if (ucFromUnit === 'Celsius') {
        if (ucToUnit === 'Fahrenheit') outputValue = (val * 9/5) + 32;
        else if (ucToUnit === 'Kelvin') outputValue = val + 273.15;
        else outputValue = val;
      } else if (ucFromUnit === 'Fahrenheit') {
        if (ucToUnit === 'Celsius') outputValue = (val - 32) * 5/9;
        else if (ucToUnit === 'Kelvin') outputValue = (val - 32) * 5/9 + 273.15;
        else outputValue = val;
      } else { // Kelvin
        if (ucToUnit === 'Celsius') outputValue = val - 273.15;
        else if (ucToUnit === 'Fahrenheit') outputValue = (val - 273.15) * 9/5 + 32;
        else outputValue = val;
      }
    } else {
      const fromFactor = (categoryUnits as Record<string, number>)[ucFromUnit];
      const toFactor = (categoryUnits as Record<string, number>)[ucToUnit];
      outputValue = (val * fromFactor) / toFactor;
    }
    setUcResult(format(outputValue, { precision: 6 }));
  };
  
  // --- EMI Calculator ---
  const [emiPrincipal, setEmiPrincipal] = useState("");
  const [emiRate, setEmiRate] = useState(""); // Annual rate
  const [emiTenure, setEmiTenure] = useState(""); // In months
  const [emiResult, setEmiResult] = useState<string | null>(null);

  const calculateEMI = () => {
    const P = parseFloat(emiPrincipal);
    const annualRate = parseFloat(emiRate);
    const N = parseInt(emiTenure);

    if (isNaN(P) || isNaN(annualRate) || isNaN(N) || P <= 0 || annualRate <= 0 || N <= 0) {
      setEmiResult("Invalid inputs for EMI calculation.");
      return;
    }
    const R = (annualRate / 12) / 100; // Monthly interest rate
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmiResult(`Monthly EMI: ${format(emi, { precision: 2, notation: 'fixed' })}`);
  };

  // --- GST Calculator ---
  const [gstAmount, setGstAmount] = useState("");
  const [gstRate, setGstRate] = useState("18"); // Default 18%
  const [gstResult, setGstResult] = useState<string | null>(null);

  const calculateGST = (action: 'add' | 'remove') => {
    const amount = parseFloat(gstAmount);
    const rate = parseFloat(gstRate);
    if (isNaN(amount) || isNaN(rate) || amount <= 0 || rate < 0) {
      setGstResult("Invalid inputs for GST calculation.");
      return;
    }
    let finalAmount, gstValue;
    if (action === 'add') { // Amount is exclusive of GST
      gstValue = amount * (rate / 100);
      finalAmount = amount + gstValue;
      setGstResult(`GST: ${format(gstValue, {precision:2, notation:'fixed'})}, Total: ${format(finalAmount, {precision:2, notation:'fixed'})}`);
    } else { // Amount is inclusive of GST
      gstValue = amount - (amount / (1 + rate / 100));
      const originalAmount = amount - gstValue;
      setGstResult(`Original: ${format(originalAmount, {precision:2, notation:'fixed'})}, GST: ${format(gstValue, {precision:2, notation:'fixed'})}`);
    }
  };


  const copyToClipboard = (text: string | null) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast({ title: "Copied to clipboard!" }))
        .catch(() => toast({ title: "Failed to copy.", variant: "destructive" }));
    }
  };

  return (
    <Tabs defaultValue="calculator" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calculator">Advanced Calculator</TabsTrigger>
        <TabsTrigger value="unitConverter">Unit Converter</TabsTrigger>
      </TabsList>
      
      {/* Calculator Tab */}
      <TabsContent value="calculator">
        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
            <CardDescription>Perform standard, scientific, percentage, GST, and EMI calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
                type="text" 
                readOnly 
                value={calcDisplay} 
                className="text-3xl h-16 text-right font-mono bg-muted"
                aria-label="Calculator display"
            />
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <CalculatorButton onClick={() => handleCalcFunction('sqrt')} className="bg-secondary">√</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcFunction('sq')} className="bg-secondary">x²</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcOperator('%')} className="bg-secondary"><Percent size={24}/></CalculatorButton>
              <CalculatorButton onClick={() => handleCalcOperator('/')} className="bg-accent text-accent-foreground"><Divide size={24}/></CalculatorButton>
              {/* Row 2 */}
              <CalculatorButton onClick={() => handleCalcInput('7')}>7</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('8')}>8</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('9')}>9</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcOperator('*')} className="bg-accent text-accent-foreground"><X size={24}/></CalculatorButton>
              {/* Row 3 */}
              <CalculatorButton onClick={() => handleCalcInput('4')}>4</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('5')}>5</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('6')}>6</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcOperator('-')} className="bg-accent text-accent-foreground"><Minus size={24}/></CalculatorButton>
              {/* Row 4 */}
              <CalculatorButton onClick={() => handleCalcInput('1')}>1</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('2')}>2</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('3')}>3</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcOperator('+')} className="bg-accent text-accent-foreground"><Plus size={24}/></CalculatorButton>
              {/* Row 5 */}
              <CalculatorButton onClick={() => handleCalcClear()} className="bg-destructive text-destructive-foreground">C</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('0')}>0</CalculatorButton>
              <CalculatorButton onClick={() => handleCalcInput('.')}>.</CalculatorButton>
              <CalculatorButton onClick={handleCalculate} className="bg-primary text-primary-foreground"><Equal size={24}/></CalculatorButton>
            </div>
             <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => handleCalcBackspace()}>Backspace</Button>
                <Button variant="outline" size="sm" onClick={() => handleCalcClear(true)}><Trash2 className="mr-2 h-4 w-4"/>Clear History</Button>
             </div>

            {calcHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">History:</h4>
                <ScrollArea className="h-32 w-full rounded-md border p-2 bg-muted/50">
                  {calcHistory.map((entry, index) => (
                    <div key={index} className="text-sm text-muted-foreground font-mono py-0.5">{entry}</div>
                  ))}
                </ScrollArea>
                <Button variant="link" size="sm" onClick={() => copyToClipboard(calcHistory.join('\n'))} className="mt-1">Copy History</Button>
              </div>
            )}
            
            {/* GST Calculator */}
            <Card className="mt-4">
                <CardHeader><CardTitle className="text-lg">GST Calculator</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input type="number" placeholder="Amount" value={gstAmount} onChange={e => setGstAmount(e.target.value)} />
                        <Input type="number" placeholder="GST Rate (%)" value={gstRate} onChange={e => setGstRate(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => calculateGST('add')} className="flex-1">Add GST</Button>
                        <Button onClick={() => calculateGST('remove')} variant="outline" className="flex-1">Remove GST</Button>
                    </div>
                    {gstResult && <p className="text-sm font-medium bg-green-100 dark:bg-green-900 p-2 rounded-md text-center">{gstResult}</p>}
                </CardContent>
            </Card>

            {/* EMI Calculator */}
            <Card className="mt-4">
                <CardHeader><CardTitle className="text-lg">EMI Calculator</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <Input type="number" placeholder="Principal Amount" value={emiPrincipal} onChange={e => setEmiPrincipal(e.target.value)} />
                    <Input type="number" placeholder="Annual Interest Rate (%)" value={emiRate} onChange={e => setEmiRate(e.target.value)} />
                    <Input type="number" placeholder="Tenure (in Months)" value={emiTenure} onChange={e => setEmiTenure(e.target.value)} />
                    <Button onClick={calculateEMI} className="w-full">Calculate EMI</Button>
                    {emiResult && <p className="text-sm font-medium bg-blue-100 dark:bg-blue-900 p-2 rounded-md text-center">{emiResult}</p>}
                </CardContent>
            </Card>

          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Unit Converter Tab */}
      <TabsContent value="unitConverter">
        <Card>
          <CardHeader>
            <CardTitle>Unit Converter</CardTitle>
            <CardDescription>Convert between various units of measurement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={ucCategory} onValueChange={(v) => setUcCategory(v as UnitCategory)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {Object.keys(unitCategories).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Input 
                type="number" 
                value={ucInputValue} 
                onChange={(e) => setUcInputValue(e.target.value)}
                placeholder="Enter value"
                aria-label="Input value for unit conversion"
              />
              <Select value={ucFromUnit} onValueChange={setUcFromUnit} disabled={!ucCategory}>
                <SelectTrigger><SelectValue placeholder="From unit" /></SelectTrigger>
                <SelectContent>
                  {ucUnitsForCategory.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ucToUnit} onValueChange={setUcToUnit} disabled={!ucCategory}>
                <SelectTrigger><SelectValue placeholder="To unit" /></SelectTrigger>
                <SelectContent>
                  {ucUnitsForCategory.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {ucResult && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-2xl font-semibold text-primary">{ucResult} <span className="text-lg text-muted-foreground">{ucToUnit}</span></p>
                <p className="text-sm text-muted-foreground">
                  {ucInputValue} {ucFromUnit} = {ucResult} {ucToUnit}
                </p>
                <Button variant="link" size="sm" onClick={() => copyToClipboard(ucResult)} className="mt-1 px-0">Copy Result</Button>
                {ucCategory === 'Currency' && (
                  <p className="text-xs text-muted-foreground pt-2">
                      Currency rates are for demonstration and may not be live.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
