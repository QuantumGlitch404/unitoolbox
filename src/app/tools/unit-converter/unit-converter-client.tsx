
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Loader2 } from 'lucide-react'; 
import { jsPDF } from 'jspdf';

const unitCategories = {
  Length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.34, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 },
  Weight: { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, Pound: 0.453592, Ounce: 0.0283495, Tonne: 1000 },
  Time: { Second: 1, Minute: 60, Hour: 3600, Day: 86400, Week: 604800 },
  Temperature: { Celsius: 'celsius', Fahrenheit: 'fahrenheit', Kelvin: 'kelvin' },
  Area: { 'Square Meter': 1, 'Square Kilometer': 1000000, 'Square Mile': 2589988.11, 'Square Yard': 0.836127, 'Square Foot': 0.092903, Acre: 4046.86, Hectare: 10000 },
  Volume: { 'Cubic Meter': 1, Liter: 0.001, Milliliter: 0.000001, Gallon: 0.00378541, Quart: 0.000946353 },
  Speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444 },
  Pressure: { Pascal: 1, Bar: 100000, PSI: 6894.76, Atmosphere: 101325 },
  Currency: { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.3, JPY: 157 }
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

  const convertUnits = useCallback(async (
    currentInputValue: number,
    currentFromUnit: string,
    currentToUnit: string,
    currentSelectedCategory: UnitCategory
  ) => {
    console.log("CONVERT_UNITS_ARG: InputValue:", currentInputValue, "From:", currentFromUnit, "To:", currentToUnit, "Cat:", currentSelectedCategory);

    if (typeof currentInputValue !== 'number' || isNaN(currentInputValue) || !currentFromUnit || !currentToUnit || !currentSelectedCategory) {
      console.warn("CONVERT_UNITS_ARG: Invalid input or units. Bailing out.", { currentInputValue, currentFromUnit, currentToUnit, currentSelectedCategory });
      setResult("Please enter a valid number and select units.");
      return;
    }
    console.log("CONVERT_UNITS_ARG: Inputs validated. Proceeding.");

    let outputValue: number;

    if (currentSelectedCategory === 'Temperature') {
      const temp = currentInputValue;
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
        console.warn("CONVERT_UNITS_ARG: Invalid temperature units.");
        setResult("Invalid temperature units.");
        return;
      }
    } else if (currentSelectedCategory === 'Currency') {
        console.log("CONVERT_UNITS_ARG: Handling Currency.");
        const rates = await fetchCurrencyRates(currentFromUnit); 
        const fromRate = (rates as any)[currentFromUnit] || 1;
        const toRate = (rates as any)[currentToUnit] || 1;
        if (fromRate === 0) {
          console.warn("CONVERT_UNITS_ARG: Currency 'fromRate' is zero.");
          setResult("Cannot convert from a currency with a zero rate.");
          return;
        }
        const valueInUSD = currentInputValue / fromRate;
        outputValue = valueInUSD * toRate;
    } else {
      const categoryUnits = unitCategories[currentSelectedCategory] as Record<string, number>;
      console.log("CONVERT_UNITS_ARG: categoryUnits:", categoryUnits);
      console.log("CONVERT_UNITS_ARG: currentFromUnit:", currentFromUnit, "currentToUnit:", currentToUnit);

      if (!(currentFromUnit in categoryUnits) || !(currentToUnit in categoryUnits)) {
        console.warn("CONVERT_UNITS_ARG: Selected units invalid for category. Available units:", Object.keys(categoryUnits));
        setResult("Selected units are invalid for this category.");
        return;
      }
      const fromFactor = categoryUnits[currentFromUnit];
      const toFactor = categoryUnits[currentToUnit];

      console.log("CONVERT_UNITS_ARG: fromFactor:", fromFactor, "toFactor:", toFactor);
      
      if (typeof fromFactor !== 'number' || typeof toFactor !== 'number') {
          console.warn("CONVERT_UNITS_ARG: Unit factors not numbers.");
          setResult("Unit factors are not numbers. Check configuration.");
          return;
      }
       if (toFactor === 0) {
        if (fromFactor === 0 && currentInputValue === 0) { 
            outputValue = 0;
        } else if (fromFactor !== 0) { 
          console.warn("CONVERT_UNITS_ARG: Cannot convert to zero base factor.");
          setResult("Cannot convert to a unit with a zero base factor (division by zero).");
          return;
        } else { 
            outputValue = 0; // e.g. 0 of unit A to unit B where A has factor 0
        }
      } else {
        const valueInBase = currentInputValue * fromFactor;
        outputValue = valueInBase / toFactor;
        console.log("CONVERT_UNITS_ARG: Calculation: (", currentInputValue, " * ", fromFactor, ") / ", toFactor, " = ", outputValue);
      }
    }
    
    if (typeof outputValue === 'number' && !isNaN(outputValue)) {
        if (Math.abs(outputValue) < 0.000001 && outputValue !== 0) { 
            const finalRes = outputValue.toExponential(4);
            console.log("CONVERT_UNITS_ARG: Setting result (exponential):", finalRes);
            setResult(finalRes);
        } else {
            let fixedOutput = outputValue.toFixed(6);
            fixedOutput = fixedOutput.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1'); // Remove trailing zeros after decimal
            const finalRes = fixedOutput;
            console.log("CONVERT_UNITS_ARG: Setting result (fixed):", finalRes);
            setResult(finalRes);
        }
    } else {
        console.warn("CONVERT_UNITS_ARG: outputValue is not a valid number after calculation.", outputValue);
        setResult("Calculation error occurred.");
    }
  },
  [setResult, setIsLoading, fetchCurrencyRates, toast] 
);

  useEffect(() => {
    console.log("EFFECT: Category Change - selectedCategory is now", selectedCategory);
    if (selectedCategory) {
      const currentCategoryUnits = unitsForCategory; // Relies on unitsForCategory being up-to-date
      const currentFormFromUnit = getValues('fromUnit');
      const currentFormToUnit = getValues('toUnit');

      let newFromUnit = currentFormFromUnit;
      let newToUnit = currentFormToUnit;

      if (!currentCategoryUnits.includes(currentFormFromUnit)) {
        newFromUnit = currentCategoryUnits[0] || "";
      }
      if (!currentCategoryUnits.includes(currentFormToUnit)) {
        newToUnit = currentCategoryUnits.length > 1 ? currentCategoryUnits[1] : currentCategoryUnits[0] || "";
      }
      
      if (newFromUnit === newToUnit && currentCategoryUnits.length > 1) {
        if (currentCategoryUnits[0] === newFromUnit && currentCategoryUnits[1]) {
            newToUnit = currentCategoryUnits[1];
        } else if (currentCategoryUnits[0]) {
            // Keep newFromUnit as currentCategoryUnits[0], try to make newToUnit different
            if (currentCategoryUnits[1] && currentCategoryUnits[0] !== currentCategoryUnits[1]) {
                 newToUnit = currentCategoryUnits[1];
            } else if (currentCategoryUnits.length > 2 && currentCategoryUnits[2] !== currentCategoryUnits[0]) {
                 newToUnit = currentCategoryUnits[2]; // Fallback if [0] and [1] are same
            } else {
                // If only one distinct unit, or two identical units, newToUnit will be same as newFromUnit.
                // This is acceptable if only one unit defined for category.
            }
        }
      }

      if (currentFormFromUnit !== newFromUnit) {
        console.log("EFFECT: Category Change - Setting fromUnit via setValue from", currentFormFromUnit, "to", newFromUnit);
        setValue('fromUnit', newFromUnit, { shouldValidate: true, shouldDirty: true });
      }
      if (currentFormToUnit !== newToUnit) {
        console.log("EFFECT: Category Change - Setting toUnit via setValue from", currentFormToUnit, "to", newToUnit);
        setValue('toUnit', newToUnit, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [selectedCategory, setValue, unitsForCategory, getValues]);


  useEffect(() => {
    console.log("EFFECT: Conversion Trigger - Watched values:", { inputValue, fromUnit, toUnit, selectedCategory });
    
    // Ensure inputValue from watch is treated as a number for the condition
    // z.coerce.number converts empty string to 0, so parseFloat might not be strictly needed if trusting Zod state.
    // However, to be robust against intermediate string states from `watch`, parsing is safer.
    const numericInputValue = parseFloat(String(inputValue));

    if (fromUnit && toUnit && selectedCategory && !isNaN(numericInputValue)) {
      console.log("EFFECT: Conversion Trigger - Conditions met, calling convertUnits with:", numericInputValue, fromUnit, toUnit, selectedCategory);
      convertUnits(numericInputValue, fromUnit, toUnit, selectedCategory);
    } else {
      console.log("EFFECT: Conversion Trigger - Conditions NOT met or inputValue is NaN. Watched inputValue:", inputValue, "Parsed numericInputValue:", numericInputValue);
      // Optionally, clear result or show "invalid input" if that's desired when conditions aren't met.
      // For now, it will just not call convertUnits, keeping the last valid result or error.
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
        <form className="space-y-6"> {/* No onSubmit needed here as updates are reactive */}
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

      {result !== null && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Conversion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold text-primary">{result} <span className="text-lg text-muted-foreground">{watch('toUnit')}</span></p>
            <p className="text-sm text-muted-foreground">
              {/* Safely access inputValue, ensuring it's a number for display or show empty string */}
              {typeof watch('inputValue') === 'number' ? watch('inputValue') : ""} {watch('fromUnit')} = {result} {watch('toUnit')}
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

    