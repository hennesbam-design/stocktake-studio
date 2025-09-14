import { useState } from "react";
import { MenuDrawer } from "../MenuDrawer";
import { ThemeProvider } from "../ThemeProvider";

function MenuDrawerDemo() {
  const [adminPin, setAdminPin] = useState("");

  const handleExportCSV = () => {
    console.log('Exporting CSV...');
  };

  const handleExportJSON = () => {
    console.log('Exporting JSON...');
  };

  const handleImportCSV = (file: File) => {
    console.log('Importing CSV:', file.name);
  };

  const handleClearData = () => {
    console.log('Clearing all data...');
  };

  const handleSetAdminPin = (pin: string) => {
    setAdminPin(pin);
    console.log('Admin PIN set');
  };

  const handleDownloadTemplate = () => {
    console.log('Downloading CSV template...');
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Stocktake Studio</h1>
        <MenuDrawer
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onImportCSV={handleImportCSV}
          onClearData={handleClearData}
          onDownloadTemplate={handleDownloadTemplate}
          adminPin={adminPin}
          onSetAdminPin={handleSetAdminPin}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Click the menu icon to access settings and tools.
      </p>
    </div>
  );
}

export default function MenuDrawerExample() {
  return (
    <ThemeProvider>
      <MenuDrawerDemo />
    </ThemeProvider>
  );
}