"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { MapPin, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Script from "next/script"

// Declare the google variable
declare global {
  interface Window {
    google: any
  }
}

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

interface LocationSearchProps {
  onSelect: (location: Location) => void
  selectedLocation?: Location | null
}

// Google Maps API key - in a real app, this would be an environment variable
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"

export function LocationSearch({ onSelect, selectedLocation }: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([])
  const [selectedLocationState, setSelectedLocationState] = useState<Location | null>(selectedLocation || null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Initialize Google Maps when the dialog opens
  useEffect(() => {
    if (!isOpen || !isLoaded || !mapRef.current) return

    // Initialize the map
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 40.7128, lng: -74.006 }, // Default to New York
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    }

    // Create the map
    const map = new window.google.maps.Map(mapRef.current, mapOptions)
    mapInstanceRef.current = map

    // Initialize Places service
    placesServiceRef.current = new window.google.maps.places.PlacesService(map)

    // Initialize Autocomplete
    if (inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"],
      })
      autocomplete.bindTo("bounds", map)
      autocompleteRef.current = autocomplete

      // Listen for place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (!place.geometry || !place.geometry.location) {
          toast({
            title: "Error",
            description: "No details available for this place",
            variant: "destructive",
          })
          return
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null))
        markersRef.current = []

        // Add marker for the selected place
        const marker = new window.google.maps.Marker({
          map,
          position: place.geometry.location,
          animation: window.google.maps.Animation.DROP,
        })
        markersRef.current.push(marker)

        // Center map on the selected place
        map.setCenter(place.geometry.location)
        map.setZoom(17)

        // Add to search results
        if (place) {
          setSearchResults([place])
        }
      })
    }

    // If there's a selected location, show it on the map
    if (selectedLocationState) {
      const position = {
        lat: selectedLocationState.latitude,
        lng: selectedLocationState.longitude,
      }
      const marker = new window.google.maps.Marker({
        map,
        position,
        animation: window.google.maps.Animation.DROP,
      })
      markersRef.current.push(marker)
      map.setCenter(position)
      map.setZoom(17)
    }

    return () => {
      // Clean up markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
    }
  }, [isOpen, isLoaded, selectedLocationState, toast])

  // Handle search
  const handleSearch = () => {
    if (!placesServiceRef.current || !mapInstanceRef.current || !searchTerm.trim()) return

    setIsLoading(true)
    const request: google.maps.places.TextSearchRequest = {
      query: searchTerm,
      fields: ["name", "geometry", "formatted_address"],
    }

    placesServiceRef.current.textSearch(request, (results, status) => {
      setIsLoading(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchResults(results)

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null))
        markersRef.current = []

        // Add markers for all results
        results.forEach((place) => {
          if (place.geometry && place.geometry.location) {
            const marker = new window.google.maps.Marker({
              map: mapInstanceRef.current,
              position: place.geometry.location,
              animation: window.google.maps.Animation.DROP,
            })
            markersRef.current.push(marker)
          }
        })

        // Fit map to show all markers
        if (results.length > 0 && mapInstanceRef.current) {
          const bounds = new window.google.maps.LatLngBounds()
          results.forEach((place) => {
            if (place.geometry && place.geometry.location) {
              bounds.extend(place.geometry.location)
            }
          })
          mapInstanceRef.current.fitBounds(bounds)
        }
      } else {
        setSearchResults([])
        toast({
          title: "No results found",
          description: "Try a different search term",
        })
      }
    })
  }

  const handleLocationSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry || !place.geometry.location) {
      toast({
        title: "Error",
        description: "No location data available for this place",
        variant: "destructive",
      })
      return
    }

    // Extract address components
    let city = ""
    let state = ""
    let country = ""
    const address = place.formatted_address || ""

    if (place.address_components) {
      place.address_components.forEach((component) => {
        if (component.types.includes("locality")) {
          city = component.long_name
        } else if (component.types.includes("administrative_area_level_1")) {
          state = component.short_name
        } else if (component.types.includes("country")) {
          country = component.long_name
        }
      })
    }

    // Create location object
    const location: Location = {
      id: place.place_id || `loc_${Date.now()}`,
      name: place.name || "Selected Location",
      address,
      city,
      state,
      country,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    }

    setSelectedLocationState(location)
    onSelect(location)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label>Location</Label>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between text-left font-normal">
            {selectedLocationState ? (
              <span className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {selectedLocationState.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Select a location</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search for a location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search for venues, addresses, cities..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1"
                onClick={handleSearch}
                disabled={isLoading || !searchTerm.trim()}
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Map container */}
            <div
              ref={mapRef}
              className="w-full h-[300px] rounded-md bg-muted overflow-hidden"
              aria-label="Google Map"
            ></div>

            {/* Search results */}
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {searchResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {isLoading ? "Searching..." : "Search for a location or select on the map"}
                </p>
              ) : (
                searchResults.map((place) => (
                  <div
                    key={place.place_id}
                    className="flex items-start p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleLocationSelect(place)}
                  >
                    <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{place.name}</p>
                      <p className="text-sm text-muted-foreground">{place.formatted_address}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedLocationState && (
        <p className="text-sm text-muted-foreground">
          {selectedLocationState.address}
          {selectedLocationState.city && `, ${selectedLocationState.city}`}
          {selectedLocationState.state && `, ${selectedLocationState.state}`}
          {selectedLocationState.country && `, ${selectedLocationState.country}`}
        </p>
      )}

      {/* Load Google Maps API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}
