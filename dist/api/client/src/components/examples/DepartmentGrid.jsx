import { DepartmentGrid } from "../DepartmentGrid";
const mockDepartments = [
    {
        id: "1",
        name: "Electronics",
        description: "TV, Audio, Computing & Gaming"
    },
    {
        id: "2",
        name: "Grocery",
        description: "Food, Beverages & Household Items"
    },
    {
        id: "3",
        name: "Clothing",
        description: "Apparel, Shoes & Accessories"
    },
    {
        id: "4",
        name: "Home & Garden",
        description: "Furniture, Decor & Outdoor"
    },
    {
        id: "5",
        name: "Health & Beauty",
        description: "Pharmacy, Cosmetics & Personal Care"
    },
    {
        id: "6",
        name: "Sports & Outdoors",
        description: "Fitness, Camping & Recreation"
    }
];
export default function DepartmentGridExample() {
    const handleSelectDepartment = (department) => {
        console.log('Department selected:', department.name);
    };
    return (<div className="min-h-screen bg-background">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Select Department</h1>
        <DepartmentGrid departments={mockDepartments} onSelectDepartment={handleSelectDepartment}/>
      </div>
    </div>);
}
