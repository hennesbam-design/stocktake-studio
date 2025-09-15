import { create } from 'zustand';
export const useStocktakeStore = create((set, get) => ({
    // Initial state
    currentSession: null,
    operatorName: '',
    adminPin: '',
    departments: [],
    areas: [],
    productGroups: [],
    items: [],
    entries: [],
    currentScreen: 'welcome',
    selectedDepartment: null,
    showBarcodeScanner: false,
    // Actions
    setOperatorName: (name) => set({ operatorName: name }),
    setCurrentScreen: (screen) => set({ currentScreen: screen }),
    setCurrentSession: (session) => set({ currentSession: session }),
    setSelectedDepartment: (department) => set({ selectedDepartment: department }),
    setShowBarcodeScanner: (show) => set({ showBarcodeScanner: show }),
    setAdminPin: (pin) => {
        // NOTE: Admin PIN is no longer stored in localStorage for security
        // PIN is only kept in memory during the session
        set({ adminPin: pin });
    },
    // Data actions
    setDepartments: (departments) => set({ departments }),
    setAreas: (areas) => set({ areas }),
    setProductGroups: (groups) => set({ productGroups: groups }),
    setItems: (items) => set({ items }),
    addEntry: (entry) => set((state) => ({
        entries: [entry, ...state.entries]
    })),
    clearEntries: () => set({ entries: [] }),
    // Import/Export actions
    importCSV: (data) => {
        // TODO: Parse CSV data and populate departments, areas, groups, and items
        // For now, just log the data
        console.log('Importing CSV data:', data);
    },
    exportCSV: () => {
        const { entries, items } = get();
        const csvData = entries.map(entry => {
            const item = items.find(i => i.id === entry.itemId);
            return {
                'Item Name': item?.name || 'Unknown',
                'Barcode': item?.barcode || '',
                'Fulls': entry.fulls,
                'Singles': entry.singles,
                'Notes': entry.notes || '',
                'Entered By': entry.enteredBy,
                'Date': entry.createdAt
            };
        });
        const csv = [
            Object.keys(csvData[0] || {}).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stocktake-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },
    exportJSON: () => {
        const { entries, items, departments, areas, productGroups } = get();
        const data = {
            entries,
            items,
            departments,
            areas,
            productGroups,
            exportDate: new Date().toISOString()
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stocktake-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}));
