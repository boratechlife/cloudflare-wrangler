import widgetHTML from './widget.html';
import exampleHTML from './login.html';
import startHTML from './start.html';
import selectHtml from './select.html';
import confirmHTML from './confirm.html';
import payHtml from './pay.html';

export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Serve the HTML widget
		if (url.pathname === '/') {
			return new Response(widgetHTML, {
				headers: { 'Content-Type': 'text/html' },
			});
		}

		const allRoomsQuery = `SELECT * FROM Rooms`;
		const allRooms = await env.DB.prepare(allRoomsQuery).all();
		//	console.log('All Rooms:', JSON.stringify(allRooms, null, 2));

		if (url.pathname === '/api/selected/hotel' && request.method === 'POST') {
			try {
				const formData = await request.formData();
				const selectedRooms = JSON.parse(formData.get('selected_rooms') as string);
				const totalAmount = parseFloat(formData.get('total_amount') as string);
				const taxAmount = parseFloat(formData.get('tax_amount') as string);

				//   formdata   'booking_id' => '1',
				//   'room_quantity_1' => '2',
				//   'room_quantity_2' => '2',
				//   'room_quantity_3' => '1',
				//   'selected_rooms' => '[{"roomId":"1","quantity":2},{"roomId":"2","quantity":2},{"roomId":"3","quantity":1}]',
				//   'total_amount' => '750',
				//   'tax_amount' => '135'

				// Parse the form data into variables
				const bookingId = parseInt(formData.get('booking_id') as string);
				const selectedRoomsString = formData.get('selected_rooms') as string;
				const totalAmountString = formData.get('total_amount') as string;
				const taxAmountString = formData.get('tax_amount') as string;

				// Update the booking with the selected rooms and amounts
				const updateQuery = `
				UPDATE Bookings 
				SET selected_rooms = ?,
						total_amount = ?,
						tax_amount = ?
				WHERE booking_id = ?
			`;

				await env.DB.prepare(updateQuery)
					.bind(selectedRoomsString, parseFloat(totalAmountString), parseFloat(taxAmountString), bookingId)
					.run();

				//log the row updated by retrieving the booking
				const bookingQuery = `SELECT * FROM Bookings WHERE booking_id = ?`;
				const booking = await env.DB.prepare(bookingQuery).bind(bookingId).first();
				console.log('Updated Booking:', JSON.stringify(booking, null, 2));

				return new Response('', {
					headers: {
						'HX-Redirect': `/confirm/${bookingId}`,
					},
				});
			} catch (error) {
				return new Response(
					`
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
				  <strong class="font-bold">Error!</strong>
				  <span class="block">Failed to update rooms.</span>
				</div>
			  `,
					{
						status: 500,
						headers: { 'Content-Type': 'text/html' },
					}
				);
			}
		}

		// Handle booking updates
		if (url.pathname.startsWith('/update/booking/') && request.method === 'POST') {
			try {
				const bookingId = url.pathname.split('/')[3];
				const formData = await request.formData();
				const data = Object.fromEntries(formData.entries());
				console.log('post update data', formData);
				// Update booking in database
				const updateQuery = `
		UPDATE Bookings 
		SET booking_type = ?,
			start_date = ?,
			end_date = ?,
			room_id = ?
		WHERE booking_id = ?
	  `;

				await env.DB.prepare(updateQuery)
					.bind(data.booking_type, data.start_date, data.end_date, parseInt(data.room_type as string), bookingId)
					.run();

				// Return the updated booking view
				const bookingQuery = `SELECT * FROM Bookings WHERE booking_id = ?`;
				const booking = await env.DB.prepare(bookingQuery).bind(bookingId).first();

				const userQuery = `SELECT * FROM Users WHERE user_id = ?`;
				const user = await env.DB.prepare(userQuery).bind(booking.user_id).first();

				// Redirect to select page
				return new Response('', {
					headers: {
						'HX-Redirect': `/select/${bookingId}`,
					},
				});
			} catch (error) {
				console.log('Error updating booking:', error);
				return new Response(
					`
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
		  <strong class="font-bold">Error!</strong>
		  <span class="block sm:inline">Failed to update booking.</span>
		</div>
	  `,
					{
						headers: { 'Content-Type': 'text/html' },
						status: 500,
					}
				);
			}
		}

		if (url.pathname.startsWith('/api/select/')) {
			try {
				const bookingId = url.pathname.split('/')[3];

				// Get hotels from HotelRooms Table
				const hotelQuery = `SELECT * FROM HotelRooms`;
				const hotels = await env.DB.prepare(hotelQuery).all();
				console.log('All Hotels:', JSON.stringify(hotels, null, 2));

				const htmlResponse = `
		<form hx-post="/api/selected/hotel" method="POST">
			<div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
				<!-- Header -->
				<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<a href="#" class="text-white mr-4 hover:opacity-75 transition-opacity">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
								</svg>
							</a>
							<h1 class="text-xl font-semibold">Select your Room</h1>
						</div>
					</div>
				</div>
				
				<input type="hidden" name="booking_id" value="${bookingId}">

				<!-- Steps -->
				<div class="bg-gray-50 border-b">
					<div class="max-w-4xl mx-auto px-4 py-4">
						<div class="flex justify-between items-center">
							<div class="flex items-center">
								<span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
								<span class="ml-2 text-blue-600 font-medium">Search</span>
							</div>
							<div class="flex-1 mx-4 border-t-2 border-blue-200"></div>
							<div class="flex items-center">
								<span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
								<span class="ml-2 text-blue-600 font-medium">Select</span>
							</div>
							<div class="flex-1 mx-4 border-t-2 border-gray-200"></div>
							<div class="flex items-center opacity-50">
								<span class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm">3</span>
								<span class="ml-2 text-gray-600">Confirm</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Room Options -->
				<div class="p-6 space-y-6">
					${hotels.results
						.map(
							(hotel) => `
						<div class="flex border border-gray-200 rounded-xl overflow-hidden room-option hover:shadow-md transition-shadow duration-300" data-room-id="${hotel.id}" data-price="${hotel.base_price_per_night}">
							<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgfYU86hJHUIgqTO8TCNqOcuHsA9Tpi4WolQ&s" alt="Deluxe Room" class="w-40 h-40 object-cover" />
							<div class="flex-1 p-5">
								<div class="flex justify-between items-start">
									<div>
										<h3 class="text-lg font-semibold text-gray-800">${hotel.name}</h3>
										<div class="flex items-center mt-2">
											<div class="flex text-yellow-400">
												<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
													<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
												</svg>
												<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
													<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
												</svg>
												<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
													<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
												</svg>
												<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
													<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
												</svg>
												<svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
													<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
												</svg>
											</div>
											<span class="text-gray-500 text-sm ml-2">4.5</span>
										</div>
									</div>
									<p class="text-xl font-bold text-blue-600">₹${hotel.base_price_per_night}</p>
								</div>
								<p class="text-gray-600 text-sm mt-3">
									Luxurious accommodation with modern amenities.<br>120 sq ft | Air Conditioning | Free WiFi
								</p>
								<div class="mt-4 flex items-center">
									<label class="text-sm text-gray-600 mr-3">Quantity:</label>
									<input type="number" name="room_quantity_${hotel.id}" value="1" min="0"
										class="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all" 
										data-room-price="${hotel.base_price_per_night}" />
								</div>
							</div>
						</div>
					`
						)
						.join('')}
				</div>

				<!-- Hidden inputs for form submission -->
				<input type="hidden" name="selected_rooms" id="selected_rooms">
				<input type="hidden" name="total_amount" id="total_amount">
				<input type="hidden" name="tax_amount" id="tax_amount">

				<!-- Amount Details -->
				<div class="bg-gray-50 p-6 border-t border-gray-200">
					<div class="max-w-md mx-auto">
						<div class="flex justify-between mb-3">
							<span class="text-gray-600">Total amount</span>
							<span id="total-amount-display" class="font-semibold">₹0</span>
						</div>
						<div class="flex justify-between mb-4">
							<span class="text-gray-600">Tax amount (18%)</span>
							<span id="tax-amount-display" class="font-semibold">₹0</span>
						</div>
						<button type="submit"
							class="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium text-lg shadow-md hover:shadow-lg">
							Confirm Selection
						</button>
					</div>
				</div>

				<!-- Contact Info -->
				<div class="bg-gray-50 p-6 text-center border-t border-gray-200">
					<p class="text-gray-600">Need help? Contact us</p>
					<p class="text-blue-600 font-medium mt-1">+91 123 456 7890</p>
					<p class="text-gray-500 text-sm mt-1">reservations@sangaminternationalhotel.com</p>
				</div>
			</div>

			<script>
				function updateSelection() {
					const selectedRooms = [];
					let totalAmount = 0;
					
					document.querySelectorAll('.room-option').forEach(option => {
						const roomId = option.dataset.roomId;
						const quantity = parseInt(option.querySelector('input[type="number"]').value);
						const price = parseFloat(option.dataset.price);
						
						if (quantity > 0) {
							selectedRooms.push({ roomId, quantity });
							totalAmount += price * quantity;
						}
					});

					const taxAmount = totalAmount * 0.18;
					
					document.getElementById('selected_rooms').value = JSON.stringify(selectedRooms);
					document.getElementById('total_amount').value = totalAmount;
					document.getElementById('tax_amount').value = taxAmount;
					
					document.getElementById('total-amount-display').textContent = '₹' + totalAmount.toFixed(2);
					document.getElementById('tax-amount-display').textContent = '₹' + taxAmount.toFixed(2);
				}

				document.querySelectorAll('input[type="number"]').forEach(input => {
					input.addEventListener('change', updateSelection);
				});

				updateSelection();
			</script>
		</form>
	`;

				return new Response(htmlResponse, {
					headers: { 'Content-Type': 'text/html' },
				});
			} catch (error) {
				return new Response(
					`
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline">Failed to load booking details.</span>
            </div>
        `,
					{
						headers: { 'Content-Type': 'text/html' },
						status: 500,
					}
				);
			}
		}
		// Handle /api/booking-summary/:id route
		if (url.pathname.startsWith('/api/booking-summary/')) {
			try {
				const bookingId = url.pathname.split('/')[3];

				// Get booking details
				const bookingQuery = `SELECT * FROM Bookings WHERE booking_id = ?`;
				const booking = await env.DB.prepare(bookingQuery).bind(bookingId).first();

				if (!booking) {
					return new Response('Booking not found', { status: 404 });
				}

				// Format dates
				const startDate = new Date(booking.start_date).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				});
				const endDate = new Date(booking.end_date).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				});

				// Get selected rooms data
				const selectedRooms = booking.selected_rooms ? JSON.parse(booking.selected_rooms) : [];

				const roomNameQuery = `SELECT room_type FROM Rooms WHERE room_id = ?`;
				const roomDetails = await env.DB.prepare(roomNameQuery).bind(booking.room_id).first();
				const roomName = roomDetails?.room_type || 'Not selected';

				const htmlResponse = `
					<div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
						<!-- Header -->
						<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
							<h2 class="text-2xl font-bold">Booking Summary</h2>
						</div>

						<!-- Booking Details -->
						<div class="p-8 bg-gray-50 border-b">
							<div class="space-y-4">
								<div class="flex items-center">
									<svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
									</svg>
									<div>
										<p class="text-sm text-gray-500">Hotel</p>
										<p class="font-semibold">Sangam International Hotel</p>
									</div>
								</div>

								<div class="flex items-center">
									<svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
									</svg>
									<div>
										<p class="text-sm text-gray-500">Room Type</p>
										<p class="font-semibold">${`${roomName}`}</p>
									</div>
								</div>

								<div class="flex items-center">
									<svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
									</svg>
									<div>
										<p class="text-sm text-gray-500">Stay Duration</p>
										<p class="font-semibold">${startDate} - ${endDate}</p>
									</div>
								</div>

								<div class="flex items-center">
									<svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
									</svg>
									<div>
										<p class="text-sm text-gray-500">Booking Type</p>
										<p class="font-semibold">${booking.booking_type}</p>
									</div>
								</div>
							</div>
						</div>

						<!-- Amount Details -->
						<div class="p-8">
							<h3 class="text-lg font-semibold mb-4">Payment Details</h3>
							<div class="space-y-3">
								<div class="flex justify-between items-center py-2">
									<span class="text-gray-600">Total Amount (incl. taxes)</span>
									<span class="font-semibold">₹${booking.total_amount?.toFixed(2)}</span>
								</div>
								<div class="flex justify-between items-center py-2 border-t">
									<span class="text-gray-600">Tax Amount</span>
									<span class="font-semibold">₹${booking.tax_amount?.toFixed(2)}</span>
								</div>
							</div>
						</div>
					</div>
				`;

				return new Response(htmlResponse, {
					headers: { 'Content-Type': 'text/html' },
				});
			} catch (error) {
				return new Response(
					`
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
				<strong class="font-bold">Error!</strong>
				<span class="block">Failed to load booking summary.</span>
			</div>
		`,
					{
						headers: { 'Content-Type': 'text/html' },
						status: 500,
					}
				);
			}
		}

		// Handle /api/booking-summary/:id route
		if (url.pathname.startsWith('/api/pay-summary/')) {
			try {
				const bookingId = url.pathname.split('/')[3];

				// Get booking details
				const bookingQuery = `SELECT * FROM Bookings WHERE booking_id = ?`;
				const booking = await env.DB.prepare(bookingQuery).bind(bookingId).first();

				if (!booking) {
					return new Response('Booking not found', { status: 404 });
				}

				// Format dates
				const startDate = new Date(booking.start_date).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				});
				const endDate = new Date(booking.end_date).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				});

				// Get selected rooms data
				const selectedRooms = booking.selected_rooms ? JSON.parse(booking.selected_rooms) : [];

				const roomNameQuery = `SELECT room_type FROM Rooms WHERE room_id = ?`;
				const roomDetails = await env.DB.prepare(roomNameQuery).bind(booking.room_id).first();
				const roomName = roomDetails?.room_type || 'Not selected';
				const htmlResponse = `
					<div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8">
						<div class="summary mb-8">
							<h2 class="text-2xl font-bold mb-4">Booking Summary</h2>
							<p class="text-gray-700 mb-2">Hotel: Sangam International Hotel</p>
							<p class="text-gray-700 mb-2">Dates: ${startDate} - ${endDate}</p>
							<p class="text-gray-700 mb-2">Total amount: ₹${booking.total_amount?.toFixed(2)} incl taxes</p>
						</div>

						<div class="payment-options space-y-6">
							<div class="mb-4">
								<label for="amount" class="block text-gray-700 mb-2">Enter booking amount</label>
								<input type="text" id="amount" placeholder="₹1000 or above" 
									class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							</div>

							<div class="option bg-gray-50 p-4 rounded-lg">
								<h3 class="font-semibold mb-3">UPI</h3>
								<input type="text" placeholder="Enter UPI ID" 
									class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							</div>

							<div class="option bg-gray-50 p-4 rounded-lg">
								<h3 class="font-semibold mb-3">Netbanking</h3>
								<div class="space-y-2">
									<label class="flex items-center">
										<input type="radio" name="bank" class="mr-2"> 
										<span>Bank of India</span>
									</label>
									<label class="flex items-center">
										<input type="radio" name="bank" class="mr-2">
										<span>HDFC Bank</span>
									</label>
									<label class="flex items-center">
										<input type="radio" name="bank" class="mr-2">
										<span>ICICI Bank</span>
									</label>
								</div>
							</div>

							<div class="option bg-gray-50 p-4 rounded-lg">
								<h3 class="font-semibold mb-3">Card</h3>
								<div class="space-y-4">
									<input type="text" placeholder="Card Number" 
										class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
									<input type="text" placeholder="Card Holder Name"
										class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
									<div class="card-details grid grid-cols-2 gap-4">
										<input type="text" placeholder="MM/YY"
											class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
										<input type="text" placeholder="CVV"
											class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
									</div>
								</div>
							</div>

							<button class="pay-button w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium text-lg">
								Pay Now
							</button>
						</div>
					</div>
				`;

				return new Response(htmlResponse, {
					headers: { 'Content-Type': 'text/html' },
				});
			} catch (error) {
				return new Response(
					`
					<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						<strong class="font-bold">Error!</strong>
						<span class="block">Failed to load booking summary.</span>
					</div>
				`,
					{
						headers: { 'Content-Type': 'text/html' },
						status: 500,
					}
				);
			}
		}

		// Add this to your fetch handler
		if (url.pathname.startsWith('/api/bookings/')) {
			try {
				const bookingId = url.pathname.split('/')[3];

				console.log('Booking ID:', bookingId);
				const debugQuery = `SELECT * FROM Bookings`;

				const allBookings = await env.DB.prepare(debugQuery).all();

				//console.log('All Bookings:', JSON.stringify(allBookings, null, 2));

				// Or if you want to get a specific booking
				const singleBookingQuery = `SELECT * FROM Bookings WHERE booking_id = ?`;
				const booking = await env.DB.prepare(singleBookingQuery).bind(bookingId).first();

				//Get all users on  Users table and log

				const userQuery = `SELECT * FROM Users WHERE user_id = ?`;
				const user = await env.DB.prepare(userQuery).bind(booking.user_id).first();

				const hotelQuery = `SELECT * FROM Hotels WHERE hotel_id = ?`;
				const hotel = await env.DB.prepare(hotelQuery).bind(booking.hotel_id).first();

				const roomQuery = `SELECT * FROM Rooms WHERE room_id = ?`;
				const room = await env.DB.prepare(roomQuery).bind(booking.room_id).first();

				console.log('User Details:', JSON.stringify(user, null, 2));
				console.log('Hotel Details:', JSON.stringify(hotel, null, 2));

				console.log('Room Details:', JSON.stringify(room, null, 2));

				console.log('Single Booking:', JSON.stringify(booking, null, 2));

				if (!booking) {
					return new Response('Booking not found', { status: 404 });
				}
				const htmlResponse = `
				<body class="min-h-screen bg-gray-50 font-sans">
					<form hx-post="/update/booking/${bookingId}" hx-target="#app" hx-swap="outerHTML" method="POST" class="py-8 px-4">
						<div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
							<!-- Header -->
							<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-4">
										<a href="#" class="text-white hover:opacity-75 transition-opacity">
											<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
											</svg>
										</a>
										<h1 class="text-2xl font-bold">Manage Booking</h1>
									</div>
									<span class="px-4 py-1.5 text-sm font-medium rounded-full ${
										booking.status === 'Confirmed'
											? 'bg-green-500'
											: booking.status === 'Pending'
											? 'bg-yellow-500'
											: booking.status === 'Cancelled'
											? 'bg-red-500'
											: 'bg-gray-500'
									} text-white">${booking.status}</span>
								</div>
							</div>

							<div class="p-8">
								<!-- Booking Header -->
								<div class="flex justify-between items-center mb-8">
									<h2 class="text-2xl font-bold text-gray-800">Booking #${bookingId}</h2>
									<p class="text-sm text-gray-500">Created on ${new Date(booking.created_at).toLocaleDateString()}</p>
								</div>

								<!-- Form Fields -->
								<div class="space-y-6">
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label class="block text-sm font-semibold text-gray-700 mb-2">Booking Type</label>
											<select name="booking_type" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900">
												<option value="Day" ${booking.booking_type === 'Day' ? 'selected' : ''}>Daily</option>
												<option value="Night" ${booking.booking_type === 'Night' ? 'selected' : ''}>Night Only</option>
												<option value="Hourly" ${booking.booking_type === 'Hourly' ? 'selected' : ''}>Hourly</option>
											</select>
										</div>

										<div>
											<label class="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
											<select name="room_type" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900">
												${allRooms.results
													.map(
														(room) => `
													<option value="${room.room_id}" ${booking.room_id === room.room_id ? 'selected' : ''}>${room.room_type}</option>
												`
													)
													.join('')}
											</select>
										</div>

										<div>
											<label class="block text-sm font-semibold text-gray-700 mb-2">Check-in Date</label>
											<input type="date" name="start_date" value="${new Date(booking.start_date).toISOString().split('T')[0]}" 
												class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900">
										</div>

										<div>
											<label class="block text-sm font-semibold text-gray-700 mb-2">Check-out Date</label>
											<input type="date" name="end_date" value="${new Date(booking.end_date).toISOString().split('T')[0]}"
												class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900">
										</div>
									</div>

									<!-- Additional Options -->
									<div class="mt-8">
										<h3 class="text-lg font-semibold text-gray-800 mb-4">Additional Services</h3>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
											<label class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
												<input type="checkbox" name="breakfast" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
												<span class="ml-3 text-gray-700">Breakfast Included</span>
											</label>
											
											<label class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
												<input type="checkbox" name="sightseeing" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
												<span class="ml-3 text-gray-700">1 Day Sightseeing</span>
											</label>
											
											<label class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
												<input type="checkbox" name="pickup" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
												<span class="ml-3 text-gray-700">Airport Pickup</span>
											</label>
											
											<label class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
												<input type="checkbox" name="dinner" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
												<span class="ml-3 text-gray-700">Dinner Included</span>
											</label>
										</div>
									</div>

									<!-- Guest Information -->
									<div class="mt-8 p-6 bg-gray-50 rounded-lg">
										<h3 class="text-lg font-semibold text-gray-800 mb-4">Guest Information</h3>
										<div class="space-y-2">
											<p class="flex items-center text-gray-600">
												<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
												</svg>
												${user.email}
											</p>
											<p class="flex items-center text-gray-600">
												<svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
												</svg>
												${user.phone}
											</p>
										</div>
									</div>
								</div>

								<!-- Submit Button -->
								<div class="mt-8">
									<button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg">
										Update Booking
									</button>
								</div>
							</div>

							<!-- Footer -->
							<div class="bg-gray-50 px-8 py-6 border-t">
								<div class="text-center space-y-2">
									<p class="text-gray-600">Need assistance? Contact our 24/7 support</p>
									<p class="text-blue-600 font-medium">+91 123 456 7890</p>
									<p class="text-gray-500 text-sm">reservations@sangaminternationalhotel.com</p>
								</div>
							</div>
						</div>
					</form>
				</body>
				`;

				return new Response(htmlResponse, {
					headers: { 'Content-Type': 'text/html' },
				});
			} catch (error) {
				return new Response(
					`
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline">Failed to load booking details.</span>
            </div>
        `,
					{
						headers: { 'Content-Type': 'text/html' },
						status: 500,
					}
				);
			}
		}

		if (url.pathname === '/validate' && request.method === 'POST') {
			try {
				const formData = await request.formData();
				const field = Object.keys(formData)[0]; // Get the field being validated

				// Get the target field from headers
				const targetField = request.headers.get('hx-target');
				// Get the value for this specific field
				const fieldValue = formData.get(targetField);
				const value = fieldValue;

				console.log('Validating field:', {
					field: targetField,
					value: fieldValue,
					allFormData: Object.fromEntries(formData.entries()),
				});

				switch (targetField) {
					case 'date-range':
						if (value && value?.length < 1) {
							console.log('date-range', value);
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Date range is required',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'email':
						if (value) {
							const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
							if (!emailPattern.test(value)) {
								return new Response(
									JSON.stringify({
										success: false,
										message: 'Invalid email address',
									}),
									{
										headers: { 'Content-Type': 'application/json' },
									}
								);
							}
						}
						break;

					case 'phone-number':
						const phonePattern = /^[0-9]{9,}$/;
						if (!phonePattern.test(value)) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Invalid phone number format',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'booking-type':
						if (!value) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Please select a booking type',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'room-type':
						if (!value) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Please select a room type',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'adults':
						const adultsNum = parseInt(value);
						if (isNaN(adultsNum) || adultsNum < 1 || adultsNum > 10) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Number of adults must be between 1 and 10',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'children':
						const childrenNum = parseInt(value);
						if (isNaN(childrenNum) || childrenNum < 0 || childrenNum > 10) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Number of children must be between 0 and 10',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'nights':
						const nightsNum = parseInt(value);
						if (isNaN(nightsNum) || nightsNum < 1 || nightsNum > 30) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Number of nights/hours must be between 1 and 30',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'first-name':
						if (!value || value.trim().length < 1) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'First name is required',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;

					case 'last-name':
						if (!value || value.trim().length < 1) {
							return new Response(
								JSON.stringify({
									success: false,
									message: 'Last name is required',
								}),
								{
									headers: { 'Content-Type': 'application/json' },
								}
							);
						}
						break;
				}

				// Validation rules

				// If validation passes
				return new Response(
					JSON.stringify({
						success: true,
						message: 'Valid',
					}),
					{
						headers: { 'Content-Type': 'application/json' },
					}
				);
			} catch (error) {
				return new Response(
					JSON.stringify({
						success: false,
						message: 'Validation failed',
					}),
					{
						headers: { 'Content-Type': 'application/json' },
						status: 500,
					}
				);
			}
		}

		// Handle /start/:id route
		if (url.pathname.startsWith('/start/')) {
			const id = url.pathname.split('/')[2]; // Get the ID from the URL

			// Import start.html from source
			const html = startHTML;

			// Replace a placeholder in the HTML with the actual ID
			// Assuming your HTML has a placeholder like {{id}}
			const modifiedHtml = startHTML.replace('{{id}}', id || 'No ID provided');

			return new Response(modifiedHtml, {
				headers: { 'Content-Type': 'text/html' },
			});
		}
		// add a route to return confirmHTML when the URL is /confirm/:id
		if (url.pathname.startsWith('/confirm/')) {
			const id = url.pathname.split('/')[2]; // Get the ID from the URL

			// Import confirm.html and replace all instances of {{id}}
			let modifiedHtml = confirmHTML;
			// Use replaceAll to replace all instances of {{id}}
			modifiedHtml = modifiedHtml.replaceAll('{{id}}', id || 'No ID provided');

			return new Response(modifiedHtml, {
				headers: { 'Content-Type': 'text/html' },
			});
		}

		// add a route to return confirmHTML when the URL is /confirm/:id
		if (url.pathname.startsWith('/pay/')) {
			const id = url.pathname.split('/')[2]; // Get the ID from the URL

			// Import confirm.html and replace all instances of {{id}}
			let modifiedHtml = payHtml;
			// Use replaceAll to replace all instances of {{id}}
			modifiedHtml = modifiedHtml.replaceAll('{{id}}', id || 'No ID provided');

			return new Response(modifiedHtml, {
				headers: { 'Content-Type': 'text/html' },
			});
		}

		if (url.pathname.startsWith('/select/')) {
			const id = url.pathname.split('/')[2]; // Get the ID from the URL

			// Import start.html from source
			const html = selectHtml;

			// Replace a placeholder in the HTML with the actual ID
			// Assuming your HTML has a placeholder like {{id}}
			const modifiedHtml = selectHtml.replace('{{id}}', id || 'No ID provided');

			return new Response(modifiedHtml, {
				headers: { 'Content-Type': 'text/html' },
			});
		}
		// Handle form submission
		if (url.pathname === '/submit' && request.method === 'POST') {
			try {
				// Parse the form data
				const formData = await request.formData();
				const data = Object.fromEntries(formData.entries());

				const submitteData = Object.fromEntries(formData.entries());
				console.log('Submitted Data:', JSON.stringify(submitteData, null, 2));

				// Validate Date Range
				if (!data['date-range']) {
					return new Response(JSON.stringify({ success: false, message: 'Date range is required.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Booking Type
				if (!data['booking-type']) {
					return new Response(JSON.stringify({ success: false, message: 'Booking type is required.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Room Type
				if (!data['room-type']) {
					return new Response(JSON.stringify({ success: false, message: 'Room type is required.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Number of Adults
				const adults = parseInt(data['adults']);
				if (isNaN(adults) || adults < 1 || adults > 10) {
					return new Response(JSON.stringify({ success: false, message: 'Number of adults must be between 1 and 10.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Number of Children
				const children = parseInt(data['children']);
				if (isNaN(children) || children < 0 || children > 10) {
					return new Response(JSON.stringify({ success: false, message: 'Number of children must be between 0 and 10.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Number of Nights/Hours
				const nights = parseInt(data['nights']);
				if (isNaN(nights) || nights < 1 || nights > 30) {
					return new Response(JSON.stringify({ success: false, message: 'Number of nights/hours must be between 1 and 30.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate First Name
				if (!data['first-name']) {
					return new Response(JSON.stringify({ success: false, message: 'First name is required.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Last Name
				if (!data['last-name']) {
					return new Response(JSON.stringify({ success: false, message: 'Last name is required.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Phone Number
				const phonePattern = /^[0-9]{9,}$/;
				if (!phonePattern.test(data['phone-number'])) {
					return new Response(JSON.stringify({ success: false, message: 'Invalid phone number.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// Validate Email
				const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailPattern.test(data['email'])) {
					return new Response(JSON.stringify({ success: false, message: 'Invalid email address.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}

				// If all validations pass, proceed to save the booking
				const query = `
					INSERT INTO Bookings (
						booking_type, 
						booking_source, 
						start_date, 
						end_date, 
						date_flexibility, 
						earliest_date, 
						latest_date, 
						total_price, 
						status, 
						user_id, 
						hotel_id, 
						room_id
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`;

				await env.DB.prepare(query);
				// First define the variables at the top of your fetch function
				const userId = '1'; // or get this from your data/params
				const hotelId = '1'; // or get this from your data/params
				const roomId = '1'; // or get this from your data/params
				const status = 'Pending'; // or get this from your data/params

				await env.DB.prepare(query)
					.bind(
						data['booking-type'],
						data['booking-source'] || 'Website',
						data['start-date'] || '2025-01-25',
						data['end-date'] || '2025-01-26',
						data['date-flexibility'] === 'true',
						data['earliest-date'] || null,
						data['latest-date'] || null,
						typeof data['total-price'] === 'string' ? parseFloat(data['total-price']) : 0,
						status,
						parseInt(userId), // replaced '1' with variable
						parseInt(hotelId), // replaced '1' with variable
						parseInt(roomId) // replaced '1' with variable
					)
					.run();

				// Return a success response
				// Get the last inserted booking ID
				const lastBookingQuery = `SELECT last_insert_rowid() as id`;
				const lastBooking = await env.DB.prepare(lastBookingQuery).first();
				const bookingId = lastBooking.id;

				return new Response('', {
					headers: {
						'HX-Redirect': `/start/${bookingId}`,
					},
				});
			} catch (error) {
				console.error('Error saving booking:', error);
				return new Response(JSON.stringify({ success: false, message: 'Failed to save booking.', error: error.message }), {
					headers: { 'Content-Type': 'application/json' },
					status: 500,
				});
			}
		}
		// Handle unknown routes
		return new Response('Not Found', { status: 404 });
	},
};
