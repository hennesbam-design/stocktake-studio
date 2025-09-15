import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircleIcon } from "lucide-react";
export function Instructions({ trigger }) {
    const defaultTrigger = (<Button variant="outline" className="w-full justify-start" data-testid="button-instructions">
      <HelpCircleIcon className="h-4 w-4 mr-2"/>
      How to Use
    </Button>);
    return (<Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>How to Use Stocktake Studio</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            
            <section>
              <h3 className="font-semibold text-base mb-2 text-cyan-600">Getting Started</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>1. Enter the <strong>stocktake date</strong> and <strong>operator names</strong> on the welcome screen</p>
                <p>2. Select the <strong>department</strong> you want to count from the grid</p>
                <p>3. Navigate through <strong>areas</strong> → <strong>product groups</strong> → <strong>items</strong></p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-cyan-600">Counting Items</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• <strong>Scan barcodes</strong> or use the search to find items quickly</p>
                <p>• Enter <strong>fulls</strong> (full cases/boxes) and <strong>singles</strong> (individual items)</p>
                <p>• Tap the <strong>Save Count</strong> button to record your entry</p>
                <p>• Use the back arrow to navigate between levels</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-cyan-600">Managing Data</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• <strong>Export</strong>: Download your stocktake data as CSV or JSON</p>
                <p>• <strong>Import</strong>: Upload a CSV file with item master data</p>
                <p>• <strong>Template</strong>: Download a blank CSV template for bulk imports</p>
                <p>• <strong>Clear Data</strong>: Remove all stocktake entries (requires admin PIN if set)</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-cyan-600">CSV Import Format</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Your CSV file should include these columns:</p>
                <div className="ml-4 space-y-1 font-mono text-xs bg-muted p-2 rounded">
                  <div>• Item Name</div>
                  <div>• Barcode</div>
                  <div>• Department</div>
                  <div>• Area</div>
                  <div>• Product Group</div>
                  <div>• Default Fulls</div>
                  <div>• Default Singles</div>
                </div>
                <p className="text-xs">Note: Any existing count columns in your CSV will be ignored during import.</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-cyan-600">Tips for Efficient Stocktaking</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Work with a partner - one person counts while the other enters data</p>
                <p>• Use the barcode scanner for speed and accuracy</p>
                <p>• Double-check high-value items before saving</p>
                <p>• Export data regularly as a backup</p>
                <p>• Set an admin PIN to prevent accidental data deletion</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-cyan-600">Touch Controls</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Tap cards and buttons to navigate</p>
                <p>• Use the number pad for quick count entry</p>
                <p>• Swipe or scroll to view more items</p>
                <p>• Large touch targets designed for tablet use</p>
              </div>
            </section>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>);
}
