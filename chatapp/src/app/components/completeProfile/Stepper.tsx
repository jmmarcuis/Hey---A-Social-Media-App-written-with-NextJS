"use client";
import { usePathname } from "next/navigation";

export default function Stepper() {
    // Step definitions
    const steps = [
        {
            id: "personalinfo",
            label: "Personal Information",
        },
        {
            id: "customization",
            label: "Customization",

        },
        {
            id: "confirmdetails",
            label: "Confirm",

        },
    ];

    // Get the current path
    const currentPath = usePathname();

    // Find the current step index
    const currentStepIndex = steps.findIndex(
        (step) => currentPath.split("/").pop() === step.id
    );

    return (
        <ol className="overflow-hidden space-y-8">
            {steps.map((step, index) => {
                const isCurrentStep = index === currentStepIndex;
                const isPastStep = index < currentStepIndex;

                return (
                    <li
                        key={step.id}
                        className={`relative flex-1 ${index < steps.length - 1
                                ? "after:content-[''] after:w-0.5 after:h-full after:bg-gray-200 dark:after:bg-gray-700 after:inline-block after:absolute after:-bottom-12 after:left-1/2"
                                : ""
                            }`}
                    >
                        <div className="flex items-center justify-center w-54 mx-auto">
                            <div
                                className={`flex items-center gap-3.5 p-3.5 rounded-xl relative z-10 border w-full ${isPastStep
                                        ? "bg-green-50 dark:bg-gray-800 border-green-300 border-2 dark:border-gray-700"
                                        : isCurrentStep
                                            ? "bg-blue-100 border-blue-400 border-2"
                                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                    }`}
                            >
                                {/* Step Icon */}
                                <div
                                    className={`rounded-full ${isPastStep
                                            ? "bg-green-500 dark:bg-white"
                                            : isCurrentStep
                                                ? "bg-blue-500 dark:bg-white"
                                                : "bg-gray-200 dark:bg-gray-700"
                                        } flex items-center justify-center`}
                                >
                                    <span
                                        className={`p-3 ${isPastStep || isCurrentStep
                                                ? "text-white dark:text-black"
                                                : "text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                    </span>
                                </div>

                                {/* Step Details */}
                                <div className="flex items-start justify-center flex-col">
                                    <h6
                                        className={`text-base font-semibold mb-0.5 ${isPastStep || isCurrentStep
                                                ? "text-black dark:text-white"
                                                : "text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </h6>

                                </div>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
