"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2 } from "lucide-react"

interface Ticket {
  id: string
  name: string
  price: string
}

interface TicketFormProps {
  tickets: Ticket[]
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, field: string, value: string) => void
}

export function TicketForm({ tickets, onAdd, onRemove, onChange }: TicketFormProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Tickets</CardTitle>
        <Button size="sm" onClick={onAdd}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Ticket Type
        </Button>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No tickets added yet. Click "Add Ticket Type" to create tickets for this event.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-name-${ticket.id}`}>Ticket Name</Label>
                    <Input
                      id={`ticket-name-${ticket.id}`}
                      value={ticket.name}
                      placeholder="e.g. VIP, Regular, Early Bird"
                      onChange={(e) => onChange(ticket.id, "name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-price-${ticket.id}`}>Price ($)</Label>
                    <Input
                      id={`ticket-price-${ticket.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={ticket.price}
                      placeholder="0.00"
                      onChange={(e) => onChange(ticket.id, "price", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-span-2 flex items-end justify-end pt-6">
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onRemove(ticket.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove ticket</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
