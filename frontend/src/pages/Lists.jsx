import { List as ListIcon, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";

export default function Lists() {
  // Coming soon feature layout
  const lists = [
    { id: 1, name: "System Design Prep", count: 12, private: true },
    { id: 2, name: "Staff Engineer Curriculum", count: 45, private: false },
    { id: 3, name: "Go Backend Performance", count: 8, private: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <ListIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Your Lists</h1>
          </div>
          <p className="text-muted-foreground">
            Curated collections of engineering blogs.
          </p>
        </div>
        <Button className="hidden sm:flex">
          <Plus className="h-4 w-4 mr-2" />
          Create List
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder button card */}
        <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-muted-foreground/50 transition-colors h-[180px]">
          <div className="p-3 bg-background rounded-full mb-3 shadow-sm border border-border">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-medium text-sm">Create new list</span>
        </button>

        {lists.map((list) => (
          <Card key={list.id} className="hover:border-primary/50 transition-colors cursor-pointer group h-[180px] flex flex-col relative overflow-hidden">
             {/* Simple decoration */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 to-transparent group-hover:from-primary/50 transition-colors" />
             
            <CardHeader className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${list.private ? 'bg-secondary text-secondary-foreground' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'}`}>
                  {list.private ? "Private" : "Public"}
                </span>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">{list.name}</CardTitle>
              <CardDescription className="mt-2 line-clamp-2">A curated collection of insightful engineering blogs about {list.name.toLowerCase()}.</CardDescription>
            </CardHeader>
            <CardFooter className="py-4 border-t bg-secondary/20">
              <p className="text-xs text-muted-foreground">{list.count} stories saved</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
