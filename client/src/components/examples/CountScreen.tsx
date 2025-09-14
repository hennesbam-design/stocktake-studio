import { useState } from "react";
import { CountScreen } from "../CountScreen";
import type { Department, Area, ProductGroup, Item, StocktakeEntry } from "@shared/schema";

const mockDepartment: Department = {
  id: "1",
  name: "Electronics",
  description: "TV, Audio, Computing & Gaming"
};

const mockAreas: Area[] = [
  { id: "1", departmentId: "1", name: "Television" },
  { id: "2", departmentId: "1", name: "Audio Equipment" },
  { id: "3", departmentId: "1", name: "Computing" },
];

const mockGroups: ProductGroup[] = [
  { id: "1", areaId: "1", name: "Smart TVs" },
  { id: "2", areaId: "1", name: "Gaming Monitors" },
  { id: "3", areaId: "2", name: "Headphones" },
  { id: "4", areaId: "2", name: "Speakers" },
  { id: "5", areaId: "3", name: "Laptops" },
  { id: "6", areaId: "3", name: "Accessories" },
];

const mockItems: Item[] = [
  {
    id: "1",
    name: "Samsung 55\" Smart TV",
    barcode: "1234567890123",
    groupId: "1",
    defaultFulls: 0,
    defaultSingles: 1
  },
  {
    id: "2", 
    name: "LG OLED 65\" TV",
    barcode: "2345678901234",
    groupId: "1",
    defaultFulls: 0,
    defaultSingles: 1
  },
  {
    id: "3",
    name: "Sony WH-1000XM4 Headphones",
    barcode: "3456789012345",
    groupId: "3",
    defaultFulls: 1,
    defaultSingles: 0
  },
  {
    id: "4",
    name: "Apple MacBook Pro 16\"",
    barcode: "4567890123456", 
    groupId: "5",
    defaultFulls: 0,
    defaultSingles: 1
  },
];

export default function CountScreenExample() {
  const [entries, setEntries] = useState<StocktakeEntry[]>([]);

  const handleBack = () => {
    console.log('Back button clicked');
  };

  const handleScanBarcode = () => {
    console.log('Scan barcode clicked');
  };

  const handleAddEntry = (entry: { itemId: string; fulls: number; singles: number; notes: string }) => {
    const newEntry: StocktakeEntry = {
      id: Math.random().toString(),
      sessionId: "session-1",
      itemId: entry.itemId,
      fulls: entry.fulls,
      singles: entry.singles,
      notes: entry.notes,
      enteredBy: "Demo User",
      createdAt: new Date(),
    };
    
    setEntries(prev => [newEntry, ...prev]);
    console.log('Entry added:', newEntry);
  };

  return (
    <CountScreen
      department={mockDepartment}
      areas={mockAreas}
      groups={mockGroups}
      items={mockItems}
      entries={entries}
      operatorName="Demo User"
      onBack={handleBack}
      onScanBarcode={handleScanBarcode}
      onAddEntry={handleAddEntry}
    />
  );
}