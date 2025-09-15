const mockAreas: Area[] = [
  { id: "a1", departmentId: "1", name: "Beverages" },
  { id: "a2", departmentId: "1", name: "Computers" },
];

const mockGroups: ProductGroup[] = [
  { id: "g1", areaId: "a1", name: "Soda" },
  { id: "g2", areaId: "a1", name: "Juice" },
  { id: "g3", areaId: "a2", name: "Headphones" },
  { id: "g5", areaId: "a2", name: "Laptops" },
];
import { useState } from "react";
import { CountScreen } from "../CountScreen";
import type { Department, Area, ProductGroup, Item, StocktakeEntry } from "@shared/schema";

const mockDepartment: Department = {
  id: "1",
  name: "Electronics",
  description: "TV, Audio, Computing & Gaming"
};

const mockItems: Item[] = [
  {
    id: "1",
    name: "Coke 330ml",
    barcode: "1234567890123",
    groupId: "g1",
    defaultFulls: 2,
    defaultSingles: 1,
    packVolume: null
  },
  {
    id: "2",
    name: "Sprite 330ml",
    barcode: "2345678901234",
    groupId: "g1",
    defaultFulls: 1,
    defaultSingles: 1,
    packVolume: null
  },
  {
    id: "3",
    name: "Fanta 330ml",
    barcode: "3456789012345",
    groupId: "g2",
    defaultFulls: 0,
    defaultSingles: 0,
    packVolume: null
  },
  {
    id: "4",
    name: "Pepsi 330ml",
    barcode: "4567890123456",
    groupId: "g2",
    defaultFulls: 2,
    defaultSingles: 1,
    packVolume: null
  },
  {
    id: "5",
    name: "Sony WH-1000XM4 Headphones",
    barcode: "3456789012345",
    groupId: "3",
    defaultFulls: 1,
    defaultSingles: 0,
    packVolume: null
  },
  {
    id: "6",
    name: "Apple MacBook Pro 16\"",
    barcode: "4567890123456",
    groupId: "5",
    defaultFulls: 0,
    defaultSingles: 1,
    packVolume: null
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