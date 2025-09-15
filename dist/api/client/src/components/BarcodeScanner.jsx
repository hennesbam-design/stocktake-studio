import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CameraIcon, XIcon } from "lucide-react";
export function BarcodeScanner({ onScan, onClose }) {
    const videoRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment", // Back camera
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsScanning(true);
                    setError("");
                }
            }
            catch (err) {
                console.error("Camera error:", err);
                setError("Camera access denied. Please enable camera permissions.");
            }
        };
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
    const handleManualEntry = () => {
        const barcode = prompt("Enter barcode manually:");
        if (barcode?.trim()) {
            onScan(barcode.trim());
        }
    };
    const simulateScan = () => {
        // For demo purposes - simulate finding a barcode
        const demoBarcode = "1234567890123";
        onScan(demoBarcode);
    };
    return (<div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Barcode Scanner</h2>
        <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-scanner">
          <XIcon className="h-5 w-5"/>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {error ? (<Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <CameraIcon className="h-12 w-12 text-muted-foreground mx-auto"/>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleManualEntry} data-testid="button-manual-entry">
                Enter Barcode Manually
              </Button>
            </CardContent>
          </Card>) : (<div className="relative w-full max-w-lg aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg bg-black"/>
            
            {isScanning && (<div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-1 bg-primary shadow-lg animate-pulse"></div>
              </div>)}
          </div>)}
      </div>

      <div className="p-4 space-y-4 border-t">
        <Button onClick={simulateScan} className="w-full h-12" data-testid="button-demo-scan">
          Demo: Scan Sample Barcode
        </Button>
        
        <Button onClick={handleManualEntry} variant="outline" className="w-full h-12" data-testid="button-manual-barcode">
          Enter Barcode Manually
        </Button>
      </div>
    </div>);
}
