export 	  const widgetHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hotel Booking Widget</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/htmx.org"></script>
<style>
/* Add dark theme preference */
:root {
    --primary-color: #333;
    --secondary-color: #444;
    --background-color: #222;
    --text-color: #fff;
}
body {
    background-color: var(--background-color);
    color: var(--text-color);
}
.placeholder {
    color: #ccc;
    font-size: 0.75rem;
}
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<link rel="stylesheet" href="https://kit.fontawesome.com/your-fontawesome-kit.js" crossorigin="anonymous">
</head>
<body class="flex justify-center items-center h-screen">
<div class="bg-gray-800 p-4 rounded-lg shadow-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4 sm:p-6">
<h1 class="text-3xl font-bold mb-4 text-center">Book your Kumbh Mela Stay</h1>
<form               
hx-post="/submit" 
method="POST"
id="booking-form" 
              hx-swap="none">
    <div class="mb-4 flex flex-col sm:flex-row justify-between">
        <div class="w-full sm:w-1/2 mr-0 sm:mr-2 relative mb-4 sm:mb-0">
            <label for="date-range" class="block text-xs font-medium mb-2">Date Range:</label>
            <input type="text" id="date-range" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" readonly placeholder="Select date range" style="font-size: 0.75rem;">
            <i class="fas fa-calendar absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400"></i>
        </div>
        <div class="w-full sm:w-1/2">
            <label for="booking-type" class="block text-xs font-medium mb-2">Booking Type:</label>
            <select id="booking-type" name="booking-type" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500">
                <option value="" class="placeholder" style="font-size: 0.75rem;">Select booking type</option>
                <option value="daily" style="font-size: 0.75rem;">Daily</option>
                <option value="night-only" style="font-size: 0.75rem;">Night Only</option>
                <option value="hourly" style="font-size: 0.75rem;">Hourly</option>
            </select>
        </div>
    </div>
    <div class="mb-4 flex flex-col sm:flex-row justify-between">
        <div class="w-full sm:w-1/2 mr-0 sm:mr-2 mb-4 sm:mb-0">
            <label for="room-type" class="block text-xs font-medium mb-2">Room Type:</label>
            <select id="room-type" name="room-type" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500">
                <option value="" class="placeholder" style="font-size: 0.75rem;">Select room type</option>
                <option value="single" style="font-size: 0.75rem;">Single</option>
                <option value="double" style="font-size: 0.75rem;">Double</option>
                <option value="suite" style="font-size: 0.75rem;">Suite</option>
            </select>
        </div>
        <div class="w-full sm:w-1/2">
            <label for="adults" class="block text-xs font-medium mb-2">No. of Adults:</label>
            <input type="number" id="adults" name="adults" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" min="1" max="10" value="1" placeholder="Enter No. of adults" style="font-size: 0.75rem;">
        </div>
    </div>
    <div class="mb-4 flex flex-col sm:flex-row justify-between">
        <div class="w-full sm:w-1/2 mr-0 sm:mr-2 mb-4 sm:mb-0">
            <label for="children" class="block text-xs font-medium mb-2">No. of Children:</label>
            <input type="number" id="children" name="children" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" min="0" max="10" value="0" placeholder="Enter No. of children" style="font-size: 0.75rem;">
        </div>
        <div class="w-full sm:w-1/2">
            <label for="nights" class="block text-xs font-medium mb-2">No. of Nights/Hours:</label>
            <input type="number" id="nights" name="nights" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" min="1" max="30" value="1" placeholder="Enter No. of nights/hours" style="font-size: 0.75rem;">
        </div>
    </div>
    <div class="mb-4 flex flex-col sm:flex-row justify-between">
        <div class="w-full sm:w-1/2 mr-0 sm:mr-2 mb-4 sm:mb-0">
            <label for="first-name" class="block text-xs font-medium mb-2">First Name:</label>
            <input type="text" id="first-name" name="first-name" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" placeholder="Enter first name" style="font-size: 0.75rem;">
        </div>
        <div class="w-full sm:w-1/2">
            <label for="last-name" class="block text-xs font-medium mb-2">Last Name:</label>
            <input type="text" id="last-name" name="last-name" class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" placeholder="Enter last name" style="font-size: 0.75rem;">
        </div>
    </div>
    <div class="mb-4 flex flex-col sm:flex-row justify-between">
        <div class="w-full sm:w-1/2 mr-0 sm:mr-2 mb-4 sm:mb-0 relative">
            <label for="phone" class="block text-xs font-medium mb-2">Phone Number:</label>
            <div class="flex">
                <select id="country-code" name="country-cod" class="block w-20 p-2 pl-2 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500">
                    <option value="+1" style="font-size: 0.75rem;">+1 (USA)</option>
                    <option value="+91" style="font-size: 0.75rem;">+91 (India)</option>
                    <option value="+44" style="font-size: 0.75rem;">+44 (UK)</option>
                    <option value="+61" style="font-size: 0.75rem;">+61 (Australia)</option>
                    <option value="+86" style="font-size: 0.75rem;">+86 (China)</option>
                    <option value="+27" style="font-size: 0.75rem;">+27 (South Africa)</option>
                    <option value="+33" style="font-size: 0.75rem;">+33 (France)</option>
                    <option value="+49" style="font-size: 0.75rem;">+49 (Germany)</option>
                    <option value="+55" style="font-size: 0.75rem;">+55 (Brazil)</option>
                    <option value="+57" style="font-size: 0.75rem;">+57 (Colombia)</option>
                    <option value="+60" style="font-size: 0.75rem;">+60 (Malaysia)</option>
                    <option value="+65" style="font-size: 0.75rem;">+65 (Singapore)</option>
                    <option value="+81" style="font-size: 0.75rem;">+81 (Japan)</option>
                    <option value="+82" style="font-size: 0.75rem;">+82 (South Korea)</option>
                    <option value="+351" style="font-size: 0.75rem;">+351 (Portugal)</option>
                    <option value="+358" style="font-size: 0.75rem;">+358 (Finland)</option>
                    <option value="+359" style="font-size: 0.75rem;">+359 (Bulgaria)</option>
                    <option value="+370" style="font-size: 0.75rem;">+370 (Lithuania)</option>
                    <option value="+371" style="font-size: 0.75rem;">+371 (Latvia)</option>
                    <option value="+372" style="font-size: 0.75rem;">+372 (Estonia)</option>
                    <option value="+373" style="font-size: 0.75rem;">+373 (Moldova)</option>
                    <option value="+374" style="font-size: 0.75rem;">+374 (Armenia)</option>
                    <option value="+375" style="font-size: 0.75rem;">+375 (Belarus)</option>
                    <option value="+376" style="font-size: 0.75rem;">+376 (Andorra)</option>
                    <option value="+377" style="font-size: 0.75rem;">+377 (Monaco)</option>
                    <option value="+378" style="font-size: 0.75rem;">+378 (San Marino)</option>
                    <option value="+379" style="font-size: 0.75rem;">+379 (Vatican City)</option>
                    <option value="+380" style="font-size: 0.75rem;">+380 (Ukraine)</option>
                    <option value="+381" style="font-size: 0.75rem;">+381 (Serbia)</option>
                    <option value="+382" style="font-size: 0.75rem;">+382 (Montenegro)</option>
                    <option value="+383" style="font-size: 0.75rem;">+383 (Kosovo)</option>
                    <option value="+384" style="font-size: 0.75rem;">+384 (Albania)</option>
                    <option value="+385" style="font-size: 0.75rem;">+385 (Croatia)</option>
                    <option value="+386" style="font-size: 0.75rem;">+386 (Slovenia)</option>
                    <option value="+387" style="font-size: 0.75rem;">+387 (Bosnia and Herzegovina)</option>
                    <option value="+388" style="font-size: 0.75rem;">+388 (European Telecommunications Standards Institute)</option>
                    <option value="+389" style="font-size: 0.75rem;">+389 (North Macedonia)</option>
                    <option value="+420" style="font-size: 0.75rem;">+420 (Czech Republic)</option>
                    <option value="+421" style="font-size: 0.75rem;">+421 (Slovakia)</option>
                    <option value="+423" style="font-size: 0.75rem;">+423 (Liechtenstein)</option>
                    <option value="+500" style="font-size: 0.75rem;">+500 (Falkland Islands)</option>
                    <option value="+501" style="font-size: 0.75rem;">+501 (Belize)</option>
                    <option value="+502" style="font-size: 0.75rem;">+502 (Guatemala)</option>
                    <option value="+503" style="font-size: 0.75rem;">+503 (El Salvador)</option>
                    <option value="+504" style="font-size: 0.75rem;">+504 (Honduras)</option>
                    <option value="+505" style="font-size: 0.75rem;">+505 (Nicaragua)</option>
                    <option value="+506" style="font-size: 0.75rem;">+506 (Costa Rica)</option>
                    <option value="+507" style="font-size: 0.75rem;">+507 (Panama)</option>
                    <option value="+508" style="font-size: 0.75rem;">+508 (Saint Pierre and Miquelon)</option>
                    <option value="+509" style="font-size: 0.75rem;">+509 (Haiti)</option>
                    <option value="+51" style="font-size: 0.75rem;">+51 (Peru)</option>
                    <option value="+52" style="font-size: 0.75rem;">+52 (Mexico)</option>
                    <option value="+53" style="font-size: 0.75rem;">+53 (Cuba)</option>
                    <option value="+54" style="font-size: 0.75remoption>
                    <option value="+55" style="font-size: 0.75rem;">+55 (Brazil)</option>
                    <option value="+56" style="font-size: 0.75rem;">+56 (Chile)</option>
                    <option value="+57" style="font-size: 0.75rem;">+57 (Colombia)</option>
                    <option value="+58" style="font-size: 0.75rem;">+58 (Venezuela)</option>
                    <option value="+590" style="font-size: 0.75rem;">+590 (Guadeloupe)</option>
                    <option value="+591" style="font-size: 0.75rem;">+591 (Bolivia)</option>
                    <option value="+592" style="font-size: 0.75rem;">+592 (Guyana)</option>
                    <option value="+593" style="font-size: 0.75rem;">+593 (Ecuador)</option>
                    <option value="+594" style="font-size: 0.75rem;">+594 (French Guiana)</option>
                    <option value="+595" style="font-size: 0.75rem;">+595 (Paraguay)</option>
                    <option value="+596" style="font-size: 0.75rem;">+596 (Martinique)</option>
                    <option value="+597" style="font-size: 0.75rem;">+597 (Suriname)</option>
                    <option value="+598" style="font-size: 0.75rem;">+598 (Uruguay)</option>
                    <option value="+599" style="font-size: 0.75rem;">+599 (Aruba)</option>
                    <option value="+670" style="font-size: 0.75rem;">+670 (East Timor)</option>
                    <option value="+671" style="font-size: 0.75rem;">+671 (Guam)</option>
                    <option value="+672" style="font-size: 0.75rem;">+672 (Norfolk Island)</option>
                    <option value="+673" style="font-size: 0.75rem;">+673 (Brunei)</option>
                    <option value="+674" style="font-size: 0.75rem;">+674 (Nauru)</option>
                    <option value="+675" style="font-size: 0.75rem;">+675 (Papua New Guinea)</option>
                    <option value="+676" style="font-size: 0.75rem;">+676 (Tonga)</option>
                    <option value="+677" style="font-size: 0.75rem;">+677 (Solomon Islands)</option>
                    <option value="+678" style="font-size: 0.75rem;">+678 (Vanuatu)</option>
                    <option value="+679" style="font-size: 0.75rem;">+679 (Fiji)</option>
                    <option value="+680" style="font-size: 0.75rem;">+680 (Palau)</option>
                    <option value="+681" style="font-size: 0.75rem;">+681 (Wallis and Futuna)</option>
                    <option value="+682" style="font-size: 0.75rem;">+682 (Cook Islands)</option>
                    <option value="+683" style="font-size: 0.75rem;">+683 (Niue)</option>
                    <option value="+684" style="font-size: 0.75rem;">+684 (American Samoa)</option>
                    <option value="+685" style="font-size: 0.75rem;">+685 (Samoa)</option>
                    <option value="+686" style="font-size: 0.75rem;">+686 (Kiribati)</option>
                    <option value="+687" style="font-size: 0.75rem;">+687 (New Caledonia)</option>
                    <option value="+688" style="font-size: 0.75rem;">+688 (Tuvalu)</option>
                    <option value="+689" style="font-size: 0.75rem;">+689 (French Polynesia)</option>
                    <option value="+690" style="font-size: 0.75rem;">+690 (Tokelau)</option>
                    <option value="+691" style="font-size: 0.75rem;">+691 (Marshall Islands)</option>
                    <option value="+692" style="font-size: 0.75rem;">+692 (Micronesia)</option>
                    <option value="+7" style="font-size: 0.75rem;">+7 (Russia)</option>
                    <option value="+81" style="font-size: 0.75rem;">+81 (Japan)</option>
                    <option value="+82" style="font-size: 0.75rem;">+82 (South Korea)</option>
                    <option value="+84" style="font-size: 0.75rem;">+84 (Vietnam)</option>
                    <option value="+850" style="font-size: 0.75rem;">+850 (North Korea)</option>
                    <option value="+852" style="font-size: 0.75rem;">+852 (Hong Kong)</option>
                    <option value="+853" style="font-size: 0.75rem;">+853 (Macau)</option>
                    <option value="+855" style="font-size: 0.75rem;">+855 (Cambodia)</option>
                    <option value="+856" style="font-size: 0.75rem;">+856 (Laos)</option>
                    <option value="+857" style="font-size: 0.75rem;">+857 (China)</option>
                    <option value="+858" style="font-size: 0.75rem;">+858 (China)</option>
                    <option value="+859" style="font-size: 0.75rem;">+859 (China)</option>
                    <option value="+86" style="font-size: 0.75rem;">+86 (China)</option>
                    <option value="+870" style="font-size: 0.75rem;">+870 (Inmarsat)</option>
                    <option value="+871" style="font-size: 0.75rem;">+871 (Inmarsat)</option>
                    <option value="+872" style="font-size: 0.75rem;">+872 (Inmarsat)</option>
                    <option value="+873" style="font-size: 0.75rem;">+873 (Inmarsat)</option>
                    <option value="+874" style="font-size: 0.75rem;">+874 (Inmarsat)</option>
                    <option value="+875" style="font-size: 0.75rem;">+875 (Inmarsat)</option>
                    <option value="+876" style="font-size: 0.75rem;">+876 (Inmarsat)</option>
                    <option value="+877" style="font-size: 0.75rem;">+877 (Inmarsat)</option>
                    <option value="+878" style="font-size: 0.75rem;">+878 (Universal Personal Telecommunications)</option>
                    <option value="+879" style="font-size: 0.75rem;">+879 (International Telecommunications Public Correspondoption>
                </select>
                <input type="tel" id="phone-number"  name="phone-number" class="block w-full p-2 pl-2 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" pattern="[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{4}" placeholder="Enter phone number" style="font-size: 0.75rem;">
            </div>
        </div>
        <div class="w-full sm:w-1/2">
            <label for="email" class="block text-xs font-medium mb-2">Email:</label>
            <input type="email" id="email"  email="email"  class="block w-full p-2 pl-10 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500" placeholder="Enter email" style="font-size: 0.75rem;">
        </div>
    </div>
    <button type="submit" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg text-2xl w-full sm:w-1/2 mx-auto">Book Now</button>
</form>
</div>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script>
flatpickr("#date-range", {
    mode: "range",
    dateFormat: "Y-m-d"
});
</script>
<style>
@media (max-width: 768px) {
    .sm\:w-1\/2 {
        width: 45%;
    }
    .sm\:w-1\/4 {
        width: 20%;
    }
    .sm\:p-6 {
        padding: 1rem;
    }
    .sm\:mr-2 {
        margin-right: 0.5rem;
    }
    .sm\:mb-4 {
        margin-bottom: 1rem;
    }
    .sm\:text-xs {
        font-size: 0.75rem;
    }
}
</style>
</body>
</html>
`;