
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Loader2, ArrowRightLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';

const unitCategories = {
  Length: {
    Meter: 1,
    Kilometer: 1000,
    Centimeter: 0.01,
    Millimeter: 0.001,
    Mile: 1609.34,
    Yard: 0.9144,
    Foot: 0.3048,
    Inch: 0.0254,
  },
  Weight: {
    Kilogram: 1,
    Gram: 0.001,
    Milligram: 0.000001,
    Pound: 0.453592,
    Ounce: 0.0283495,
    Tonne: 1000,
  },
  Time: {
    Second: 1,
    Minute: 60,
    Hour: 3600,
    Day: 86400,
    Week: 604800,
  },
  Temperature: { // Special handling needed for conversion formulas
    Celsius: 'celsius',
    Fahrenheit: 'fahrenheit',
    Kelvin: 'kelvin',
  },
  Area: {
    'Square Meter': 1,
    'Square Kilometer': 1000000,
    'Square Mile': 2589988.11,
    'Square Yard': 0.836127,
    'Square Foot': 0.092903,
    Acre: 4046.86,
    Hectare: 10000,
  },
  Volume: {
    'Cubic Meter': 1,
    Liter: 0.001,
    Milliliter: 0.000001,
    Gallon: 0.00378541, // US Gallon
    Quart: 0.000946353, // US Quart
  },
  Speed: {
    'm/s': 1,
    'km/h': 0.277778,
    mph: 0.44704,
    knot: 0.514444,
  },
  Pressure: { // Base unit: Pascal
    Pascal: 1,
    Bar: 100000,
    PSI: 6894.76,
    Atmosphere: 101325,
  },
  Currency: { // Placeholder, real rates needed
    USD: 1, // Base
    EUR: 0.92, // Example static rate
    GBP: 0.79,
    INR: 83.3,
    JPY: 157,
  }
};

type UnitCategory = keyof typeof unitCategories;

const formSchema = z.object({
  category: z.custom<UnitCategory>(val => Object.keys(unitCategories).includes(val as string), "Invalid category"),
  fromUnit: z.string().min(1, "Please select a unit"),
  toUnit: z.string().min(1, "Please select a unit"),
  inputValue: z.coerce.number({invalid_type_error: "Please enter a valid number"}),
});

type UnitConverterFormData = z.infer<typeof formSchema>;

