// "use client";

// import { useState } from "react";
// import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
// import { Search, Calendar, MapPin, Users, ChevronLeft, ChevronRight, Clock } from "lucide-react";

// export default function MainDashboardContent() {
//   // State management untuk search, filter, dan tanggal
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedFilter, setSelectedFilter] = useState("all");
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
  
//   // Get tanggal hari ini dan format
//   const today = new Date();
//   const formattedDate = format(today, "EEEE, dd MMMM yyyy");

//   // Data dummy games
//   const games = [
//     {
//       id: 1,
//       title: "Morning Tennis Match",
//       price: "$10",
//       date: new Date(2025, 8, 16), // Sep 16, 2025
//       time: "08:00 AM",
//       location: "Jakarta Tennis Court",
//       players: 3,
//       maxPlayers: 4,
//       level: "Beginner",
//       host: "John Doe",
//       image: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
//     },
//     {
//       id: 2,
//       title: "Weekend Advanced Play",
//       price: "$15",
//       date: new Date(2025, 8, 18), // Sep 18, 2025
//       time: "04:00 PM",
//       location: "Bandung Court",
//       players: 2,
//       maxPlayers: 4,
//       level: "Advanced",
//       host: "Jane Smith",
//       image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
//     },
//     {
//       id: 3,
//       title: "Evening Practice",
//       price: "$8",
//       date: new Date(2025, 8, 20), // Sep 20, 2025
//       time: "06:00 PM",
//       location: "Surabaya Sports Center",
//       players: 1,
//       maxPlayers: 4,
//       level: "Intermediate",
//       host: "Mike Johnson",
//       image: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
//     },
//     {
//       id: 4,
//       title: "Weekend Tournament",
//       price: "$25",
//       date: new Date(2025, 8, 22), // Sep 22, 2025
//       time: "10:00 AM",
//       location: "Central Tennis Club",
//       players: 6,
//       maxPlayers: 8,
//       level: "Advanced",
//       host: "Sarah Wilson",
//       image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
//     }
//   ];

//   // Get semua hari dalam bulan yang dipilih
//   const monthStart = startOfMonth(currentMonth);
//   const monthEnd = endOfMonth(currentMonth);
//   const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

//   // Cek apakah suatu tanggal punya games
//   const hasGames = (date) => {
//     return games.some(game => isSameDay(game.date, date));
//   };

//   // Get games untuk tanggal tertentu
//   const getGamesForDate = (date) => {
//     return games.filter(game => isSameDay(game.date, date));
//   };

//   // Filter games berdasarkan search query dan filter level
//   const filteredGames = getGamesForDate(selectedDate).filter(
//     (game) =>
//       (selectedFilter === "all" || game.level.toLowerCase() === selectedFilter) &&
//       (game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         game.location.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   // Function untuk navigasi bulan sebelumnya dan selanjutnya
//   const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
//   const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

//   return (
//     <div className="space-y-6">
//       {/* Today Box - Menampilkan tanggal hari ini */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex items-center gap-4">
//         <div className="bg-blue-500 p-4 rounded-xl shadow-lg">
//           <Calendar className="text-white" size={28} />
//         </div>
//         <div>
//           <p className="text-blue-600 font-medium">Today</p>
//           <p className="text-2xl font-bold text-gray-800">{formattedDate}</p>
//         </div>
//       </div>

//       {/* Calendar Widget - Widget kalender untuk memilih tanggal */}
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-800">Game Calendar</h3>
//           {/* Navigation bulan */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={prevMonth}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ChevronLeft size={20} className="text-gray-600" />
//             </button>
//             <span className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
//               {format(currentMonth, "MMMM yyyy")}
//             </span>
//             <button
//               onClick={nextMonth}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ChevronRight size={20} className="text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Calendar Grid - Grid kalender */}
//         <div className="grid grid-cols-7 gap-1">
//           {/* Header hari (Sun, Mon, dll) */}
//           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//             <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
//               {day}
//             </div>
//           ))}
          
//           {/* Tanggal-tanggal dalam bulan */}
//           {daysInMonth.map((date) => (
//             <button
//               key={date.toISOString()}
//               onClick={() => setSelectedDate(date)}
//               className={`
//                 p-2 h-12 text-sm rounded-lg transition-all duration-200 relative
//                 ${isSameDay(date, selectedDate) 
//                   ? "bg-blue-500 text-white shadow-md" 
//                   : isToday(date)
//                   ? "bg-blue-100 text-blue-700 font-semibold"
//                   : "hover:bg-gray-100 text-gray-700"
//                 }
//               `}
//             >
//               {format(date, "d")}
//               {/* Indicator dot kalau ada games di tanggal ini */}
//               {hasGames(date) && (
//                 <div className={`
//                   absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full
//                   ${isSameDay(date, selectedDate) ? "bg-white" : "bg-green-500"}
//                 `} />
//               )}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Games Section - Section untuk menampilkan games */}
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Games for {format(selectedDate, "MMMM dd, yyyy")}
//           </h2>
//           {/* Counter jumlah games */}
//           <div className="flex items-center gap-2 text-sm text-gray-500">
//             <Clock size={16} />
//             <span>{filteredGames.length} games available</span>
//           </div>
//         </div>

//         {/* Search Bar - Input untuk search games */}
//         <div className="relative mb-6">
//           <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//           <input
//             type="text"
//             placeholder="Search by game title or location..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           />
//         </div>

//         {/* Filter Buttons - Tombol filter berdasarkan level */}
//         <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
//           {["all", "beginner", "intermediate", "advanced"].map((filter) => (
//             <button
//               key={filter}
//               onClick={() => setSelectedFilter(filter)}
//               className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
//                 selectedFilter === filter
//                   ? "bg-blue-500 text-white shadow-md"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               {filter.charAt(0).toUpperCase() + filter.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Games Grid - Grid untuk menampilkan cards games */}
//         {filteredGames.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {filteredGames.map((game) => (
//               <div
//                 key={game.id}
//                 className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//               >
//                 {/* Game Image */}
//                 <div className="relative">
//                   <img
//                     src={game.image}
//                     alt={game.title}
//                     className="w-full h-40 object-cover"
//                   />
//                   {/* Price badge */}
//                   <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full">
//                     <span className="text-blue-600 font-bold text-sm">
//                       {game.price}
//                     </span>
//                   </div>
//                   {/* Level badge */}
//                   <div className="absolute bottom-3 left-3">
//                     <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
//                       {game.level}
//                     </span>
//                   </div>
//                 </div>
                
//                 {/* Game Details */}
//                 <div className="p-5">
//                   <h3 className="font-bold text-gray-800 text-lg mb-3">
//                     {game.title}
//                   </h3>

//                   {/* Game Info (tanggal, lokasi, players) */}
//                   <div className="space-y-2 text-sm text-gray-600 mb-4">
//                     <div className="flex items-center gap-2">
//                       <Calendar size={14} />
//                       <span>{format(game.date, "MMM dd")} at {game.time}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <MapPin size={14} />
//                       <span>{game.location}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Users size={14} />
//                       <span>{game.players}/{game.maxPlayers} players</span>
//                     </div>
//                   </div>

//                   {/* Host info dan Join button */}
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-500">by {game.host}</span>
//                     <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg">
//                       Join Game
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           // Empty state kalau ga ada games
//           <div className="text-center py-12">
//             <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-500 mb-2">No games found</h3>
//             <p className="text-gray-400">Try selecting a different date or adjusting your filters</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }