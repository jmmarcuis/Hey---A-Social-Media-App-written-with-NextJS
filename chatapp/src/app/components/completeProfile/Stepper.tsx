"use client";
import { usePathname } from "next/navigation";

const Stepper = () => {
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
            label: "Confirm Details",
        },
    ];

    // Get the current path
    const currentPath = usePathname();
    
    // Find the current step index based on the path
    const currentStepIndex = steps.findIndex((step) => currentPath.includes(step.id));

    // Helper function to determine if a step is completed
    const isStepCompleted = (index: number) => {
        return index < currentStepIndex;
    };

    return (
        <div className="w-full mb-10">
            <div className="flex justify-between">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col border-gray-900">
                            <div
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center
                                    border-2 font-medium text-sm mb-2
                                    ${isStepCompleted(index)
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : index === currentStepIndex
                                            ? 'border-blue-600 bg-blue-600 text-white dark:border-white dark:bg-white dark:text-black'
                                            : 'border-gray-300 text-gray-400 dark:border-gray-600'}
                                `}
                            >
                                {isStepCompleted(index) ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <div>
                                {/* Step number */}
                                <span className="hidden sm:block text-xs text-black dark:text-white">
                                    Step {index + 1}
                                </span>
                                
                                {/* Step label */}
                                <span className={`
                                    hidden sm:block text-xs
                                    ${isStepCompleted(index) || index === currentStepIndex
                                        ? 'text-black dark:text-white'
                                        : 'text-gray-400 dark:text-gray-500'}
                                `}>
                                    {step.label}
                                </span>
                                
                                {/* Status label */}
                                <span className={`
                                    hidden sm:block text-xs font-semibold
                                    ${isStepCompleted(index)
                                        ? 'text-green-600 dark:text-green-400'
                                        : index === currentStepIndex
                                            ? 'text-blue-800 dark:text-white'
                                            : 'text-gray-400 dark:text-gray-500'}
                                `}>
                                    {isStepCompleted(index)
                                        ? 'Completed'
                                        : index === currentStepIndex
                                            ? 'In Progress'
                                            : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stepper;