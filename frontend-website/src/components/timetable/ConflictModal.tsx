"use client"
import React from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConflictModalProps {
  open: boolean;
  onResolve: (choice: string) => void;
}

export default function ConflictModal({ open, onResolve }: ConflictModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-[450px]">
        <DialogHeader className="max-w-[400px]">
          <div className="flex flex-row">
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            <DialogTitle className="flex items-center">Timetable Data Differs From Cloud</DialogTitle>
          </div>
          <DialogDescription>
            Your current timetable is different from the latest one saved on the cloud. Which version would you like to use?
          </DialogDescription>
          <div className="flex justify-center pt-1">
            <div className="w-fit flex flex-col space-y-2 text-center">
              <Button onClick={() => onResolve("database")} className="w-full">
                Use Latest Cloud Version
              </Button>

              <Button variant="secondary" onClick={() => onResolve("local")} className="w-full">
                Use Current Version
              </Button>

              <Button variant="outline" onClick={() => onResolve("merge")} className="w-full">
                Merge Timetables
              </Button>
            </div>
          </div>
        </DialogHeader>
        
      </DialogContent>
    </Dialog>
  );
};
