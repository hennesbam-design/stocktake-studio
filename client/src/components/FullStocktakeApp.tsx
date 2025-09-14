import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  SearchIcon, 
  ScanLineIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  PackageIcon,
  EditIcon,
  BarChart3Icon,
  HomeIcon
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WelcomeScreen } from "./WelcomeScreen";
import { MenuDrawer } from "./MenuDrawer";
import { useStocktakeStore } from "../stores/stocktakeStore";
import type { Department, Area, Item } from "@shared/schema";
import Papa from 'papaparse';

declare const Quagga: any;

export function FullStocktakeApp() {
  const {
    currentScreen,
    setCurrentScreen,
    operatorName,
    setOperatorName,
    selectedDepartment,
    setSelectedDepartment,
    adminPin,
    setAdminPin
  } = useStocktakeStore();

  const [currentView, setCurrentView] = useState<'departments' | 'areas' | 'items' | 'count'>('departments');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  
  // Dialog states
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
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

  // NOTE: Admin PIN is no longer stored in localStorage for security
  // PIN must be entered each time for admin operations

  // Handle welcome screen continue
  const handleWelcomeContinue = (operator1: string, operator2: string, date: string) => {
    setOperatorName(operator1);
    setCurrentScreen('departments');
  };

  // Fetch data from API
  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['/api/departments'],
    staleTime: 5 * 60 * 1000,
    enabled: currentScreen !== 'welcome',
  });

  const { data: areasData, isLoading: areasLoading } = useQuery({
    queryKey: ['/api/areas'],
    staleTime: 5 * 60 * 1000,
    enabled: currentScreen !== 'welcome',
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/items'],
    staleTime: 5 * 60 * 1000,
    enabled: currentScreen !== 'welcome',
  });

  const { data: entriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/entries'],
    staleTime: 5 * 60 * 1000,
    enabled: currentScreen !== 'welcome',
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/sessions'],
    staleTime: 5 * 60 * 1000,
    enabled: currentScreen !== 'welcome',
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
      toast({ title: "Area created successfully" });
    },
    onError: () => {
      toast({ title: "Error creating area", variant: "destructive" });
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

  // Process data arrays
  const areasArray = Array.isArray(areasData) ? areasData as Area[] : [];
  const itemsArray = Array.isArray(itemsData) ? itemsData as Item[] : [];
  const departmentsArray = Array.isArray(departmentsData) ? departmentsData as Department[] : [];
  
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
          
          Quagga.onDetected((data: any) => {
            const barcode = data.codeResult.code;
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

    const entryData = {
      sessionId: 'current-session',
      itemId: selectedItem.id,
      fulls: fullsNum,
      singles: singlesNum,
      notes: '',
      enteredBy: operatorName || 'Current User'
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

  // CSV Import functionality
  const handleCsvImport = async (file: File) => {
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
          
          const response = await apiRequest('POST', '/api/import/csv', { csvData });
          const result = await response.json();
          
          if (result.success) {
            const { created } = result;
            toast({ 
              title: "Import successful!", 
              description: `Created: ${created.departments} departments, ${created.areas} areas, ${created.productGroups} product groups, ${created.items} items`
            });
            
            queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
            queryClient.invalidateQueries({ queryKey: ['/api/areas'] });
            queryClient.invalidateQueries({ queryKey: ['/api/items'] });
          } else {
            toast({ 
              title: "Import completed with errors", 
              description: result.errors?.slice(0, 3).join('; ') || 'Unknown error',
              variant: "destructive" 
            });
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

  // Menu drawer functions
  const handleExportCSV = () => {
    try {
      const entries = Array.isArray(entriesData) ? entriesData : [];
      const items = Array.isArray(itemsData) ? itemsData : [];
      const departments = Array.isArray(departmentsData) ? departmentsData : [];
      const areas = Array.isArray(areasData) ? areasData : [];
      
      if (entries.length === 0) {
        toast({ 
          title: "No entries to export", 
          description: "No stocktake entries found to export",
          variant: "destructive" 
        });
        return;
      }
      
      // Create CSV headers
      const headers = [
        'Entry ID',
        'Session ID', 
        'Item Name',
        'Item Barcode',
        'Department',
        'Area',
        'Fulls',
        'Singles',
        'Notes',
        'Entered By',
        'Created At'
      ];
      
      // Create CSV rows with detailed item and hierarchy information
      const rows = entries.map((entry: any) => {
        const item = items.find((item: any) => item.id === entry.itemId);
        const area = areas.find((area: any) => item && area.id === item.areaId);
        const department = departments.find((dept: any) => area && dept.id === area.departmentId);
        
        return [
          entry.id || '',
          entry.sessionId || '',
          item?.name || 'Unknown Item',
          item?.barcode || '',
          department?.name || 'Unknown Department',
          area?.name || 'Unknown Area', 
          entry.fulls || 0,
          entry.singles || 0,
          entry.notes || '',
          entry.enteredBy || '',
          entry.createdAt || ''
        ];
      });
      
      // Convert to CSV format
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      
      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stocktake-entries-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: "Export successful", 
        description: `Exported ${entries.length} stocktake entries to CSV` 
      });
      
    } catch (error) {
      console.error('CSV export error:', error);
      toast({ 
        title: "Export failed", 
        description: "Failed to export CSV file",
        variant: "destructive" 
      });
    }
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        exported_at: new Date().toISOString(),
        operator: operatorName || 'Unknown',
        departments: Array.isArray(departmentsData) ? departmentsData : [],
        areas: Array.isArray(areasData) ? areasData : [],
        items: Array.isArray(itemsData) ? itemsData : [],
        sessions: Array.isArray(sessionsData) ? sessionsData : [],
        entries: Array.isArray(entriesData) ? entriesData : [],
        statistics: {
          total_departments: Array.isArray(departmentsData) ? departmentsData.length : 0,
          total_areas: Array.isArray(areasData) ? areasData.length : 0,
          total_items: Array.isArray(itemsData) ? itemsData.length : 0,
          total_sessions: Array.isArray(sessionsData) ? sessionsData.length : 0,
          total_entries: Array.isArray(entriesData) ? entriesData.length : 0
        }
      };
      
      // Download JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stocktake-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: "Export successful", 
        description: `Exported complete stocktake data (${exportData.statistics.total_entries} entries)` 
      });
      
    } catch (error) {
      console.error('JSON export error:', error);
      toast({ 
        title: "Export failed", 
        description: "Failed to export JSON file",
        variant: "destructive" 
      });
    }
  };

  const handleClearData = async () => {
    if (!adminPin) {
      toast({ 
        title: "Admin access required", 
        description: "Please set an admin PIN first",
        variant: "destructive" 
      });
      return;
    }
    
    const userConfirmed = window.confirm(
      "WARNING: This will delete ALL stocktake data including departments, areas, items, sessions, and entries. This action cannot be undone. Are you sure you want to continue?"
    );
    
    if (!userConfirmed) {
      return;
    }
    
    try {
      // Call the secure clear-all endpoint with admin PIN
      const response = await apiRequest('POST', '/api/admin/clear-all', { adminPin });
      
      if (response.status === 401) {
        const errorData = await response.json();
        toast({
          title: "Authentication failed",
          description: errorData.error || "Invalid admin PIN",
          variant: "destructive"
        });
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Clear all React Query caches to refresh UI
        queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/areas'] });
        queryClient.invalidateQueries({ queryKey: ['/api/items'] });
        queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
        
        // Clear local state
        setSelectedDepartment(null);
        setSelectedArea(null);
        setSelectedItem(null);
        setCurrentView('departments');
        
        toast({ 
          title: "Data cleared successfully", 
          description: "All stocktake data has been permanently deleted." 
        });
      } else {
        toast({
          title: "Clear data failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Clear data error:', error);
      toast({
        title: "Failed to clear data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const template = [
      'Stock Type,Category,Sub Category,Pack Volume,Brand ',
      'Beer,Alcoholic bottles/cans,Beer - Bottle/Can,24 x 330ml,Sample Brand',
      'Wine,Alcoholic bottles/cans,Wine - Bottle,12 x 750ml,Sample Wine Co'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stocktake-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show welcome screen if no operator set
  if (currentScreen === 'welcome') {
    return <WelcomeScreen onContinue={handleWelcomeContinue} />;
  }

  // Render navigation header
  const renderHeader = () => (
    <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(currentView !== 'departments' || selectedDepartment || selectedArea) && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                if (currentView === 'count' && selectedItem) {
                  setSelectedItem(null);
                  setCurrentView('items');
                } else if (currentView === 'items' && selectedArea) {
                  setSelectedArea(null);
                  setCurrentView('areas');
                } else if (currentView === 'areas' && selectedDepartment) {
                  setSelectedDepartment(null);
                  setCurrentView('departments');
                }
              }}
              data-testid="button-back"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setSelectedDepartment(null);
              setSelectedArea(null);
              setSelectedItem(null);
              setCurrentView('departments');
            }}
            data-testid="button-home"
          >
            <HomeIcon className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-xl font-semibold">
              {currentView === 'count' && selectedItem ? selectedItem.name :
               currentView === 'items' ? `${selectedArea?.name || 'All'} Items` :
               currentView === 'areas' ? `${selectedDepartment?.name} Areas` :
               'Departments'}
            </h1>
            {operatorName && (
              <p className="text-sm text-muted-foreground">
                Operator: {operatorName}
              </p>
            )}
          </div>
        </div>

        <MenuDrawer
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onImportCSV={handleCsvImport}
          onClearData={handleClearData}
          onDownloadTemplate={handleDownloadTemplate}
          adminPin={adminPin}
          onSetAdminPin={setAdminPin}
        />
      </div>
    </div>
  );

  // Render departments view
  const renderDepartmentView = () => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Select Department</h2>
        <Button 
          onClick={() => setShowAddDept(true)}
          data-testid="button-add-department"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>
      
      {departmentsLoading ? (
        <div className="text-center py-8">Loading departments...</div>
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
                  <PackageIcon className="h-5 w-5 text-muted-foreground" />
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

  // Render areas view
  const renderAreaView = () => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Select Area</h2>
        <Button 
          onClick={() => setShowAddArea(true)}
          data-testid="button-add-area"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Area
        </Button>
      </div>
      
      {areasLoading ? (
        <div className="text-center py-8">Loading areas...</div>
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
                  <PackageIcon className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {filteredItems.length} items
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render items view
  const renderItemView = () => (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items or scan barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-items"
          />
        </div>
        <Button 
          variant="outline"
          onClick={startBarcodeScanner}
          data-testid="button-scan-barcode"
        >
          <ScanLineIcon className="h-4 w-4 mr-2" />
          Scan
        </Button>
      </div>
      
      {itemsLoading ? (
        <div className="text-center py-8">Loading items...</div>
      ) : (
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
                <CardTitle className="text-base">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.barcode && (
                  <p className="text-sm font-mono text-muted-foreground">
                    {item.barcode}
                  </p>
                )}
                {item.packVolume && (
                  <Badge variant="outline">{item.packVolume}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render count view
  const renderCountView = () => (
    <div className="p-4 space-y-6">
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedItem.name}</CardTitle>
            {selectedItem.barcode && (
              <p className="text-sm font-mono text-muted-foreground">
                {selectedItem.barcode}
              </p>
            )}
            {selectedItem.packVolume && (
              <Badge variant="outline">{selectedItem.packVolume}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fulls</label>
                <Input
                  type="number"
                  min="0"
                  value={fulls}
                  onChange={(e) => setFulls(e.target.value)}
                  placeholder="0"
                  className="text-center text-lg"
                  data-testid="input-fulls"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Singles</label>
                <Input
                  type="number"
                  min="0"
                  value={singles}
                  onChange={(e) => setSingles(e.target.value)}
                  placeholder="0"
                  className="text-center text-lg"
                  data-testid="input-singles"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleAddCount}
              className="w-full"
              size="lg"
              data-testid="button-record-count"
            >
              Record Count
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render scanner modal
  const renderScannerModal = () => (
    scannerActive && (
      <Dialog open={scannerActive} onOpenChange={() => stopBarcodeScanner()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
          </DialogHeader>
          <div 
            ref={scannerRef} 
            className="w-full h-64 bg-black rounded-lg overflow-hidden"
            data-testid="scanner-container"
          />
          <DialogFooter>
            <Button onClick={stopBarcodeScanner} variant="outline">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );

  return (
    <div className="min-h-screen bg-background">
      {renderHeader()}
      
      <main className="pb-4">
        {currentView === 'departments' && renderDepartmentView()}
        {currentView === 'areas' && renderAreaView()}
        {currentView === 'items' && renderItemView()}
        {currentView === 'count' && renderCountView()}
      </main>

      {renderScannerModal()}

      {/* Add Department Dialog */}
      <Dialog open={showAddDept} onOpenChange={setShowAddDept}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
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
              {createDepartmentMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Area Dialog */}
      <Dialog open={showAddArea} onOpenChange={setShowAddArea}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
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
              disabled={!newAreaName.trim() || !selectedDepartment || createAreaMutation.isPending}
              data-testid="button-save-area"
            >
              {createAreaMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}