
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

  const { watch, setValue, getValues, control } = form;
  const selectedCategory = watch('category');
  const inputValue = watch('inputValue');
  const fromUnit = watch('fromUnit');
  const toUnit = watch('toUnit');

  console.log("RENDER: UnitConverterClient. Watched values:", { selectedCategory, inputValue, fromUnit, toUnit, result });

  const unitsForCategory = useMemo(() => {
    console.log("MEMO: Recalculating unitsForCategory for", selectedCategory);
    return selectedCategory ? Object.keys(unitCategories[selectedCategory]) : [];
  }, [selectedCategory]);

  const fetchCurrencyRates = useCallback(async (base: string) => {
    console.log("CALLBACK: fetchCurrencyRates called with base:", base);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); 
    setIsLoading(false);
    console.log("CALLBACK: fetchCurrencyRates completed.");
    return unitCategories.Currency; 
  }, [setIsLoading]);


  const convertUnits = useCallback(async () => {
    console.log("CALLBACK: convertUnits ENTERED. Watched values from closure:", {
        inputValue, fromUnit, toUnit, selectedCategory
    });
    const currentValuesFromGetValues = getValues();
    console.log("CALLBACK: convertUnits current form values from getValues():", currentValuesFromGetValues);

    // Use values from getValues for calculation to ensure atomicity if needed,
    // though watched values should be up-to-date as they are deps of this useCallback.
    const calcInputValue = currentValuesFromGetValues.inputValue;
    const calcFromUnit = currentValuesFromGetValues.fromUnit;
    const calcToUnit = currentValuesFromGetValues.toUnit;
    const calcSelectedCategory = currentValuesFromGetValues.category;


    if (isNaN(calcInputValue) || !calcFromUnit || !calcToUnit || !calcSelectedCategory) {
      console.warn("CALLBACK: convertUnits - Invalid input or units from getValues(). Bailing out.", { calcInputValue, calcFromUnit, calcToUnit, calcSelectedCategory });
      setResult("Please enter a valid number and select units.");
      return;
    }
    console.log("CALLBACK: convertUnits - Inputs from getValues() validated. Proceeding.", { calcInputValue, calcFromUnit, calcToUnit, calcSelectedCategory });


    let outputValue: number;

    if (calcSelectedCategory === 'Temperature') {
      const temp = parseFloat(calcInputValue.toString());
      if (calcFromUnit === 'Celsius') {
        if (calcToUnit === 'Fahrenheit') outputValue = (temp * 9/5) + 32;
        else if (calcToUnit === 'Kelvin') outputValue = temp + 273.15;
        else outputValue = temp; 
      } else if (calcFromUnit === 'Fahrenheit') {
        if (calcToUnit === 'Celsius') outputValue = (temp - 32) * 5/9;
        else if (calcToUnit === 'Kelvin') outputValue = (temp - 32) * 5/9 + 273.15;
        else outputValue = temp; 
      } else if (calcFromUnit === 'Kelvin') {
        if (calcToUnit === 'Celsius') outputValue = temp - 273.15;
        else if (calcToUnit === 'Fahrenheit') outputValue = (temp - 273.15) * 9/5 + 32;
        else outputValue = temp; 
      } else {
        console.warn("CALLBACK: convertUnits - Invalid temperature units.");
        setResult("Invalid temperature units.");
        return;
      }
    } else if (calcSelectedCategory === 'Currency') {
        console.log("CALLBACK: convertUnits - Handling Currency.");
        const rates = await fetchCurrencyRates(calcFromUnit); 
        const fromRate = (rates as any)[calcFromUnit] || 1;
        const toRate = (rates as any)[calcToUnit] || 1;
        const valueInUSD = calcInputValue / fromRate;
        outputValue = valueInUSD * toRate;
    } else {
      const categoryUnits = unitCategories[calcSelectedCategory] as Record<string, number>;
      if (!(calcFromUnit in categoryUnits) || !(calcToUnit in categoryUnits)) {
        console.warn("CALLBACK: convertUnits - Selected units invalid for category.");
        setResult("Selected units are invalid for this category.");
        return;
      }
      const fromFactor = categoryUnits[calcFromUnit];
      const toFactor = categoryUnits[calcToUnit];

      if (typeof fromFactor !== 'number' || typeof toFactor !== 'number') {
          console.warn("CALLBACK: convertUnits - Unit factors not numbers.");
          setResult("Unit factors are not numbers. Check configuration.");
          return;
      }
      if (toFactor === 0) {
        if (fromFactor === 0 && calcInputValue === 0) { 
            outputValue = 0;
        } else if (fromFactor !== 0) { 
          console.warn("CALLBACK: convertUnits - Cannot convert to zero base factor.");
          setResult("Cannot convert to a unit with a zero base factor (division by zero).");
          return;
        } else { 
            outputValue = 0;
        }
      } else {
        const valueInBase = calcInputValue * fromFactor;
        outputValue = valueInBase / toFactor;
      }
    }

    console.log("CALLBACK: convertUnits - Calculated outputValue:", outputValue);
    if (Math.abs(outputValue) < 0.000001 && outputValue !== 0) { 
        const finalRes = outputValue.toExponential(4);
        console.log("CALLBACK: convertUnits - Setting result (exponential):", finalRes);
        setResult(finalRes);
    } else {
        const finalRes = parseFloat(outputValue.toFixed(6)).toString();
        console.log("CALLBACK: convertUnits - Setting result (fixed):", finalRes);
        setResult(finalRes);
    }
  }, [
    inputValue, fromUnit, toUnit, selectedCategory, // Added these direct dependencies
    getValues, setResult, setIsLoading, fetchCurrencyRates, toast
  ]);


  useEffect(() => {
    console.log("EFFECT: Category Change - selectedCategory is now", selectedCategory);
    if (selectedCategory) {
      const defaultUnits = Object.keys(unitCategories[selectedCategory]);
      let newFromUnit = '';
      let newToUnit = '';
      if (defaultUnits.length >= 2) {
        newFromUnit = defaultUnits[0];
        newToUnit = defaultUnits[1];
      } else if (defaultUnits.length === 1) {
        newFromUnit = defaultUnits[0];
        newToUnit = defaultUnits[0];
      }
      
      const currentFormValues = getValues();
      if (currentFormValues.fromUnit !== newFromUnit) {
        console.log("EFFECT: Category Change - Setting fromUnit via setValue from", currentFormValues.fromUnit, "to", newFromUnit);
        setValue('fromUnit', newFromUnit, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }
      if (currentFormValues.toUnit !== newToUnit) {
        console.log("EFFECT: Category Change - Setting toUnit via setValue from", currentFormValues.toUnit, "to", newToUnit);
        setValue('toUnit', newToUnit, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }
    }
  }, [selectedCategory, setValue, getValues]);

  useEffect(() => {
    console.log("EFFECT: Conversion Trigger - Watched values:", { inputValue, fromUnit, toUnit, selectedCategory });
    if (fromUnit && toUnit && selectedCategory && typeof inputValue === 'number' && !isNaN(inputValue)) {
      console.log("EFFECT: Conversion Trigger - Conditions met, calling convertUnits.");
      convertUnits();
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory, convertUnits]);


  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result)
        .then(() => toast({ title: "Copied!", description: "Result copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy result.", variant: "destructive" }));
    } else {
      toast({ title: "Nothing to copy", description: "No result available.", variant: "default" });
    }
  };

  const handleDownload = (format: 'txt' | 'pdf') => {
    const currentVals = getValues();
    if (!result || typeof currentVals.inputValue !== 'number' || !currentVals.fromUnit || !currentVals.toUnit || !currentVals.category) {
      toast({ title: "Nothing to download", description: "Perform a conversion first.", variant: "destructive" });
      return;
    }
    const content = `${currentVals.inputValue} ${currentVals.fromUnit} = ${result} ${currentVals.toUnit}`;
    let blob: Blob;
    let filename: string;

    if (format === 'txt') {
      blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      filename = 'conversion.txt';
    } else { 
      const pdf = new jsPDF();
      pdf.setFontSize(12);
      pdf.text("Unit Conversion Result", 10, 10);
      pdf.text(`Category: ${currentVals.category}`, 10, 20);
      pdf.text(`Input: ${currentVals.inputValue} ${currentVals.fromUnit}`, 10, 30);
      pdf.text(`Output: ${result} ${currentVals.toUnit}`, 10, 40);
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
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
              control={control}
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
              control={control}
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
              control={control}
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
          <p className="ml-2">Processing...</p>
        </div>
      )}

      {result && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Conversion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold text-primary">{result} <span className="text-lg text-muted-foreground">{getValues('toUnit') || toUnit}</span></p>
            <p className="text-sm text-muted-foreground">
              {typeof getValues('inputValue') === 'number' ? getValues('inputValue') : inputValue} {getValues('fromUnit') || fromUnit} = {result} {getValues('toUnit') || toUnit}
            </p>
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleCopyResult} variant="outline" size="sm" disabled={!result}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button onClick={() => handleDownload('txt')} variant="outline" size="sm" disabled={!result}>
                <Download className="mr-2 h-4 w-4" /> Download TXT
              </Button>
              <Button onClick={() => handleDownload('pdf')} variant="outline" size="sm" disabled={!result}>
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

