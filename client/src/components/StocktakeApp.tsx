import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  SearchIcon, 
  ScanLineIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  PackageIcon,
  EditIcon,
  TrashIcon,
  BarChart3Icon
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Department, Area, Item } from "@shared/schema";
import Papa from 'papaparse';

// Type declaration for Quagga
declare const Quagga: any;

export function StocktakeApp() {
  const [currentView, setCurrentView] = useState<'departments' | 'areas' | 'items' | 'count' | 'reports'>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  
  // Dialog states
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  
  // Form states
  const [newDeptName, setNewDeptName] = useState("");
  const [newAreaName, setNewAreaName] = useState("");
  const [newItemData, setNewItemData] = useState({ 
    name: "", 
    barcode: "", 
    packVolume: "",
    defaultFulls: 0,
    defaultSingles: 0
  });
  
  // Counting states
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [fulls, setFulls] = useState("");
  const [singles, setSingles] = useState("");
  
  const scannerRef = useRef<HTMLDivElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch data from API
  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['/api/departments'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: areasData, isLoading: areasLoading } = useQuery({
    queryKey: ['/api/areas'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: productGroupsData, isLoading: productGroupsLoading } = useQuery({
    queryKey: ['/api/product-groups'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/items'],
    staleTime: 5 * 60 * 1000,
  });

  // Mutations for CRUD operations
  const createDepartmentMutation = useMutation({
    mutationFn: async (data: { name: string; description: string | null }) => {
      const response = await apiRequest('POST', '/api/departments', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setNewDeptName("");
      setShowAddDept(false);
      toast({ title: "Department created successfully" });
    },
    onError: () => {
      toast({ title: "Error creating department", variant: "destructive" });
    }
  });

  const createAreaMutation = useMutation({
    mutationFn: async (data: { name: string; departmentId: string }) => {
      const response = await apiRequest('POST', '/api/areas', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/areas'] });
      setNewAreaName("");
      setShowAddArea(false);
      setEditingArea(null);
      toast({ title: "Area saved successfully" });
    },
    onError: () => {
      toast({ title: "Error saving area", variant: "destructive" });
    }
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string | null }) => {
      const response = await apiRequest('PATCH', `/api/departments/${data.id}`, {
        name: data.name,
        description: data.description
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setNewDeptName("");
      setShowAddDept(false);
      setEditingDept(null);
      toast({ title: "Department updated successfully" });
    },
    onError: () => {
      toast({ title: "Error updating department", variant: "destructive" });
    }
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/departments/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Department deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error deleting department", variant: "destructive" });
    }
  });

  const updateAreaMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; departmentId: string }) => {
      const response = await apiRequest('PATCH', `/api/areas/${data.id}`, {
        name: data.name,
        departmentId: data.departmentId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/areas'] });
      setNewAreaName("");
      setShowAddArea(false);
      setEditingArea(null);
      toast({ title: "Area updated successfully" });
    },
    onError: () => {
      toast({ title: "Error updating area", variant: "destructive" });
    }
  });

  const deleteAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/areas/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/areas'] });
      toast({ title: "Area deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error deleting area", variant: "destructive" });
    }
  });

  const createProductGroupMutation = useMutation({
    mutationFn: async (data: { name: string; areaId: string }) => {
      const response = await apiRequest('POST', '/api/product-groups', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-groups'] });
    }
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/items', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      setNewItemData({ name: "", barcode: "", packVolume: "", defaultFulls: 0, defaultSingles: 0 });
      setShowAddItem(false);
      toast({ title: "Item created successfully" });
    },
    onError: () => {
      toast({ title: "Error creating item", variant: "destructive" });
    }
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/entries', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Count recorded successfully" });
    },
    onError: () => {
      toast({ title: "Error recording count", variant: "destructive" });
    }
  });

  // Filter data based on selections
  const areasArray = Array.isArray(areasData) ? areasData as Area[] : [];
  const itemsArray = Array.isArray(itemsData) ? itemsData as Item[] : [];
  const departmentsArray = Array.isArray(departmentsData) ? departmentsData as Department[] : [];
  const productGroupsArray = Array.isArray(productGroupsData) ? productGroupsData as any[] : [];
  
  const filteredAreas = areasArray.filter((area: Area) => 
    selectedDepartment ? area.departmentId === selectedDepartment.id : true
  );

  const filteredItems = itemsArray.filter((item: Item) => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Barcode scanning functionality
  const startBarcodeScanner = async () => {
    setScannerActive(true);
    
    // Initialize Quagga scanner
    setTimeout(() => {
      if (scannerRef.current) {
        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: 480,
              height: 320,
              facingMode: "environment"
            }
          },
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
          },
          locate: true
        }, (err: any) => {
          if (err) {
            console.error('Quagga initialization error:', err);
            toast({ 
              title: "Scanner initialization failed", 
              description: "Please check camera permissions",
              variant: "destructive" 
            });
            setScannerActive(false);
            return;
          }
          
          Quagga.start();
          
          // Listen for barcode detection
          Quagga.onDetected((data: any) => {
            const barcode = data.codeResult.code;
            console.log('Barcode detected:', barcode);
            handleBarcodeDetected(barcode);
          });
        });
      }
    }, 100);
  };

  const stopBarcodeScanner = () => {
    setScannerActive(false);
    try {
      Quagga.stop();
      Quagga.offDetected();
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    // Find item by barcode
    const foundItem = filteredItems.find(item => item.barcode === barcode);
    if (foundItem) {
      setSelectedItem(foundItem);
      setCurrentView('count');
      toast({ 
        title: "Item found!", 
        description: `Selected: ${foundItem.name}` 
      });
    } else {
      toast({ 
        title: "Item not found", 
        description: `No item found with barcode: ${barcode}`,
        variant: "destructive" 
      });
    }
    stopBarcodeScanner();
  };

  const handleAddCount = async () => {
    if (!selectedItem) return;
    
    const fullsNum = parseInt(fulls) || 0;
    const singlesNum = parseInt(singles) || 0;
    
    if (fullsNum === 0 && singlesNum === 0) {
      toast({ title: "Please enter a count", variant: "destructive" });
      return;
    }

    // Save count to database
    const entryData = {
      sessionId: 'current-session', // TODO: Use actual session ID
      itemId: selectedItem.id,
      fulls: fullsNum,
      singles: singlesNum,
      notes: '',
      enteredBy: 'Current User' // TODO: Use actual user
    };
    
    try {
      await createEntryMutation.mutateAsync(entryData);
      toast({ 
        title: "Count recorded", 
        description: `${selectedItem.name}: ${fullsNum} fulls, ${singlesNum} singles` 
      });
      
      setFulls("");
      setSingles("");
      setSelectedItem(null);
      setCurrentView('items');
    } catch (error) {
      console.error('Error saving count:', error);
    }
  };

  // CSV Import functionality - using bulk import endpoint
  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvImporting(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const csvData = results.data as any[];
          
          if (csvData.length === 0) {
            toast({ title: "CSV file is empty", variant: "destructive" });
            return;
          }
          
          // Validate CSV headers
          const firstRow = csvData[0];
          const expectedHeaders = ['Stock Type', 'Category', 'Sub Category', 'Pack Volume', 'Brand '];
          const missingHeaders = expectedHeaders.filter(header => 
            !(header in firstRow) && !(`${header.trim()}` in firstRow)
          );
          
          if (missingHeaders.length > 0) {
            toast({ 
              title: "Invalid CSV format", 
              description: `Missing headers: ${missingHeaders.join(', ')}`,
              variant: "destructive" 
            });
            return;
          }
          
          // Use bulk import endpoint
          const response = await apiRequest('POST', '/api/import/csv', { csvData });
          const result = await response.json();
          
          if (result.success) {
            const { created } = result;
            toast({ 
              title: "Import successful!", 
              description: `Created: ${created.departments} departments, ${created.areas} areas, ${created.productGroups} product groups, ${created.items} items`
            });
            
            // Refresh all data caches
            queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
            queryClient.invalidateQueries({ queryKey: ['/api/areas'] });
            queryClient.invalidateQueries({ queryKey: ['/api/product-groups'] });
            queryClient.invalidateQueries({ queryKey: ['/api/items'] });
          } else {
            const errorMessage = result.errors && result.errors.length > 0 
              ? result.errors.slice(0, 3).join('; ') + (result.errors.length > 3 ? '...' : '')
              : 'Unknown import error';
            
            toast({ 
              title: "Import completed with errors", 
              description: errorMessage,
              variant: "destructive" 
            });
            
            // Still refresh data in case some items were imported
            queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
            queryClient.invalidateQueries({ queryKey: ['/api/areas'] });
            queryClient.invalidateQueries({ queryKey: ['/api/product-groups'] });
            queryClient.invalidateQueries({ queryKey: ['/api/items'] });
          }
          
        } catch (error) {
          console.error('CSV import error:', error);
          toast({ 
            title: "Import failed", 
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive" 
          });
        } finally {
          setCsvImporting(false);
          if (csvInputRef.current) {
            csvInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        toast({ 
          title: "Failed to parse CSV file", 
          description: "Please check that the file is a valid CSV format",
          variant: "destructive" 
        });
        setCsvImporting(false);
      }
    });
  };

  // Render functions
  const renderDepartmentView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Departments</h1>
        <div className="flex gap-2">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="hidden"
            data-testid="input-csv-import"
          />
          <Button 
            onClick={() => csvInputRef.current?.click()}
            variant="outline"
            disabled={csvImporting}
            data-testid="button-import-csv"
          >
            {csvImporting ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-current" />
            ) : (
              <PlusIcon className="w-4 h-4 mr-2" />
            )}
            Import CSV
          </Button>
          <Button 
            onClick={() => setShowAddDept(true)}
            data-testid="button-add-department"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>
      
      {departmentsLoading ? (
        <div>Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentsArray.map((dept: Department) => (
            <Card 
              key={dept.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => {
                setSelectedDepartment(dept);
                setCurrentView('areas');
              }}
              data-testid={`card-department-${dept.id}`}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {dept.name}
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingDept(dept);
                        setNewDeptName(dept.name);
                        setShowAddDept(true);
                      }}
                      data-testid={`button-edit-dept-${dept.id}`}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {dept.description || "No description"}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {areasArray.filter((area: Area) => area.departmentId === dept.id).length} areas
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderAreaView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setSelectedDepartment(null);
              setCurrentView('departments');
            }}
            data-testid="button-back-to-departments"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {selectedDepartment?.name} - Areas
          </h1>
        </div>
        <Button 
          onClick={() => setShowAddArea(true)}
          data-testid="button-add-area"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Area
        </Button>
      </div>
      
      {areasLoading ? (
        <div>Loading areas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map((area: Area) => (
            <Card 
              key={area.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => {
                setSelectedArea(area);
                setCurrentView('items');
              }}
              data-testid={`card-area-${area.id}`}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {area.name}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingArea(area);
                      setNewAreaName(area.name);
                      setShowAddArea(true);
                    }}
                    data-testid={`button-edit-area-${area.id}`}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {filteredItems.filter(item => {
                    // Note: This is simplified - in a full implementation, 
                    // you'd filter by product group which belongs to this area
                    return true; // For now, showing all items count
                  }).length} items
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderItemView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setSelectedArea(null);
              setCurrentView('areas');
            }}
            data-testid="button-back-to-areas"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Items</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={startBarcodeScanner}
            data-testid="button-scan-barcode"
          >
            <ScanLineIcon className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button 
            onClick={() => setShowAddItem(true)}
            data-testid="button-add-item"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-items"
          />
        </div>
      </div>
      
      {itemsLoading ? (
        <div>Loading items...</div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item: Item) => (
              <Card 
                key={item.id} 
                className="hover-elevate cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setCurrentView('count');
                }}
                data-testid={`card-item-${item.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.barcode && (
                    <Badge variant="outline" className="text-xs">
                      {item.barcode}
                    </Badge>
                  )}
                  {item.packVolume && (
                    <div className="flex items-center gap-1">
                      <PackageIcon className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">
                        {item.packVolume}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Fulls: {item.defaultFulls || 0}</span>
                    <span>Singles: {item.defaultSingles || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  const renderCountView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            setSelectedItem(null);
            setCurrentView('items');
          }}
          data-testid="button-back-to-items"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Count Item</h1>
      </div>
      
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedItem.name}</CardTitle>
            {selectedItem.barcode && (
              <Badge variant="outline">{selectedItem.barcode}</Badge>
            )}
            {selectedItem.packVolume && (
              <div className="flex items-center gap-1">
                <PackageIcon className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  Pack Volume: {selectedItem.packVolume}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fulls">Fulls</Label>
                <Input
                  id="fulls"
                  type="number"
                  value={fulls}
                  onChange={(e) => setFulls(e.target.value)}
                  placeholder={`Default: ${selectedItem.defaultFulls || 0}`}
                  data-testid="input-fulls"
                />
              </div>
              <div>
                <Label htmlFor="singles">Singles</Label>
                <Input
                  id="singles"
                  type="number"
                  value={singles}
                  onChange={(e) => setSingles(e.target.value)}
                  placeholder={`Default: ${selectedItem.defaultSingles || 0}`}
                  data-testid="input-singles"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleAddCount}
              className="w-full"
              data-testid="button-add-count"
            >
              Add Count
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Navigation
  const renderNavigation = () => (
    <div className="flex gap-2 mb-4">
      <Button 
        variant={currentView === 'departments' ? 'default' : 'outline'}
        onClick={() => setCurrentView('departments')}
        data-testid="nav-departments"
      >
        Departments
      </Button>
      <Button 
        variant={currentView === 'reports' ? 'default' : 'outline'}
        onClick={() => setCurrentView('reports')}
        data-testid="nav-reports"
      >
        <BarChart3Icon className="h-4 w-4 mr-2" />
        Reports
      </Button>
    </div>
  );

  const renderReportsView = () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Stock Count Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{departmentsArray.length}</div>
              <div className="text-sm text-muted-foreground">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{areasArray.length}</div>
              <div className="text-sm text-muted-foreground">Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{itemsArray.length}</div>
              <div className="text-sm text-muted-foreground">Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Counted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {renderNavigation()}
        
        {currentView === 'departments' && renderDepartmentView()}
        {currentView === 'areas' && renderAreaView()}
        {currentView === 'items' && renderItemView()}
        {currentView === 'count' && renderCountView()}
        {currentView === 'reports' && renderReportsView()}
        
        {/* Barcode Scanner Modal */}
        {scannerActive && (
          <Dialog open={scannerActive} onOpenChange={stopBarcodeScanner}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div 
                  ref={scannerRef}
                  className="w-full h-64 bg-black rounded relative overflow-hidden"
                  style={{ position: 'relative' }}
                />
                <div className="text-center text-sm text-muted-foreground">
                  Point camera at barcode to scan
                </div>
                <Button onClick={stopBarcodeScanner} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Add Department Dialog */}
        <Dialog open={showAddDept} onOpenChange={setShowAddDept}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDept ? 'Edit Department' : 'Add Department'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Enter department name"
                  data-testid="input-dept-name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (newDeptName.trim()) {
                    createDepartmentMutation.mutate({
                      name: newDeptName.trim(),
                      description: null
                    });
                  }
                }}
                disabled={!newDeptName.trim() || createDepartmentMutation.isPending}
                data-testid="button-save-dept"
              >
                {editingDept ? 'Update' : 'Create'} Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Area Dialog */}
        <Dialog open={showAddArea} onOpenChange={setShowAddArea}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingArea ? 'Edit Area' : 'Add Area'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="area-name">Area Name</Label>
                <Input
                  id="area-name"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="Enter area name"
                  data-testid="input-area-name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (newAreaName.trim() && selectedDepartment) {
                    createAreaMutation.mutate({
                      name: newAreaName.trim(),
                      departmentId: selectedDepartment.id
                    });
                  }
                }}
                disabled={!newAreaName.trim() || createAreaMutation.isPending}
                data-testid="button-save-area"
              >
                {editingArea ? 'Update' : 'Create'} Area
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Item Dialog */}
        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                  data-testid="input-item-name"
                />
              </div>
              <div>
                <Label htmlFor="item-barcode">Barcode</Label>
                <Input
                  id="item-barcode"
                  value={newItemData.barcode}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Enter barcode"
                  data-testid="input-item-barcode"
                />
              </div>
              <div>
                <Label htmlFor="item-pack-volume">Pack Volume</Label>
                <Input
                  id="item-pack-volume"
                  value={newItemData.packVolume}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, packVolume: e.target.value }))}
                  placeholder="e.g., 500ml, 1kg, 12 pack"
                  data-testid="input-item-pack-volume"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  if (newItemData.name.trim() && selectedArea) {
                    try {
                      // Find or create a default product group for this area
                      let defaultGroup = productGroupsArray.find(
                        (group: any) => group.areaId === selectedArea.id && group.name === 'Default'
                      );
                      
                      if (!defaultGroup) {
                        // Create default product group for this area
                        defaultGroup = await createProductGroupMutation.mutateAsync({
                          name: 'Default',
                          areaId: selectedArea.id
                        });
                      }
                      
                      // Create the item with the default group
                      createItemMutation.mutate({
                        name: newItemData.name.trim(),
                        barcode: newItemData.barcode.trim() || null,
                        packVolume: newItemData.packVolume.trim() || null,
                        groupId: defaultGroup.id,
                        defaultFulls: newItemData.defaultFulls,
                        defaultSingles: newItemData.defaultSingles
                      });
                    } catch (error) {
                      console.error('Error creating item:', error);
                      toast({ title: "Error creating item", variant: "destructive" });
                    }
                  }
                }}
                disabled={!newItemData.name.trim() || createItemMutation.isPending}
                data-testid="button-save-item"
              >
                Create Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}