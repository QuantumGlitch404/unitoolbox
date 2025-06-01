
'use client';
import { useState, useMemo } from 'react';
import { tools, Tool, ToolCategory, toolCategories } from '@/lib/tools';
import { ToolCard } from '@/components/tools/tool-card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export default function AllToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'All'>('All');

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  const toolsByCategory = useMemo(() => {
    if (activeCategory !== 'All') {
      return { [activeCategory]: filteredTools };
    }
    const grouped: { [key in ToolCategory]?: Tool[] } = {};
    filteredTools.forEach(tool => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category]!.push(tool);
    });
    return grouped;
  }, [filteredTools, activeCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Our Suite of Tools</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
          Discover a wide range of utilities to help you with your daily digital tasks.
        </p>
      </header>

      <div className="mb-8 sticky top-16 bg-background/80 backdrop-blur-md py-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tools..."
            className="w-full pl-10 pr-4 py-2 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ToolCategory | 'All')} className="mt-4">
          <TabsList className="flex flex-wrap justify-center w-full gap-1 sm:gap-2">
            <TabsTrigger value="All">All</TabsTrigger>
            {toolCategories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {Object.keys(toolsByCategory).length === 0 && (
         <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No tools found matching your criteria.</p>
         </div>
      )}

      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
        categoryTools && categoryTools.length > 0 && (
          <section key={category} className="mb-12">
            {activeCategory === 'All' && (
              <h2 className="font-headline text-2xl font-semibold mb-6 border-b pb-2">
                {category} Tools
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
}
