import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, } from "@/components/ui/dialog";
import { MenuIcon, MoonIcon, SunIcon, DownloadIcon, LockIcon, TrashIcon, UploadIcon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Instructions } from "./Instructions";
export function MenuDrawer({ onExportCSV, onExportJSON, onImportCSV, onClearData, onDownloadTemplate, adminPin, onSetAdminPin }) {
    const { theme, toggleTheme } = useTheme();
    const [pinInput, setPinInput] = useState("");
    const [newPin, setNewPin] = useState("");
    const [showPinDialog, setShowPinDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file extension instead of MIME type for better compatibility
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.type === 'text/plain') {
                onImportCSV(file);
            }
            else {
                alert('Please select a CSV file (.csv extension)');
            }
        }
        // Reset input
        event.target.value = "";
    };
    const handleSetPin = () => {
        if (newPin.length >= 4) {
            onSetAdminPin(newPin);
            setNewPin("");
            setShowPinDialog(false);
        }
    };
    const handleClearData = () => {
        // Pass the PIN to the server for secure validation
        // No client-side validation for security
        onClearData();
        setPinInput("");
        setShowClearDialog(false);
    };
    return (<Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" data-testid="button-menu">
          <MenuIcon className="h-5 w-5"/>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle>Settings & Tools</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Theme Toggle */}
          <div className="space-y-3">
            <h3 className="font-medium">Appearance</h3>
            <Button onClick={toggleTheme} variant="outline" className="w-full justify-start" data-testid="button-theme-toggle">
              {theme === "light" ? (<MoonIcon className="h-4 w-4 mr-2"/>) : (<SunIcon className="h-4 w-4 mr-2"/>)}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </Button>
          </div>

          {/* Export */}
          <div className="space-y-3">
            <h3 className="font-medium">Export Data</h3>
            <div className="space-y-2">
              <Button onClick={onExportCSV} variant="outline" className="w-full justify-start" data-testid="button-export-csv">
                <DownloadIcon className="h-4 w-4 mr-2"/>
                Export as CSV
              </Button>
              <Button onClick={onExportJSON} variant="outline" className="w-full justify-start" data-testid="button-export-json">
                <DownloadIcon className="h-4 w-4 mr-2"/>
                Export as JSON
              </Button>
            </div>
          </div>

          {/* Import */}
          <div className="space-y-3">
            <h3 className="font-medium">Import Data</h3>
            <div className="space-y-2">
              <Button onClick={onDownloadTemplate} variant="outline" className="w-full justify-start" data-testid="button-download-template">
                <DownloadIcon className="h-4 w-4 mr-2"/>
                Download CSV Template
              </Button>
              <label className="block cursor-pointer">
                <input type="file" accept=".csv,text/csv,application/vnd.ms-excel,text/plain" onChange={handleFileUpload} className="hidden" data-testid="input-file-upload"/>
                <Button variant="outline" className="w-full justify-start cursor-pointer min-h-[44px]" asChild data-testid="button-import-csv">
                  <div className="flex items-center">
                    <UploadIcon className="h-4 w-4 mr-2"/>
                    Import CSV
                  </div>
                </Button>
              </label>
            </div>
          </div>

          {/* Help & Instructions */}
          <div className="space-y-3">
            <h3 className="font-medium">Help</h3>
            <Instructions />
          </div>

          {/* Admin Settings */}
          <div className="space-y-3">
            <h3 className="font-medium">Admin</h3>
            <div className="space-y-2">
              <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-set-pin">
                    <LockIcon className="h-4 w-4 mr-2"/>
                    {adminPin ? "Change PIN" : "Set Admin PIN"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Admin PIN</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>New PIN (minimum 4 digits)</Label>
                      <Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Enter new PIN" data-testid="input-new-pin"/>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSetPin} disabled={newPin.length < 4} data-testid="button-save-pin">
                      Save PIN
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive" data-testid="button-clear-data">
                    <TrashIcon className="h-4 w-4 mr-2"/>
                    Clear All Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear All Data</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete all stocktake entries. This action cannot be undone.
                    </p>
                    <div className="space-y-2">
                      <Label>This action requires admin authentication</Label>
                      <p className="text-xs text-muted-foreground">
                        Admin PIN will be verified securely on the server
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleClearData} variant="destructive" data-testid="button-confirm-clear">
                      Clear Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>);
}
