import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, SearchIcon, ScanLineIcon, PlusIcon, MinusIcon } from "lucide-react";
export function CountScreen({ department, areas, groups, items, entries, operatorName, onBack, onScanBarcode, onAddEntry }) {
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [fulls, setFulls] = useState(0);
    const [singles, setSingles] = useState(0);
    const [notes, setNotes] = useState("");
    // Filter items based on selections and search
    const filteredGroups = selectedArea ? groups.filter(g => g.areaId === selectedArea) : [];
    const filteredItems = items.filter(item => {
        const matchesGroup = selectedGroup ? item.groupId === selectedGroup : true;
        const matchesSearch = searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.barcode?.includes(searchTerm) : true;
        return matchesGroup && matchesSearch;
    });
    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setFulls(item.defaultFulls || 0);
        setSingles(item.defaultSingles || 0);
        setNotes("");
    };
    const handleAddEntry = () => {
        if (!selectedItem)
            return;
        onAddEntry({
            itemId: selectedItem.id,
            fulls,
            singles,
            notes
        });
        // Reset form
        setSelectedItem(null);
        setFulls(0);
        setSingles(0);
        setNotes("");
    };
    const adjustCount = (type, delta) => {
        if (type === 'fulls') {
            setFulls(Math.max(0, fulls + delta));
        }
        else {
            setSingles(Math.max(0, singles + delta));
        }
    };
    return (<div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center p-4">
          <Button size="icon" variant="ghost" onClick={onBack} data-testid="button-back">
            <ArrowLeftIcon className="h-5 w-5"/>
          </Button>
          <div className="ml-4">
            <h1 className="text-xl font-semibold">{department.name}</h1>
            <p className="text-sm text-muted-foreground">Operator: {operatorName}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-6">
        {/* Left Panel - Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Navigate & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Area</Label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger data-testid="select-area">
                  <SelectValue placeholder="Select area"/>
                </SelectTrigger>
                <SelectContent>
                  {areas.map(area => (<SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {selectedArea && (<div className="space-y-2">
                <Label>Product Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger data-testid="select-group">
                    <SelectValue placeholder="Select group"/>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGroups.map(group => (<SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>)}

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <Input placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-12" data-testid="input-search"/>
              </div>
              <Button onClick={onScanBarcode} size="icon" className="h-12 w-12" data-testid="button-scan">
                <ScanLineIcon className="h-5 w-5"/>
              </Button>
            </div>

            {/* Item List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredItems.map(item => (<div key={item.id} className={`p-3 rounded-md border cursor-pointer hover-elevate transition-colors ${selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''}`} onClick={() => handleSelectItem(item)} data-testid={`item-${item.id}`}>
                  <div className="font-medium">{item.name}</div>
                  {item.barcode && (<div className="text-xs text-muted-foreground mt-1">
                      {item.barcode}
                    </div>)}
                </div>))}
            </div>
          </CardContent>
        </Card>

        {/* Middle Panel - Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Count Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedItem ? (<>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium">{selectedItem.name}</h3>
                  {selectedItem.barcode && (<p className="text-sm text-muted-foreground">
                      Barcode: {selectedItem.barcode}
                    </p>)}
                </div>

                {/* Count Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fulls</Label>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => adjustCount('fulls', -1)} data-testid="button-fulls-minus">
                        <MinusIcon className="h-4 w-4"/>
                      </Button>
                      <Input type="number" value={fulls} onChange={(e) => setFulls(Math.max(0, parseInt(e.target.value) || 0))} className="text-center h-12 text-xl font-medium" data-testid="input-fulls"/>
                      <Button size="icon" variant="outline" onClick={() => adjustCount('fulls', 1)} data-testid="button-fulls-plus">
                        <PlusIcon className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Singles</Label>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => adjustCount('singles', -1)} data-testid="button-singles-minus">
                        <MinusIcon className="h-4 w-4"/>
                      </Button>
                      <Input type="number" value={singles} onChange={(e) => setSingles(Math.max(0, parseInt(e.target.value) || 0))} className="text-center h-12 text-xl font-medium" data-testid="input-singles"/>
                      <Button size="icon" variant="outline" onClick={() => adjustCount('singles', 1)} data-testid="button-singles-plus">
                        <PlusIcon className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea placeholder="Add notes..." value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="textarea-notes"/>
                  </div>
                </div>

                <Button onClick={handleAddEntry} className="w-full h-12" data-testid="button-add-entry">
                  Add to Log
                </Button>
              </>) : (<div className="text-center text-muted-foreground py-8">
                Select an item to start counting
              </div>)}
          </CardContent>
        </Card>

        {/* Right Panel - Entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Today's Entries</CardTitle>
            <Badge variant="secondary">{entries.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {entries.length === 0 ? (<p className="text-center text-muted-foreground py-8">
                  No entries yet
                </p>) : (entries.map((entry, index) => (<div key={entry.id} className="p-3 border rounded-md" data-testid={`entry-${index}`}>
                    <div className="font-medium text-sm">
                      {items.find(i => i.id === entry.itemId)?.name || 'Unknown Item'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Fulls: {entry.fulls} | Singles: {entry.singles}
                    </div>
                    {entry.notes && (<div className="text-xs text-muted-foreground mt-1">
                        {entry.notes}
                      </div>)}
                  </div>)))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
