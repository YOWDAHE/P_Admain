"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
	() => import("react-leaflet").then((mod) => mod.MapContainer),
	{ ssr: false }
);

const TileLayer = dynamic(
	() => import("react-leaflet").then((mod) => mod.TileLayer),
	{ ssr: false }
);

const Marker = dynamic(
	() => import("react-leaflet").then((mod) => mod.Marker),
	{ ssr: false }
);

const Popup = dynamic(
	() => import("react-leaflet").then((mod) => mod.Popup),
	{ ssr: false }
);

// L.Icon.Default.mergeOptions({
// 	iconRetinaUrl:
// 		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
// 	iconUrl:
// 		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
// 	shadowUrl:
// 		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

const isBrowser = () => typeof window !== "undefined";

const LocationInputWithMap = ({
	label,
	value,
	onChange,
}: {
	label: string;
	value: { name?: string; latitude?: number; longitude?: number };
	onChange: (location: {
		name: string;
		latitude: number;
		longitude: number;
	}) => void;
}) => {
	const [popupVisible, setPopupVisible] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [selectedResult, setSelectedResult] = useState<any | null>(null);
	const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
	const mapRef = useRef<any | null>(null);
	const markerRef = useRef<any | null>(null);
	const debounceTimeout = useRef<any>(null);
	const [searchProvider, setSearchProvider] = useState<any>(null);
	const [leafletLoaded, setLeafletLoaded] = useState(false);

	// Initialize Leaflet and search provider only on client side
	useEffect(() => {
		if (!isBrowser()) return;
		
		// Dynamic import for Leaflet
		import('leaflet').then((L) => {
			// Fix Leaflet marker icons
			delete (L.Icon.Default.prototype as any)._getIconUrl;

			L.Icon.Default.mergeOptions({
				iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
				iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
				shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
			});
			
			setLeafletLoaded(true);
		});
		
		// Dynamic import for search provider
		import('leaflet-geosearch').then(({ OpenStreetMapProvider }) => {
			setSearchProvider(new OpenStreetMapProvider());
		});
	}, []);

	// Debounce the search input
	const debouncedSearch = (query: string) => {
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}

		debounceTimeout.current = setTimeout(async () => {
			if (!query || !searchProvider) {
				setSearchResults([]);
				return;
			}

			try {
				const results = await searchProvider.search({ query });
				console.log("Searched: ", results);
				setSearchResults(results);
			} catch (error) {
				console.error("Error searching location:", error);
				setSearchResults([]);
			}
		}, 100);
	};

	// Handle search input change
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		debouncedSearch(query);
	};

	// Handle result selection
	const handleSelect = (result: any) => {
		setSelectedResult(result);
		setMapCenter([result.y, result.x]);
		setSearchResults([]);
	};

	// Add the geosearch control to the map when it's ready
	useEffect(() => {
		if (!mapRef.current || !searchProvider || !isBrowser()) return;

		// Dynamic import for GeoSearchControl
		import('leaflet-geosearch').then(({ GeoSearchControl }) => {
			import('leaflet').then((L) => {
				// Type assertion to fix the linter error
				const searchControl = new (GeoSearchControl as any)({
					provider: searchProvider,
					style: "button",
					showMarker: false,
					showPopup: false,
					autoClose: true,
					keepResult: true,
					updateMap: true,
					marker: {
						icon: L.icon({
							iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
							shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
						}),
						panToResult: true,
					},
				});

				mapRef.current.addControl(searchControl);
			});
		});

		return () => {
			if (mapRef.current?.controls) {
				mapRef.current.removeControl(mapRef.current.controls[0]);
			}
		};
	}, [searchProvider, mapRef.current]);

	// Update map center when selectedResult changes
	useEffect(() => {
		if (selectedResult && mapRef.current) {
			setMapCenter([selectedResult.y, selectedResult.x]);
			mapRef.current.flyTo([selectedResult.y, selectedResult.x], 13);
		}
	}, [selectedResult]);

	// Center map on selected value
	useEffect(() => {
		if (popupVisible && mapRef.current && value.latitude && value.longitude) {
			mapRef.current.setView([value.latitude, value.longitude], 13);
			markerRef.current?.openPopup();
		}
	}, [popupVisible, value]);

	return (
		<div>
			<Label htmlFor="location">{label}</Label>
			<Input
				id="location"
				name="location"
				placeholder="Enter event location"
				value={value.name || ""}
				onClick={() => setPopupVisible(true)}
				readOnly
				required
			/>
			{popupVisible && leafletLoaded && (
				<div
					className="absolute z-50 inset-0 bg-black bg-opacity-70 flex items-center justify-center p-10"
					onClick={() => {
						setPopupVisible(false);
						setSelectedResult(null);
						setSearchResults([]);
					}}
				>
					<div
						className="bg-white rounded-md shadow-md p-6 w-full max-w-2xl max-h-full overflow-hidden relative"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-4 relative">
							<Input
								type="text"
								placeholder="Search for a place"
								value={searchQuery}
								onChange={handleInputChange}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										if (searchResults.length > 0) {
											handleSelect(searchResults[0]);
										} else {
											alert("No results found.");
										}
									}
								}}
								autoFocus
								className="w-full"
							/>
							{searchResults.length > 0 && (
								<div className="absolute top-15 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
									{searchResults.map((result, index) => (
										<div
											key={index}
											className="p-2 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-100"
											onClick={() => handleSelect(result)}
										>
											<span className="text-sm">{result.label}</span>
										</div>
									))}
								</div>
							)}
						</div>
						<div className="h-96 w-full relative z-10">
							<MapContainer
								center={mapCenter}
								zoom={13}
								style={{ height: "100%", width: "100%" }}
								ref={mapRef}
							>
								<TileLayer
									attribution='&copy; <a href="">OpenStreetMap</a> contributors'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								{selectedResult ? (
									<Marker
										position={[selectedResult.y, selectedResult.x]}
										ref={markerRef}
									>
										<Popup>
											<span>{selectedResult.label}</span>
										</Popup>
									</Marker>
								) : value.latitude && value.longitude ? (
									<Marker position={[value.latitude, value.longitude]} ref={markerRef}>
										<Popup>
											<span>{value.name}</span>
										</Popup>
									</Marker>
								) : null}
							</MapContainer>
						</div>
						<div className="mt-4 flex justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setPopupVisible(false);
									setSelectedResult(null);
									setSearchResults([]);
								}}
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={() => {
									if (selectedResult) {
										onChange({
											name: selectedResult.label,
											latitude: selectedResult.y,
											longitude: selectedResult.x,
										});
										setPopupVisible(false);
										setSelectedResult(null);
										setSearchResults([]);
									} else {
										alert("Please select a location.");
									}
								}}
							>
								Confirm
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LocationInputWithMap;
