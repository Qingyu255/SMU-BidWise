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

const ConflictModal: React.FC<ConflictModalProps> = ({ open, onResolve }) => {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            <DialogTitle>Data Conflict Detected</DialogTitle>
          </div>
          <DialogDescription>
            Your local timetable is different from the one saved in the cloud. Which version would you like to use?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onResolve("database")}>
            Use Cloud Version
          </Button>
          <Button variant="secondary" onClick={() => onResolve("local")}>
            Use Local Version
          </Button>
          <Button variant="outline" onClick={() => onResolve("merge")}>
            Merge Timetables
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictModal;
