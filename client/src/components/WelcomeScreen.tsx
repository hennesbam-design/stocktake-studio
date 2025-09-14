import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeScreenProps {
  onContinue: (operator1: string, operator2: string, date: string) => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [operator1, setOperator1] = useState(() => {
    return localStorage.getItem("stocktake-operator1") || "";
  });
  const [operator2, setOperator2] = useState(() => {
    return localStorage.getItem("stocktake-operator2") || "";
  });
  const [date, setDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const handleContinue = () => {
    if (!operator1.trim()) return;
    
    localStorage.setItem("stocktake-operator1", operator1);
    localStorage.setItem("stocktake-operator2", operator2);
    onContinue(operator1, operator2, date);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold">
            Stocktake{" "}
            <span className="text-blue-600">Studio</span>
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Start your inventory count session
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operator1-name">Operator 1 Name</Label>
              <Input
                id="operator1-name"
                placeholder="Enter operator 1 name"
                value={operator1}
                onChange={(e) => setOperator1(e.target.value)}
                className="h-12"
                data-testid="input-operator1-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operator2-name">Operator 2 Name (Optional)</Label>
              <Input
                id="operator2-name"
                placeholder="Enter operator 2 name"
                value={operator2}
                onChange={(e) => setOperator2(e.target.value)}
                className="h-12"
                data-testid="input-operator2-name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12"
              data-testid="input-date"
            />
          </div>

          <Button
            onClick={handleContinue}
            className="w-full h-12 text-base"
            disabled={!operator1.trim()}
            data-testid="button-continue"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}