export function UnitConverterClient() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const { toast } = useToast();

  const form = useForm<UnitConverterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'Length',
      inputValue: 1,
      fromUnit: 'Meter',
      toUnit: 'Kilometer',
    },
  });

  const { watch, setValue, getValues } = form;
  const selectedCategory = watch('category');
  const inputValue = watch('inputValue');
  const fromUnit = watch('fromUnit');
  const toUnit = watch('toUnit');

  const unitsForCategory = useMemo(() => {
    return selectedCategory ? Object.keys(unitCategories[selectedCategory]) : [];
  }, [selectedCategory]);

  const fetchCurrencyRates = useCallback(async (base: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setIsLoading(false);
    return unitCategories.Currency;
  }, [setIsLoading]);

  const convertUnits = useCallback(async () => {
    const currentValues = getValues(); // Get current form values
    const currentInputValue = currentValues.inputValue;
    const currentFromUnit = currentValues.fromUnit;
    const currentToUnit = currentValues.toUnit;
    const currentSelectedCategory = currentValues.category;

    if (isNaN(currentInputValue) || !currentFromUnit || !currentToUnit || !currentSelectedCategory) {
      setResult("Invalid input or units selected.");
      return;
    }

    let outputValue: number;

    if (currentSelectedCategory === 'Temperature') {
      const temp = parseFloat(currentInputValue.toString());
      if (currentFromUnit === 'Celsius') {
        if (currentToUnit === 'Fahrenheit') outputValue = (temp * 9/5) + 32;
        else if (currentToUnit === 'Kelvin') outputValue = temp + 273.15;
        else outputValue = temp; 
      } else if (currentFromUnit === 'Fahrenheit') {
        if (currentToUnit === 'Celsius') outputValue = (temp - 32) * 5/9;
        else if (currentToUnit === 'Kelvin') outputValue = (temp - 32) * 5/9 + 273.15;
        else outputValue = temp; 
      } else if (currentFromUnit === 'Kelvin') {
        if (currentToUnit === 'Celsius') outputValue = temp - 273.15;
        else if (currentToUnit === 'Fahrenheit') outputValue = (temp - 273.15) * 9/5 + 32;
        else outputValue = temp; 
      } else {
        setResult("Invalid temperature units.");
        return;
      }
    } else if (currentSelectedCategory === 'Currency') {
        const rates = await fetchCurrencyRates(currentFromUnit); 
        const fromRate = (rates as any)[currentFromUnit] || 1; 
        const toRate = (rates as any)[currentToUnit] || 1;     
        
        const valueInUSD = currentInputValue / fromRate;
        outputValue = valueInUSD * toRate;

    } else {
      const categoryUnits = unitCategories[currentSelectedCategory] as Record<string, number>;
      if (!(currentFromUnit in categoryUnits) || !(currentToUnit in categoryUnits)) {
        setResult("Selected units are invalid for this category.");
        return;
      }
      const fromFactor = categoryUnits[currentFromUnit];
      const toFactor = categoryUnits[currentToUnit];

      if (typeof fromFactor !== 'number' || typeof toFactor !== 'number') {
          setResult("Unit factors are not numbers. Check configuration.");
          return;
      }
      
      if (toFactor === 0) {
        if (fromFactor === 0 && currentInputValue === 0) {
            outputValue = 0;
        } else if (fromFactor !== 0) {
          setResult("Cannot convert to a unit with a zero base factor.");
          return;
        } else {
            outputValue = 0; 
        }
      } else {
        const valueInBase = currentInputValue * fromFactor;
        outputValue = valueInBase / toFactor;
      }
    }
    
    if (Math.abs(outputValue) < 0.00001 && outputValue !== 0) {
        setResult(outputValue.toExponential(4));
    } else {
        setResult(parseFloat(outputValue.toFixed(6)).toString()); 
    }
  }, [getValues, setResult, setIsLoading, fetchCurrencyRates, toast]); // Removed direct watch dependencies, using getValues

  useEffect(() => {
    if (selectedCategory) {
      const defaultUnits = Object.keys(unitCategories[selectedCategory]);
      if (defaultUnits.length >= 2) {
        setValue('fromUnit', defaultUnits[0]);
        setValue('toUnit', defaultUnits[1]);
      } else if (defaultUnits.length === 1) {
        setValue('fromUnit', defaultUnits[0]);
        setValue('toUnit', defaultUnits[0]);
      }
    }
  }, [selectedCategory, setValue]);
  
  useEffect(() => {
    if (typeof inputValue === 'number' && fromUnit && toUnit && selectedCategory) {
      convertUnits();
    } else {
      setResult(null);
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory, convertUnits, setResult]);


  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result)
        .then(() => toast({ title: "Copied!", description: "Result copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy result.", variant: "destructive" }));
    }
  };

  const handleDownload = (format: 'txt' | 'pdf') => {
    if (!result || typeof inputValue !== 'number' || !fromUnit || !toUnit || !selectedCategory) {
      toast({ title: "Nothing to download", description: "Perform a conversion first.", variant: "destructive" });
      return;
    }
    const content = `${inputValue} ${fromUnit} = ${result} ${toUnit}`;
    let blob: Blob;
    let filename: string;

    if (format === 'txt') {
      blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      filename = 'conversion.txt';
    } else { // PDF
      const pdf = new jsPDF();
      pdf.setFontSize(12);
      pdf.text("Unit Conversion Result", 10, 10);
      pdf.text(`Category: ${selectedCategory}`, 10, 20);
      pdf.text(`Input: ${inputValue} ${fromUnit}`, 10, 30);
      pdf.text(`Output: ${result} ${toUnit}`, 10, 40);
      blob = pdf.output('blob');
      filename = 'conversion.pdf';
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: `Downloading ${filename}.` });
  };


  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.keys(unitCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <FormField
              control={form.control}
              name="inputValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl><Input type="number" placeholder="Enter value" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedCategory}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {unitsForCategory.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedCategory}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {unitsForCategory.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2">Fetching currency rates...</p>
        </div>
      )}

      {result && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Conversion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold text-primary">{result} <span className="text-lg text-muted-foreground">{toUnit}</span></p>
            <p className="text-sm text-muted-foreground">
              {inputValue} {fromUnit} = {result} {toUnit}
            </p>
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleCopyResult} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button onClick={() => handleDownload('txt')} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download TXT
              </Button>
              <Button onClick={() => handleDownload('pdf')} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
             {selectedCategory === 'Currency' && (
                <p className="text-xs text-muted-foreground pt-2">
                    Currency rates are for demonstration and may not be live. A real API integration is needed for up-to-date exchange rates.
                </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    