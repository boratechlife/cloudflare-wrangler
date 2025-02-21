// Define the HTML for each step
export const stepHTML = (stepNumber: number) => {
  const steps = [
    `<div class="flex flex-col items-center relative z-10">
       <div class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-medium">1</div>
       <span class="mt-2 text-gray-600 text-sm">Search</span>
       <div class="absolute top-4 left-full w-8 sm:w-16 lg:w-24 border-t-2 border-gray-200 transform translate-y-1/2"></div>
     </div>`,
    `<div class="flex flex-col items-center relative z-10">
       <div class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-medium">2</div>
       <span class="mt-2 text-gray-600 text-sm">Select</span>
       <div class="absolute top-4 left-full w-8 sm:w-16 lg:w-24 border-t-2 border-gray-200 transform translate-y-1/2"></div>
     </div>`,
    `<div class="flex flex-col items-center relative z-10">
       <div class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-medium">3</div>
       <span class="mt-2 text-gray-600 text-sm">Confirm</span>
       <div class="absolute top-4 left-full w-8 sm:w-16 lg:w-24 border-t-2 border-gray-200 transform translate-y-1/2"></div>
     </div>`,
    `<div class="flex flex-col items-center relative z-10">
       <div class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-medium">4</div>
       <span class="mt-2 text-gray-600 text-sm">Pay</span>
       <div class="absolute top-4 left-full w-8 sm:w-16 lg:w-24 border-t-2 border-gray-200 transform translate-y-1/2"></div>
     </div>`,
    `<div class="flex flex-col items-center z-10">
       <div class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-medium">5</div>
       <span class="mt-2 text-gray-600 text-sm">Done</span>
     </div>`,
  ];

  // Highlight the current step and un-highlight the rest
  return steps
    .map((step, index) => {
      if (index  === stepNumber) {
        return step
          .replace('bg-gray-400', 'bg-blue-600') // Highlight current step
          .replace('text-gray-600', 'text-blue-600'); // Change text color for active step
      }
      return step;
    })
    .join('');
};