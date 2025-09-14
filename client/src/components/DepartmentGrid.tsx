import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "lucide-react";
import type { Department } from "@shared/schema";

interface DepartmentGridProps {
  departments: Department[];
  onSelectDepartment: (department: Department) => void;
}

export function DepartmentGrid({ departments, onSelectDepartment }: DepartmentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {departments.map((department) => (
        <Card
          key={department.id}
          className="min-h-32 hover-elevate cursor-pointer transition-all duration-200 active:scale-95"
          onClick={() => onSelectDepartment(department)}
          data-testid={`card-department-${department.id}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              {department.name}
            </CardTitle>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {department.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {department.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Tap to start counting
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}