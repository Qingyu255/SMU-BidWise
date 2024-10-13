"use client"
import { useState } from "react";
import RoadmapForm from "../components/RoadmapForm";
import CreateRoadmapForm from "@/components/roadmap/CreateRoadmapForm";
import { FormStep } from "@/types";


export default function Page() {
    const [formStep, setFormStep] = useState<FormStep>(1)
    return (
        <>
            {formStep === 1 && (
                <RoadmapForm setFormStep={setFormStep} />
            )}
            {formStep === 2 && (
                <CreateRoadmapForm />
            )}
        </>
    )
}